const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  title: String,
  amount: Number,
  type: { type: String, enum: ['income','expense'], default: 'expense' },
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Transaction', transactionSchema)
