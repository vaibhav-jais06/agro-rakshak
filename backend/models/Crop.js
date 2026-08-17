const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  scientificName: String,
  category: {
    type: String,
    enum: ['Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Cash Crop', 'Spice']
  },
  season: {
    type: String,
    enum: ['Kharif', 'Rabi', 'Zaid']
  },
  soilRequirement: [String],
  waterRequirement: String,
  temperature: {
    min: Number,
    max: Number
  },
  duration: Number, // in days
  yieldPotential: Number, // quintals per acre
  diseases: [{
    name: String,
    symptoms: String,
    treatment: String
  }],
  fertilizers: [{
    type: String,
    quantity: String,
    timing: String
  }]
});

module.exports = mongoose.model('Crop', cropSchema);