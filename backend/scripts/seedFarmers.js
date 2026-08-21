const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' }); // Make sure we load the correct .env

const seedFarmers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const defaultPassword = await bcrypt.hash('12344321', 10);

    const farmers = [
      {
        name: 'Ram Singh',
        username: 'ramsingh',
        phone: '9876543210',
        password: defaultPassword,
        role: 'user',
        location: {
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Mullanpur',
          coordinates: { latitude: 30.900965, longitude: 75.857277 }
        },
        farmDetails: {
          landArea: 15,
          soilType: 'Loamy',
          crops: ['Wheat', 'Paddy', 'Mustard'],
          irrigationType: 'Canal'
        },
        preferredLanguage: 'hi-IN'
      },
      {
        name: 'Suresh Patel',
        username: 'sureshpatel',
        phone: '9123456789',
        password: defaultPassword,
        role: 'user',
        location: {
          state: 'Gujarat',
          district: 'Ahmedabad',
          village: 'Sanand',
          coordinates: { latitude: 22.9868, longitude: 72.3995 }
        },
        farmDetails: {
          landArea: 20,
          soilType: 'Sandy',
          crops: ['Cotton', 'Groundnut'],
          irrigationType: 'Drip'
        },
        preferredLanguage: 'hi-IN'
      },
      {
        name: 'Harish Kumar',
        username: 'harishkumar',
        phone: '9988776655',
        password: defaultPassword,
        role: 'user',
        location: {
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          village: 'Riyawa',
          coordinates: { latitude: 25.3176, longitude: 82.9739 }
        },
        farmDetails: {
          landArea: 5,
          soilType: 'Clay',
          crops: ['Sugarcane', 'Potato', 'Rice'],
          irrigationType: 'Borewell'
        },
        preferredLanguage: 'hi-IN'
      },
      {
        name: 'Ramesh Yadav',
        username: 'rameshyadav',
        phone: '8877665544',
        password: defaultPassword,
        role: 'user',
        location: {
          state: 'Maharashtra',
          district: 'Nashik',
          village: 'Lasalgaon',
          coordinates: { latitude: 20.1444, longitude: 74.2235 }
        },
        farmDetails: {
          landArea: 12,
          soilType: 'Black Cotton',
          crops: ['Onion', 'Grapes', 'Soybean'],
          irrigationType: 'Sprinkler'
        },
        preferredLanguage: 'hi-IN'
      }
    ];

    for (const farmer of farmers) {
      const existing = await User.findOne({ username: farmer.username });
      if (existing) {
        await User.updateOne({ username: farmer.username }, farmer);
        console.log(`Updated farmer: ${farmer.name} (${farmer.username})`);
      } else {
        await new User(farmer).save();
        console.log(`Created farmer: ${farmer.name} (${farmer.username})`);
      }
    }

    console.log('\n--- Realistic Farmer Profiles Seeded ---');
    console.log('All farmers have the password: 12344321');
    farmers.forEach(f => console.log(`Username: ${f.username} | Phone: ${f.phone} | Crops: ${f.farmDetails.crops.join(', ')}`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding farmers:', error);
    process.exit(1);
  }
};

seedFarmers();
