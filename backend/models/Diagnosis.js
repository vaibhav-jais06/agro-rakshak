const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  cropType: {
    type: String,
    required: true
  },
  imageUrl: String,
  symptoms: String,
  diagnosis: {
    disease: String,
    confidence: Number,
    severity: String,
    treatment: String,
    prevention: String
  },
  // Store complete AI analysis for detailed insights
  aiAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
diagnosisSchema.index({ userId: 1, createdAt: -1 });
diagnosisSchema.index({ 'diagnosis.disease': 1 });

module.exports = mongoose.model('Diagnosis', diagnosisSchema);