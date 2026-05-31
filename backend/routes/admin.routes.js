const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const User    = require('../models/User');
const Booking = require('../models/Booking');
const Plumber = require('../models/Plumber');
const Service = require('../models/Service');

// All admin routes are protected
router.use(protect, adminOnly);

// ── GET DASHBOARD STATS ───────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [users, plumbers, services, bookings, completed, pending, confirmed, inProgress, cancelled, paidBookings] = await Promise.all([
      User.countDocuments(),
      Plumber.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'in-progress' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.countDocuments({ paymentStatus: 'paid' }),
    ]);
    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    res.json({
      success: true,
      stats: {
        users, plumbers, services, bookings,
        completed, pending, confirmed, inProgress, cancelled,
        paidBookings,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET ALL USERS ─────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE USER ───────────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin users cannot be deleted from this screen' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
