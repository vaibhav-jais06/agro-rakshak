const mongoose = require('mongoose')

const farmerCropSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  land: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmLand' },
  name: { type: String, required: true },
  area: Number,
  season: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('FarmerCrop', farmerCropSchema)
