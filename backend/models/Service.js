const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true,
  },
  serviceDescription: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
  },
  serviceCharges: {
    type: Number,
    required: [true, 'Service charges are required'],
    min: [0, 'Service charges cannot be negative'],
  },
  category: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

ServiceSchema.virtual('name').get(function () {
  return this.serviceName;
});

ServiceSchema.virtual('description').get(function () {
  return this.serviceDescription;
});

ServiceSchema.virtual('price').get(function () {
  return this.serviceCharges;
});

ServiceSchema.set('toJSON', { virtuals: true });
ServiceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Service', ServiceSchema);
