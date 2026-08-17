const mongoose = require('mongoose')

const farmLandSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  plotName: String,
  area: Number,
  village: String,
  district: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('FarmLand', farmLandSchema)
