const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createReview, getPlumberReviews, getMyReviews, getRecentReviews,
  updateReview, deleteReview,
} = require('../controllers/review.controller');

router.post('/',                        protect, createReview);
router.get('/recent',                   getRecentReviews);
router.get('/my',                       protect, getMyReviews);
router.get('/plumber/:plumberId',               getPlumberReviews);
router.put('/:id',                      protect, updateReview);
router.delete('/:id',                   protect, deleteReview);

module.exports = router;
