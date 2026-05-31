const Review  = require('../models/Review');
const Booking = require('../models/Booking');

// ── CREATE REVIEW ─────────────────────────────────────────
// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { plumber, booking, rating, comment } = req.body;
    const cleanComment = String(comment || '').trim();
    const cleanRating = Number(rating);

    // Check booking belongs to user and is completed
    const bookingDoc = await Booking.findById(booking);
    if (!bookingDoc || bookingDoc.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised to review this booking' });
    if (bookingDoc.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    if (bookingDoc.plumber.toString() !== plumber)
      return res.status(400).json({ success: false, message: 'Review technician does not match this booking' });
    if (!Number.isInteger(cleanRating) || cleanRating < 1 || cleanRating > 5)
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    if (!cleanComment)
      return res.status(400).json({ success: false, message: 'Review comment is required' });

    // Prevent duplicate review
    const existing = await Review.findOne({ user: req.user.id, booking });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });

    const review = await Review.create({
      user: req.user.id,
      plumber,
      booking,
      rating: cleanRating,
      comment: cleanComment,
    });
    await review.populate('user', 'firstName lastName');
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── GET REVIEWS FOR A PLUMBER ─────────────────────────────
// GET /api/reviews/plumber/:plumberId
exports.getPlumberReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ plumber: req.params.plumberId })
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET RECENT REVIEWS ───────────────────────────────────
// GET /api/reviews/recent
exports.getRecentReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'firstName lastName city')
      .populate('plumber', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 6);
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET MY REVIEWS ────────────────────────────────────────
// GET /api/reviews/my
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('plumber', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE REVIEW ─────────────────────────────────────────
// PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorised' });

    review.rating  = req.body.rating  || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE REVIEW ─────────────────────────────────────────
// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorised' });

    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
