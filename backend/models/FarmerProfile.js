const mongoose = require('mongoose')

const farmerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  name: String,
  phone: String,
  district: String,
  village: String,
  pincode: String,
  lat: Number,
  lon: Number,
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema)
