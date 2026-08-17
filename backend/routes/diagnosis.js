const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Diagnosis = require('../models/Diagnosis');

// Configure multer for image upload
const uploadDir = path.join(__dirname, '../uploads/diagnosis');
// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-z0-9.-]/gi, '_');
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Diagnose crop disease using AI
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { userId, cropType, symptoms, analysisType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image file is required' 
      });
    }

    const imageUrl = req.file.path;
    const imagePath = path.resolve(imageUrl);

    let analyzeAgricultureImage;
    try {
      const mod = await import('../lib/utils.mjs');
      analyzeAgricultureImage = mod.analyzeAgricultureImage;
    } catch (importErr) {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set on server');
      }
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const imageToBase64 = (p) => fs.readFileSync(p).toString('base64');
      const getMimeType = (p) => {
        const ext = path.extname(p).toLowerCase();
        const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
        return map[ext] || 'image/jpeg';
      };
      analyzeAgricultureImage = async (imgPath, type = 'plant') => {
        const mime = getMimeType(imgPath);
        const b64 = imageToBase64(imgPath);
        const systemPrompt = type === 'soil' ? `You are an expert soil scientist. Analyze the soil image and return JSON only.` : `You are an expert agricultural scientist. Analyze the image and return JSON only.`;
        const parts = [{ inlineData: { mimeType: mime, data: b64 } }, { text: systemPrompt }];
        const models = ['gemini-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
        let text = '';
        let usedModel = null;
        let lastErr;
        for (const m of models) {
          try {
            const model = genAI.getGenerativeModel({ model: m, generationConfig: { temperature: 0.7, maxOutputTokens: 2048, topP: 1 } });
            const result = await model.generateContent(parts);
            text = result.response.text();
            usedModel = m;
            if (text) break;
          } catch (e) {
            lastErr = e;
          }
        }
        if (!text) throw lastErr || new Error('No response from Gemini');
        let json;
        try {
          const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          json = JSON.parse(cleaned);
        } catch (_) {
          const match = text.match(/\{[\s\S]*\}/);
          if (!match) throw new Error('Failed to extract JSON from AI response');
          let s = match[0]
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*'([^']*)'/g, ': "$1"')
            .replace(/\[\s*'([^']*)'/g, '["$1"')
            .replace(/,\s*'([^']*)'/g, ', "$1"')
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/[\x00-\x1F\x7F]/g, ' ');
          json = JSON.parse(s);
        }
        return {
          success: true,
          data: json,
          metadata: { analysisType: type, timestamp: new Date().toISOString(), modelUsed: usedModel || 'gemini-flash-latest', provider: 'Google Gemini' }
        };
      };
    }
    
    // Perform AI analysis
    const aiAnalysis = await analyzeAgricultureImage(
      imagePath, 
      analysisType || 'plant'
    );

    if (!aiAnalysis.success) {
      return res.status(500).json({
        success: false,
        message: 'AI analysis failed',
        error: aiAnalysis.error,
        fallback: aiAnalysis.fallback
      });
    }

    // Extract relevant data from AI response
    const aiData = aiAnalysis.data;
    
    // Prepare diagnosis data for database
    const diagnosisData = {
      disease: aiData.diagnosis?.primaryIssue || 'Analysis Complete',
      confidence: (aiData.diagnosis?.confidence || aiData.plant?.confidenceScore || 0) / 100,
      severity: aiData.diagnosis?.severity || 'Unknown',
      treatment: formatTreatments(aiData.treatment),
      prevention: formatPrevention(aiData.prevention)
    };

    // Check if userId is a valid MongoDB ObjectId
    // If not (e.g., "USER" or "ADMIN" from default login), skip saving to database
    const isValidObjectId = userId && 
                            userId !== 'USER' && 
                            userId !== 'ADMIN' && 
                            userId !== 'guest' &&
                            mongoose.Types.ObjectId.isValid(userId) && 
                            userId.toString().length === 24;

    let diagnosis = null;
    if (isValidObjectId) {
      // Create diagnosis record only if userId is a valid ObjectId
      diagnosis = new Diagnosis({
        userId,
        cropType: cropType || aiData.plant?.species || 'Unknown',
        imageUrl: `/uploads/diagnosis/${req.file.filename}`,
        symptoms: symptoms || aiData.diagnosis?.symptoms?.join(', ') || '',
        diagnosis: diagnosisData,
        // Store complete AI analysis for future reference
        aiAnalysis: aiData
      });

      await diagnosis.save();
    }

    res.json({
      success: true,
      data: diagnosis || {
        // Return analysis data even if not saved to DB
        userId: userId || 'guest',
        cropType: cropType || aiData.plant?.species || 'Unknown',
        imageUrl: `/uploads/diagnosis/${req.file.filename}`,
        symptoms: symptoms || aiData.diagnosis?.symptoms?.join(', ') || '',
        diagnosis: diagnosisData,
        aiAnalysis: aiData,
        createdAt: new Date()
      },
      analysis: aiData,
      metadata: aiAnalysis.metadata,
      saved: isValidObjectId // Indicate whether it was saved to database
    });
  } catch (error) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to format treatments
function formatTreatments(treatment) {
  if (!treatment) return 'No specific treatment recommended';
  
  const parts = [];
  
  if (treatment.immediateActions?.length) {
    parts.push('Immediate: ' + treatment.immediateActions.join(', '));
  }
  
  if (treatment.organicTreatments?.length) {
    const organic = treatment.organicTreatments[0];
    parts.push(`Organic: ${organic.name} - ${organic.application}`);
  }
  
  if (treatment.chemicalTreatments?.length) {
    const chemical = treatment.chemicalTreatments[0];
    parts.push(`Chemical: ${chemical.name} @ ${chemical.dosage}`);
  }
  
  return parts.join(' | ') || 'Follow preventive measures';
}

// Helper function to format prevention
function formatPrevention(prevention) {
  if (!prevention) return 'Maintain good agricultural practices';
  
  const parts = [];
  
  if (prevention.culturalPractices?.length) {
    parts.push(prevention.culturalPractices.slice(0, 2).join(', '));
  }
  
  if (prevention.environmentalManagement?.length) {
    parts.push(prevention.environmentalManagement.slice(0, 2).join(', '));
  }
  
  return parts.join(' | ') || 'Regular monitoring recommended';
}

// Get diagnosis history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if userId is a valid MongoDB ObjectId
    const isValidObjectId = userId && 
                            userId !== 'USER' && 
                            userId !== 'ADMIN' && 
                            userId !== 'guest' &&
                            mongoose.Types.ObjectId.isValid(userId) && 
                            userId.toString().length === 24;

    if (!isValidObjectId) {
      // Return empty array for default users (USER/ADMIN) or invalid IDs
      return res.json({
        success: true,
        data: [],
        message: 'No diagnosis history available for this user'
      });
    }

    const diagnoses = await Diagnosis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: diagnoses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Voice Assistant Endpoint
router.post('/voice-assist', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    
    let askVoiceAssistant;
    try {
      const mod = await import('../lib/utils.mjs');
      askVoiceAssistant = mod.askVoiceAssistant;
    } catch (importErr) {
      throw new Error('Failed to import utils.mjs');
    }

    const responseText = await askVoiceAssistant(prompt);
    res.json({ success: true, text: responseText });
  } catch (error) {
    console.error('Voice assist error:', error);
    res.status(500).json({ success: false, message: 'Voice assist failed', error: error.message });
  }
});

module.exports = router;
