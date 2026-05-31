const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String, required: [true, 'First name is required'], trim: true,
  },
  lastName: {
    type: String, required: [true, 'Last name is required'], trim: true,
  },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
  },
  password: {
    type: String, required: [true, 'Password is required'], minlength: 6, select: false,
  },
  mobile: { type: String, required: [true, 'Mobile number is required'], trim: true },
  address: { type: String, required: [true, 'Address is required'], trim: true },
  city: { type: String, trim: true },
  pincode: { type: String, trim: true },
  role: {
    type: String, enum: ['customer', 'admin'], default: 'customer',
  },
  createdAt: { type: Date, default: Date.now },
},
{ timestamps: true });

UserSchema.virtual('name')
  .get(function () {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  })
  .set(function (value) {
    const [firstName, ...rest] = String(value || '').trim().split(/\s+/);
    this.firstName = firstName || this.firstName;
    this.lastName = rest.join(' ') || this.lastName;
  });

UserSchema.virtual('phone')
  .get(function () {
    return this.mobile;
  })
  .set(function (value) {
    this.mobile = value;
  });

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
