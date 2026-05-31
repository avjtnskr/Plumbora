const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Service = require('./models/Service');
const Plumber = require('./models/Plumber');
const User = require('./models/User');
const defaultServices = require('./data/defaultServices');
const defaultAdmin = require('./data/defaultAdmin');

dotenv.config();

const seed = async () => {
  await connectDB();

  await Service.deleteMany();
  await Plumber.deleteMany();

  const services = await Service.insertMany(defaultServices);

  const existingAdmin = await User.findOne({ email: defaultAdmin.email }).select('+password');
  if (existingAdmin) {
    existingAdmin.firstName = defaultAdmin.firstName;
    existingAdmin.lastName = defaultAdmin.lastName;
    existingAdmin.mobile = defaultAdmin.mobile;
    existingAdmin.address = defaultAdmin.address;
    existingAdmin.role = 'admin';
    existingAdmin.password = defaultAdmin.password;
    existingAdmin.markModified('password');
    await existingAdmin.save();
  } else {
    await User.create(defaultAdmin);
  }

  console.log(`Seeded ${services.length} services and 1 admin user`);
  await mongoose.disconnect();
};

const clear = async () => {
  await connectDB();
  await Service.deleteMany();
  await Plumber.deleteMany();
  console.log('Cleared services and technicians');
  await mongoose.disconnect();
};

if (require.main === module) {
  const run = process.argv.includes('--clear') ? clear : seed;

  run().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });
}

module.exports = { seed, clear };
