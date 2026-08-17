const mongoose = require('mongoose')

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  bank: String,
  principal: Number,
  balance: Number,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Loan', loanSchema)
