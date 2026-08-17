const mongoose = require('mongoose');

const SoilAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  locationName: { type: String },
  coordinates: {
    lat: Number,
    lon: Number
  },
  input: {
    ph: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organicMatter: Number,
    moisture: Number,
    soilType: String,
    temperature: Number
  },
  recommendations: { type: Array, default: [] },
  external: {
    agro: { type: Object, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model('SoilAnalysis', SoilAnalysisSchema);

