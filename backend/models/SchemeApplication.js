const mongoose = require('mongoose')

const schemeApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  schemeId: String,
  schemeName: String,
  status: { type: String, enum: ['submitted','approved','rejected','pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('SchemeApplication', schemeApplicationSchema)
