const mongoose = require('mongoose');
const Diagnosis = require('../models/Diagnosis');
const geminiService = require('../services/geminiService');

exports.diagnoseCrop = async (req, res) => {
  try {
    const { userId, cropType, symptoms } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!userId || !cropType) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and crop type are required' 
      });
    }


    const prompt = `Analyze this agricultural issue:
    Crop: ${cropType}
    Symptoms: ${symptoms || 'Visual inspection from image'}
    
    Provide a detailed diagnosis including:
    1. Most likely disease or pest (with confidence level)
    2. Severity assessment
    3. Immediate treatment recommendations
    4. Long-term prevention strategies
    
    Format as JSON with keys: disease, confidence, severity, treatment, prevention`;

    const aiResponse = await geminiService.askGemini(prompt);
    
    let diagnosisResult;
    try {
      if (typeof aiResponse === 'string') {
        diagnosisResult = JSON.parse(aiResponse);
      } else if (typeof aiResponse === 'object' && aiResponse !== null) {
        diagnosisResult = aiResponse;
      } else {
        diagnosisResult = {
          disease: 'Requires Expert Review',
          confidence: 0.7,
          severity: 'Moderate',
          treatment: String(aiResponse).substring(0, 200),
          prevention: 'Consult local agricultural expert'
        };
      }
    } catch (e) {
      diagnosisResult = {
        disease: 'Requires Expert Review',
        confidence: 0.7,
        severity: 'Moderate',
        treatment: (typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse)).substring(0, 200),
        prevention: 'Consult local agricultural expert'
      };
    }

    const isValidObjectId = userId && 
                            userId !== 'USER' && 
                            userId !== 'ADMIN' && 
                            userId !== 'guest' &&
                            mongoose.Types.ObjectId.isValid(userId) && 
                            userId.toString().length === 24;

    let diagnosis = null;
    if (isValidObjectId) {
      diagnosis = new Diagnosis({
        userId,
        cropType,
        imageUrl,
        symptoms,
        diagnosis: diagnosisResult
      });

      await diagnosis.save();
    }

    res.json({
      success: true,
      message: 'Diagnosis completed successfully',
      data: diagnosis || {
        userId: userId || 'guest',
        cropType,
        imageUrl,
        symptoms,
        diagnosis: diagnosisResult,
        createdAt: new Date()
      },
      saved: isValidObjectId // Indicate whether it was saved to database
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete diagnosis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};