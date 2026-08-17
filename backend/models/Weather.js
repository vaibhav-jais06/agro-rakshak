const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  temperature: {
    current: Number,
    min: Number,
    max: Number
  },
  humidity: Number,
  rainfall: Number,
  windSpeed: Number,
  condition: String,
  forecast: [{
    date: Date,
    tempMin: Number,
    tempMax: Number,
    condition: String,
    rainfall: Number
  }]
});

module.exports = mongoose.model('Weather', weatherSchema);