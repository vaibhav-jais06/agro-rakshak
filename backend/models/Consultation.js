const mongoose = require('mongoose')

const consultationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Consultation', consultationSchema)
