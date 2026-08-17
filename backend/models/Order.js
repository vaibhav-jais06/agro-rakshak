const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  productId: { type: String },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
}, { _id: false })

const addressSchema = new mongoose.Schema({
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String,
  phone: String
}, { _id: false })

const orderSchema = new mongoose.Schema({
  userId: { type: String },
  userName: { type: String },
  items: { type: [orderItemSchema], default: [] },
  total: { type: Number, required: true },
  shippingAddress: { type: addressSchema },
  status: { type: String, enum: ['pending','paid','shipped','delivered','cancelled'], default: 'pending' },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
