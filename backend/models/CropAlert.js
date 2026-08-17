const mongoose = require('mongoose');

const cropAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  message: String,
  region: String,
  weatherData: {
    temperature: Number,
    humidity: Number,
    condition: String,
    windSpeed: Number,
    rainfall: Number,
    pressure: Number
  },
  recommendations: [{
    name: String,
    suitability: String,
    reason: String,
    sowingWindow: String,
    expectedYield: String
  }],
  notSuitable: [{
    name: String,
    reason: String
  }],
  additionalAdvice: String,
  read: {
    type: Boolean,
    default: false
  },
  dismissed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cropAlertSchema.index({ userId: 1, createdAt: -1 });
cropAlertSchema.index({ userId: 1, dismissed: 1 });

module.exports = mongoose.model('CropAlert', cropAlertSchema);
