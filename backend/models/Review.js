const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
  },
  plumber: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Plumber', required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Booking',
  },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
},
{ timestamps: true });

// Update plumber rating after review save
ReviewSchema.post('save', async function () {
  const Plumber = require('./Plumber');
  const reviews = await this.constructor.find({ plumber: this.plumber });
  const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await Plumber.findByIdAndUpdate(this.plumber, {
    rating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length,
  });
});

module.exports = mongoose.model('Review', ReviewSchema);
