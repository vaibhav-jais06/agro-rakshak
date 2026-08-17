const mongoose = require('mongoose')

const farmerAnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  data: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('FarmerAnalytics', farmerAnalyticsSchema)
