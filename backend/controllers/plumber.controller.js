const Plumber = require('../models/Plumber');

const duplicateEmailMessage = 'A technician with this email already exists. Use another email or edit the existing technician.';

const isDuplicateEmailError = (err) => err?.code === 11000 && err?.keyPattern?.email;

// ── GET ALL PLUMBERS ──────────────────────────────────────
// GET /api/plumbers
exports.getPlumbers = async (req, res) => {
  try {
    const { city, availability, specialisation, specialization, serviceId, sort } = req.query;
    const filter = { isActive: true };

    if (city)           filter.city           = new RegExp(city, 'i');
    if (availability)   filter.availability   = availability;
    if (specialisation || specialization) filter.specialization = new RegExp(specialisation || specialization, 'i');
    if (serviceId)      filter.service        = serviceId;

    let query = Plumber.find(filter);
    if (sort === 'rating')   query = query.sort({ rating: -1 });
    if (sort === 'jobs')     query = query.sort({ totalJobs: -1 });
    if (sort === 'price')    query = query.sort({ pricePerHour: 1 });

    const plumbers = await query.populate('service', 'serviceName serviceCharges serviceDescription');
    res.json({ success: true, count: plumbers.length, plumbers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET ALL TECHNICIANS (Admin) ──────────────────────────
// GET /api/plumbers/admin/all
exports.getAllTechnicians = async (req, res) => {
  try {
    const technicians = await Plumber.find()
      .populate('service', 'serviceName serviceCharges serviceDescription')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: technicians.length, plumbers: technicians, technicians });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET SINGLE PLUMBER ────────────────────────────────────
// GET /api/plumbers/:id
exports.getPlumber = async (req, res) => {
  try {
    const plumber = await Plumber.findById(req.params.id).populate('service', 'serviceName serviceCharges serviceDescription');
    if (!plumber) return res.status(404).json({ success: false, message: 'Plumber not found' });
    res.json({ success: true, plumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE PLUMBER (Admin) ────────────────────────────────
// POST /api/plumbers
exports.createPlumber = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      specialization: req.body.specialization || req.body.specialisation,
      service: req.body.service || req.body.serviceId,
    };
    const plumber = await Plumber.create(payload);
    res.status(201).json({ success: true, plumber });
  } catch (err) {
    if (isDuplicateEmailError(err)) {
      return res.status(409).json({ success: false, message: duplicateEmailMessage });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── UPDATE PLUMBER (Admin) ────────────────────────────────
// PUT /api/plumbers/:id
exports.updatePlumber = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      specialization: req.body.specialization || req.body.specialisation,
      service: req.body.service || req.body.serviceId,
    };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    const plumber = await Plumber.findByIdAndUpdate(req.params.id, payload, {
      new: true, runValidators: true,
    });
    if (!plumber) return res.status(404).json({ success: false, message: 'Plumber not found' });
    res.json({ success: true, plumber });
  } catch (err) {
    if (isDuplicateEmailError(err)) {
      return res.status(409).json({ success: false, message: duplicateEmailMessage });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE PLUMBER (Admin) ────────────────────────────────
// DELETE /api/plumbers/:id
exports.deletePlumber = async (req, res) => {
  try {
    const plumber = await Plumber.findByIdAndUpdate(
      req.params.id,
      { isActive: false, availability: 'offline' },
      { new: true }
    );
    if (!plumber) return res.status(404).json({ success: false, message: 'Plumber not found' });
    res.json({ success: true, message: 'Technician deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE AVAILABILITY ───────────────────────────────────
// PATCH /api/plumbers/:id/availability
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const plumber = await Plumber.findByIdAndUpdate(
      req.params.id, { availability }, { new: true }
    );
    res.json({ success: true, plumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
