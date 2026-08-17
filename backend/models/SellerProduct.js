const mongoose = require('mongoose')

const sellerProductSchema = new mongoose.Schema({
  sellerId: { type: String },
  sellerName: { type: String },
  name: { type: String, required: true },
  category: { type: String },
  price: { type: Number, required: true },
  unit: { type: String, default: 'unit' },
  brand: { type: String },
  inStock: { type: Boolean, default: true },
  imageUrl: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('SellerProduct', sellerProductSchema)
