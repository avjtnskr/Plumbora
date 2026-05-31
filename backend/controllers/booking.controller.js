const Booking = require('../models/Booking');
const Plumber = require('../models/Plumber');
const Service = require('../models/Service');
const { sendEmail } = require('../utils/email');
const bookingEmailTemplate = require('../templates/bookingEmail.template');

const populateBooking = (query) => query
  .populate('user', 'firstName lastName email mobile')
  .populate('plumber', 'name phone email specialization rating')
  .populate('service', 'serviceName serviceCharges serviceDescription');

const MIN_BOOKING_LEAD_MINUTES = 30;
const INDIA_TIMEZONE_OFFSET = '+05:30';
const BOOKING_DATE_TIME_ERROR = 'Enter a future date and time, minimum after 30 minutes from now.';

const getScheduledAt = (bookingDate, bookingTime) => {
  const datePart = String(bookingDate || '').slice(0, 10);
  const timePart = String(bookingTime || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart) || !/^\d{2}:\d{2}$/.test(timePart)) {
    return null;
  }

  const scheduledAt = new Date(`${datePart}T${timePart}:00${INDIA_TIMEZONE_OFFSET}`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
};

const validateBookingDateTime = (bookingDate, bookingTime) => {
  const scheduledAt = getScheduledAt(bookingDate, bookingTime);
  if (!scheduledAt) return 'Please select a valid booking date and time.';

  const minimumTime = new Date(Date.now() + MIN_BOOKING_LEAD_MINUTES * 60 * 1000);
  if (scheduledAt < minimumTime) {
    return BOOKING_DATE_TIME_ERROR;
  }

  return '';
};

const serializeBooking = (booking) => {
  const item = booking.toObject ? booking.toObject({ virtuals: true }) : booking;
  const serviceDoc = item.service && typeof item.service === 'object' ? item.service : null;

  return {
    ...item,
    serviceId: serviceDoc?._id || item.service,
    service: serviceDoc?.serviceName || item.serviceName,
    amount: item.amount || serviceDoc?.serviceCharges || 0,
    address: item.serviceAddress,
    description: item.problemDetails,
  };
};

// ── CREATE BOOKING ────────────────────────────────────────
// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      plumber, serviceId, problemDetails, serviceAddress,
      city, pincode, bookingDate, bookingTime,
    } = req.body;

    const dateTimeError = validateBookingDateTime(bookingDate, bookingTime);
    if (dateTimeError) return res.status(400).json({ success: false, message: dateTimeError });

    const plumberExists = await Plumber.findById(plumber);
    if (!plumberExists) return res.status(404).json({ success: false, message: 'Plumber not found' });

    const serviceDoc = await Service.findById(serviceId);
    if (!serviceDoc) return res.status(404).json({ success: false, message: 'Service not found' });
    if (plumberExists.service.toString() !== serviceDoc._id.toString()) {
      return res.status(400).json({ success: false, message: 'Technician does not provide this service' });
    }

    const booking = await Booking.create({
      user: req.user.id,
      plumber,
      service: serviceDoc._id,
      problemDetails,
      serviceAddress,
      bookingDate,
      bookingTime,
      booked: true,
      city,
      pincode,
      amount: serviceDoc.serviceCharges,
    });

    await booking.populate(['user', 'plumber', 'service']);
    res.status(201).json({ success: true, booking: serializeBooking(booking) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── GET MY BOOKINGS ───────────────────────────────────────
// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await populateBooking(Booking.find({ user: req.user.id }))
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings: bookings.map(serializeBooking) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET SINGLE BOOKING ────────────────────────────────────
// GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await populateBooking(Booking.findById(req.params.id));
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only owner or admin can view
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorised' });

    res.json({ success: true, booking: serializeBooking(booking) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE BOOKING STATUS ─────────────────────────────────
// PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const {
      status, notes, adminNotes, amount, finalAmount,
      paymentStatus, cashCollected,
    } = req.body;
    const update = {
      status,
      notes,
      adminNotes,
      amount,
      finalAmount,
      paymentStatus,
      cashCollected,
    };
    if (status === 'cancelled') update.booked = false;
    if (paymentStatus === 'paid' || cashCollected === true) {
      update.cashCollected = true;
      update.paymentStatus = 'paid';
      update.isPaid = true;
    }
    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const booking = await populateBooking(Booking.findByIdAndUpdate(
      req.params.id, update,
      { new: true, runValidators: true }
    ));

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Update plumber totalJobs if completed
    if (status === 'completed') {
      await Plumber.findByIdAndUpdate(booking.plumber._id, { $inc: { totalJobs: 1 } });
    }

    res.json({ success: true, booking: serializeBooking(booking) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── ASSIGN / CHANGE TECHNICIAN (Admin) ───────────────────
// PUT /api/bookings/:id/assign
exports.assignTechnician = async (req, res) => {
  try {
    const { plumber, adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const technician = await Plumber.findById(plumber);
    if (!technician) return res.status(404).json({ success: false, message: 'Technician not found' });
    if (technician.service.toString() !== booking.service.toString()) {
      return res.status(400).json({ success: false, message: 'Technician does not provide this booking service' });
    }

    booking.plumber = technician._id;
    booking.adminNotes = adminNotes ?? booking.adminNotes;
    booking.assignedAt = new Date();
    await booking.save();

    await booking.populate(['user', 'plumber', 'service']);
    res.json({ success: true, booking: serializeBooking(booking) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── SEND STRUCTURED EMAIL TO TECHNICIAN (Admin) ───────────
// POST /api/bookings/:id/send-email
exports.sendBookingEmail = async (req, res) => {
  try {
    const booking = await populateBooking(Booking.findById(req.params.id));
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!booking.plumber?.email) {
      return res.status(400).json({ success: false, message: 'Technician email not found' });
    }

    if (req.body.adminNotes !== undefined) {
      booking.adminNotes = req.body.adminNotes;
      await booking.save();
      await booking.populate(['user', 'plumber', 'service']);
    }

    const serviceName = booking.service?.serviceName || 'Plumbing Service';
    const subject = `New Booking Assigned - ${serviceName}`;
    const html = bookingEmailTemplate(booking);
    const result = await sendEmail({
      to: booking.plumber.email,
      subject,
      html,
      text: `New booking assigned: ${serviceName}. Booking ID: ${booking._id}`,
    });

    if (result.preview) {
      return res.status(400).json({
        success: false,
        message: `Email was not sent because SMTP is not configured. Missing: ${result.missing.join(', ')}`,
      });
    }

    booking.emailSent = true;
    booking.emailSentAt = new Date();
    booking.emailRecipient = booking.plumber.email;
    booking.status = booking.status === 'pending' ? 'confirmed' : booking.status;
    booking.assignedAt = booking.assignedAt || new Date();
    await booking.save();
    await booking.populate(['user', 'plumber', 'service']);

    res.json({
      success: true,
      message: `Email sent to ${booking.plumber.email}`,
      preview: false,
      email: {
        to: booking.plumber.email,
        messageId: result.messageId,
        accepted: result.accepted || [],
        rejected: result.rejected || [],
      },
      booking: serializeBooking(booking),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CANCEL BOOKING ────────────────────────────────────────
// DELETE /api/bookings/:id
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorised' });

    booking.status = 'cancelled';
    booking.booked = false;
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET ALL BOOKINGS (Admin) ──────────────────────────────
// GET /api/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await populateBooking(Booking.find()).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings: bookings.map(serializeBooking) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
