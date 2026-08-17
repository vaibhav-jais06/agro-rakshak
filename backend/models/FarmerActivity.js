const mongoose = require('mongoose')

const farmerActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  crop: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmerCrop', index: true, required: false },
  note: String,
  type: { type: String, enum: ['note', 'fertilizer_reminder'], default: 'note', index: true },
  cropName: String,
  soilType: String,
  scheduleDay: Number,
  startDate: Date,
  scheduledDate: Date,
  notifyDate: { type: Date, index: true },
  stage: String,
  dose: String,
  instruction: String,
  sent: { type: Boolean, default: false, index: true },
  completed: { type: Boolean, default: false, index: true },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('FarmerActivity', farmerActivitySchema)
