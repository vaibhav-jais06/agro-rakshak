// Frontend Crop Analysis Service - Using Google Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

let genAI = null;

// Initialize Gemini client
function getGeminiClient() {
  if (!genAI && GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Crop analysis will not work.');
  }
  return genAI;
}

function sanitizeText(text) {
  return String(text || '')
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/```/g, '')
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .trim();
}

async function generateWithRetries(client, parts, models, maxAttempts = 3) {
  let attempt = 0;
  let lastError;
  while (attempt < maxAttempts) {
    for (const m of models) {
      try {
        const model = client.getGenerativeModel({
          model: m,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048, topP: 1 }
        });
        const result = await model.generateContent(parts);
        const resp = result.response;
        const txt = resp && resp.text ? resp.text() : resp?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n');
        if (txt && String(txt).trim().length) {
          return { text: String(txt), usedModel: m };
        }
      } catch (e) {
        lastError = e;
      }
    }
    await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));
    attempt += 1;
  }
  throw lastError || new Error('No response received from Gemini API');
}

async function repairJsonViaGemini(client, rawText, analysisType) {
  const schemaHint = analysisType === 'soil' ? 'soil' : 'plant';
  const prompt = `Format the following content into STRICT JSON only for ${schemaHint} analysis. No markdown. Ensure arrays and strings use double quotes and remove trailing commas. Content:` + '\n' + rawText;
  const parts = [{ text: prompt }];
  const models = ['gemini-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
  const { text } = await generateWithRetries(client, parts, models, 2);
  return sanitizeText(text);
}

const PLANT_ANALYSIS_PROMPT = `You are an expert agricultural scientist. Analyze the image and return JSON only.

Detect: plant/soil/field/mixed. For plants: identify species, health (Healthy/Stressed/Diseased/Critically Ill), diseases/pests/deficiencies, severity (Mild/Moderate/Severe/Critical), confidence 0-100. For soil: type (Clay/Sandy/Loamy), color, texture, moisture (Dry/Optimal/Waterlogged), issues, health score 0-100.

Return JSON:
{
  "imageType": "plant|soil|field|mixed",
  "plant": {"identified": bool, "species": "name", "cropType": "type", "healthStatus": "status", "confidenceScore": 0-100},
  "diagnosis": {"hasIssue": bool, "primaryIssue": "name", "scientificName": "name", "causativeAgent": "Fungal|Bacterial|Viral|Pest|Nutrient Deficiency|Environmental Stress", "severity": "level", "affectedParts": ["parts"], "symptoms": ["symptom"], "stage": "Early|Progressive|Advanced", "confidence": 0-100},
  "soil": {"analyzed": bool, "type": "type", "color": "desc", "texture": "desc", "moistureLevel": "level", "visibleIssues": ["issue"], "healthScore": 0-100},
  "treatment": {"urgency": "Low|Medium|High|Critical", "immediateActions": ["action"], "organicTreatments": [{"name": "name", "ingredients": ["ing"], "preparation": "how", "application": "how", "dosage": "amount", "frequency": "how often", "duration": "period"}], "chemicalTreatments": [{"name": "name", "type": "Fungicide|Insecticide|Bactericide|Fertilizer", "dosage": "amount", "application": "method", "frequency": "schedule", "precautions": ["safety"], "waitingPeriod": "days"}], "supportiveMeasures": ["measure"]},
  "prevention": {"culturalPractices": ["practice"], "preventiveSprays": [{"product": "name", "timing": "when", "frequency": "how often"}], "environmentalManagement": ["tip"], "resistantVarieties": ["variety"], "monitoringTips": ["tip"]},
  "recommendations": {"nutrientManagement": {"deficiencies": ["nutrient"], "fertilizers": ["type"], "applicationRate": "amount"}, "irrigation": {"currentAssessment": "status", "recommendation": "adjustment", "frequency": "how often"}, "recovery": {"expectedTimeline": "time", "successIndicators": ["sign"], "followUpActions": ["action"]}, "expertConsultation": {"needed": bool, "reason": "why", "urgency": "timeframe"}},
  "summary": "2-3 sentence summary"
}

Rules: JSON only, no markdown. Prioritize organic solutions. Use metric units. Consider Indian agriculture. If unclear, low confidence.`;

const SOIL_ANALYSIS_PROMPT = `You are an expert soil scientist. Analyze the soil image and return JSON only.

Assess: type, texture (Fine/Medium/Coarse), color, structure (Granular/Blocky/Platy), organic matter level (Low/Medium/High), moisture (Dry/Optimal/Wet/Waterlogged), health score 0-100, issues, suitable crops, improvements needed, fertilization needs.

Return JSON:
{
  "soilType": "classification",
  "texture": "description",
  "color": "description",
  "structure": "type",
  "organicMatter": {"level": "Low|Medium|High", "indicators": ["indicator"], "recommendation": "how to improve"},
  "moisture": {"level": "Dry|Optimal|Wet|Waterlogged", "assessment": "appropriate?", "recommendation": "advice"},
  "healthScore": 0-100,
  "issues": [{"issue": "problem", "severity": "Low|Medium|High", "impact": "effect", "solution": "fix"}],
  "suitableFor": ["crop"],
  "improvements": [{"action": "what", "method": "how", "materials": ["material"], "expectedOutcome": "result", "timeline": "duration"}],
  "fertilization": {"primaryNeeds": ["N|P|K"], "organicOptions": ["option"], "chemicalOptions": ["NPK"], "applicationRate": "amount"},
  "summary": "2-3 sentence assessment"
}

Rules: JSON only, no markdown. Use metric units. Consider Indian soil types.`;

/**
 * Convert File object to base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get MIME type from file
 */
function getMimeType(file) {
  if (file.type) {
    return file.type;
  }
  const name = file.name.toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  for (const [ext, mime] of Object.entries(mimeTypes)) {
    if (name.endsWith(ext)) {
      return mime;
    }
  }
  return 'image/jpeg';
}

/**
 * Create fallback response for errors
 */
function createFallbackResponse(errorMessage, analysisType) {
  return {
    imageType: analysisType === 'soil' ? 'soil' : 'plant',
    plant: {
      identified: false,
      species: 'Unable to identify',
      cropType: 'Unknown',
      healthStatus: 'Unable to assess',
      confidenceScore: 0,
    },
    diagnosis: {
      hasIssue: false,
      primaryIssue: 'Analysis could not be completed',
      scientificName: 'N/A',
      causativeAgent: 'N/A',
      severity: 'Unknown',
      affectedParts: [],
      symptoms: [],
      stage: 'Unknown',
      confidence: 0,
    },
    soil: {
      analyzed: false,
      type: 'Unknown',
      color: 'Unable to assess',
      texture: 'Unable to assess',
      moistureLevel: 'Unknown',
      visibleIssues: [],
      healthScore: 0,
    },
    treatment: {
      urgency: 'Unknown',
      immediateActions: ['Please retry the analysis or contact support'],
      organicTreatments: [],
      chemicalTreatments: [],
      supportiveMeasures: [],
    },
    prevention: {
      culturalPractices: [],
      preventiveSprays: [],
      environmentalManagement: [],
      resistantVarieties: [],
      monitoringTips: [],
    },
    recommendations: {
      nutrientManagement: {
        deficiencies: [],
        fertilizers: [],
        applicationRate: 'N/A',
      },
      irrigation: {
        currentAssessment: 'Unknown',
        recommendation: 'Needs manual assessment',
        frequency: 'N/A',
      },
      recovery: {
        expectedTimeline: 'Unable to estimate',
        successIndicators: [],
        followUpActions: ['Retry analysis with clearer image'],
      },
      expertConsultation: {
        needed: true,
        reason: errorMessage,
        urgency: 'As needed',
      },
    },
    summary: 'Analysis could not be completed. Please try again or contact support for assistance.',
  };
}

/**
 * Analyze agriculture image using Google Gemini AI
 */
export async function analyzeAgricultureImage(imageFile, analysisType = 'auto') {
  try {
    const client = getGeminiClient();
    
    if (!client) {
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env');
    }

    if (!imageFile) {
      throw new Error('Image file is required');
    }

    console.log('[Crop Analysis] Starting analysis with Google Gemini');
    console.log('[Crop Analysis] Analysis type:', analysisType);

    const mimeType = getMimeType(imageFile);
    const base64Image = await fileToBase64(imageFile);

    let systemPrompt;
    if (analysisType === 'soil') {
      systemPrompt = SOIL_ANALYSIS_PROMPT;
    } else {
      systemPrompt = PLANT_ANALYSIS_PROMPT;
    }

    console.log('[Crop Analysis] Making request to Gemini with vision model');

    const parts = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      {
        text: systemPrompt,
      },
    ];

    const preferredModels = ['gemini-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
    const gen = await generateWithRetries(client, parts, preferredModels, 3);
    const text = gen.text;
    const usedModel = gen.usedModel;

    console.log('[Crop Analysis] Received response from Gemini');
    console.log('[Crop Analysis] Parsing JSON response');

    let jsonResponse;
    try {
      // Clean up the response - remove markdown code blocks if present
      const cleanedText = sanitizeText(text);
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          let jsonStr = sanitizeText(jsonMatch[0])
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/:\s*'([^']*)'/g, ': "$1"')
            .replace(/\[\s*'([^']*)'/g, '["$1"')
            .replace(/,\s*'([^']*)'/g, ', "$1"');
          jsonResponse = JSON.parse(jsonStr);
        } catch (_) {
          const repaired = await repairJsonViaGemini(client, text, analysisType);
          jsonResponse = JSON.parse(repaired);
        }
      } else {
        const repaired = await repairJsonViaGemini(client, text, analysisType);
        jsonResponse = JSON.parse(repaired);
      }
    }

    console.log('[Crop Analysis] Analysis complete, returning results');

    return {
      success: true,
      analysis: jsonResponse,
      metadata: {
        analysisType: analysisType,
        timestamp: new Date().toISOString(),
        modelUsed: usedModel || 'gemini-flash-latest',
        provider: 'Google Gemini',
      },
    };
  } catch (error) {
    console.error('[Crop Analysis] Error occurred:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    return {
      success: true,
      analysis: createFallbackResponse(errorMessage, analysisType),
      metadata: {
        analysisType: analysisType,
        timestamp: new Date().toISOString(),
        modelUsed: 'gemini-flash-latest',
        provider: 'Google Gemini',
        error: true,
        errorMessage: errorMessage,
      },
    };
  }
}

/**
 * Analyze soil image
 */
export async function analyzeSoilImage(imageFile) {
  return analyzeAgricultureImage(imageFile, 'soil');
}

/**
 * Analyze plant health
 */
export async function analyzePlantHealth(imageFile) {
  return analyzeAgricultureImage(imageFile, 'plant');
}
