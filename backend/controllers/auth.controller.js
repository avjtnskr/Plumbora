const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const splitName = (name = '') => {
  const [firstName, ...rest] = String(name).trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};

const cleanString = (value = '') => String(value).trim();

const normalizeEmail = (email = '') => cleanString(email).toLowerCase();

const normalizeIndianMobile = (mobile = '') => {
  const digits = String(mobile).replace(/\D/g, '');
  const localNumber = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(localNumber)) return '';
  return `+91${localNumber}`;
};

const toAuthUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  address: user.address,
  city: user.city,
  pincode: user.pincode,
  role: user.role,
});

// ── REGISTER ─────────────────────────────────────────────
// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      name, firstName, lastName, email, password,
      mobile, address, city, pincode,
    } = req.body;
    const nameParts = splitName(name);
    const finalFirstName = cleanString(firstName || nameParts.firstName);
    const finalLastName = cleanString(lastName || nameParts.lastName);
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = cleanString(password);
    const cleanMobile = normalizeIndianMobile(mobile);
    const cleanAddress = cleanString(address);
    const cleanCity = cleanString(city);
    const cleanPincode = cleanString(pincode);

    if (!finalFirstName || !finalLastName || !cleanEmail || !cleanPassword || !cleanMobile || !cleanAddress) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, valid mobile number, address, and password are required.',
      });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      firstName: finalFirstName,
      lastName: finalLastName,
      email: cleanEmail,
      password: cleanPassword,
      mobile: cleanMobile,
      address: cleanAddress,
      city: cleanCity,
      pincode: cleanPincode,
    });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, token, user: toAuthUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = cleanString(req.body.password);
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: toAuthUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET PROFILE ───────────────────────────────────────────
// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────
// PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { name, firstName, lastName, mobile, address, city, pincode } = req.body;
    const update = {
      mobile: mobile === undefined ? undefined : normalizeIndianMobile(mobile),
      address: address === undefined ? undefined : cleanString(address),
      city: city === undefined ? undefined : cleanString(city),
      pincode: pincode === undefined ? undefined : cleanString(pincode),
    };

    if (mobile !== undefined && !update.mobile) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    if (name) {
      const nameParts = splitName(name);
      update.firstName = cleanString(firstName || nameParts.firstName);
      update.lastName = cleanString(lastName || nameParts.lastName);
    } else {
      update.firstName = firstName === undefined ? undefined : cleanString(firstName);
      update.lastName = lastName === undefined ? undefined : cleanString(lastName);
    }

    Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      update,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────
// PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE ACCOUNT ────────────────────────────────────────
// DELETE /api/auth/me
exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
