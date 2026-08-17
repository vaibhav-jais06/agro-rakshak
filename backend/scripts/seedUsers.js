const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    try {
      await User.collection.dropIndex('phone_1');
      console.log('Dropped existing phone index');
    } catch (err) {
      // Index might not exist, that's okay
      if (err.code !== 27) { // 27 is IndexNotFound error
        console.log('Note: Could not drop phone index (may not exist)');
      }
    }

    // Delete any existing users with null phone (to avoid unique constraint issues)
    await User.deleteMany({ phone: null });
    // Also delete existing admin and user accounts if they exist
    await User.deleteMany({ username: { $in: ['admin', 'user'] } });
    console.log('Cleaned up existing accounts');

    // Recreate the phone index with proper sparse settings
    try {
      await User.collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
      console.log('Recreated phone index with sparse unique constraint');
    } catch (err) {
      console.log('Note: Could not recreate phone index:', err.message);
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin', 10);
    const userPassword = await bcrypt.hash('user', 10);

    // Create admin user (don't include phone field at all)
    const adminData = {
      name: 'Administrator',
      username: 'admin',
      password: adminPassword,
      role: 'admin'
    };
    const admin = new User(adminData);
    // Ensure phone is not in the document
    delete admin._doc.phone;
    await admin.save();

    // Create regular user (don't include phone field at all)
    const userData = {
      name: 'Regular User',
      username: 'user',
      password: userPassword,
      role: 'user'
    };
    const user = new User(userData);
    // Ensure phone is not in the document
    delete user._doc.phone;
    await user.save();

    console.log('✅ Users seeded successfully:');
    console.log('Admin - Username: admin, Password: admin');
    console.log('User - Username: user, Password: user');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();

