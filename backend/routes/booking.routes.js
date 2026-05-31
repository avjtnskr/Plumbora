const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const {
  createBooking, getMyBookings, getBooking,
  updateBooking, cancelBooking, getAllBookings,
  assignTechnician, sendBookingEmail,
} = require('../controllers/booking.controller');

// Protected (customer)
router.post('/',      protect, createBooking);
router.get('/my',     protect, getMyBookings);
router.get('/:id',    protect, getBooking);
router.put('/:id',    protect, adminOnly, updateBooking);
router.delete('/:id', protect, cancelBooking);

// Admin only
router.get('/',                  protect, adminOnly, getAllBookings);
router.put('/:id/assign',        protect, adminOnly, assignTechnician);
router.post('/:id/send-email',   protect, adminOnly, sendBookingEmail);

module.exports = router;
