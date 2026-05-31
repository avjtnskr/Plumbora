module.exports = {
  firstName: 'Admin',
  lastName: 'User',
  email: process.env.ADMIN_EMAIL || 'admin@plumbora.local',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
  mobile: process.env.ADMIN_MOBILE || '+91 90000 00000',
  address: 'Plumbora Admin Office',
  role: 'admin',
};
