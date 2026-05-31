const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
  },
  plumber: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Plumber', required: true,
  },
  service:      { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  problemDetails: { type: String, required: true, trim: true },
  serviceAddress: { type: String, required: true, trim: true },
  bookingDate: { type: Date, required: true },
  bookingTime: { type: String, required: true, trim: true },
  booked:      { type: Boolean, default: true },
  city:         { type: String, required: true },
  pincode:      { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  amount:       { type: Number, default: 0 },
  finalAmount:  { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
  },
  cashCollected: { type: Boolean, default: false },
  isPaid:       { type: Boolean, default: false },
  notes:        { type: String },
  adminNotes:   { type: String, trim: true },
  assignedAt:   { type: Date },
  emailSent:    { type: Boolean, default: false },
  emailSentAt:  { type: Date },
  emailRecipient: { type: String, trim: true },
},
{ timestamps: true });

BookingSchema.virtual('scheduledAt').get(function () {
  if (!this.bookingDate || !this.bookingTime) return null;
  const date = new Date(this.bookingDate);
  const [hours, minutes] = this.bookingTime.split(':');
  date.setHours(Number(hours || 0), Number(minutes || 0), 0, 0);
  return date;
});

BookingSchema.virtual('address').get(function () {
  return this.serviceAddress;
});

BookingSchema.virtual('description').get(function () {
  return this.problemDetails;
});

BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

BookingSchema.pre('validate', function (next) {
  if (!this.amount && this.populated('service') && this.service?.serviceCharges) {
    this.amount = this.service.serviceCharges;
  }
  if (!this.finalAmount && this.amount) this.finalAmount = this.amount;
  this.isPaid = this.paymentStatus === 'paid' || this.cashCollected;
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
