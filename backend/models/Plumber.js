const mongoose = require('mongoose');

const PlumberSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  phone:        { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  specialization: { type: String, required: true, trim: true },
  skills:       [{ type: String }],
  experience:   { type: Number, required: true, min: 0 },
  service:      { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  location:     { type: String, required: true },
  city:         { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  availability: {
    type: String, enum: ['online', 'busy', 'offline'], default: 'offline',
  },
  rating:       { type: Number, default: 0 },
  totalJobs:    { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isVerified:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
},
{ timestamps: true });

PlumberSchema.virtual('specialisation')
  .get(function () {
    return this.specialization;
  })
  .set(function (value) {
    this.specialization = value;
  });

PlumberSchema.virtual('serviceId').get(function () {
  return this.service;
});

PlumberSchema.set('toJSON', { virtuals: true });
PlumberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Plumber', PlumberSchema, 'technicians');
