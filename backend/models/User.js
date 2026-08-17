const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    sparse: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    sparse: true,
    unique: true,
    match: /^[6-9]\d{9}$/
  },
  email: {
    type: String,
    sparse: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  location: {
    state: String,
    district: String,
    village: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  farmDetails: {
    landArea: Number, // in acres
    soilType: String,
    crops: [String],
    irrigationType: String
  },
  preferredLanguage: {
    type: String,
    default: 'hi-IN'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ username: 1 });
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);
