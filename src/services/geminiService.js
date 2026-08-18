// Gemini Service - Using official Google Gemini AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

let genAI = null;
let requestHistory = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60; // Gemini has generous limits

// Initialize Gemini client
function getGeminiClient() {
  if (!genAI && GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. AI features will not work.');
  }
  return genAI;
}

const checkRateLimit = () => {
  const now = Date.now();
  requestHistory = requestHistory.filter(t => now - t < RATE_LIMIT_WINDOW);
  if (requestHistory.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = requestHistory[0];
    const wait = RATE_LIMIT_WINDOW - (now - oldest);
    return { allowed: false, waitTime: Math.ceil(wait / 1000) };
  }
  return { allowed: true, waitTime: 0 };
};

const recordRequest = () => {
  requestHistory.push(Date.now());
};

const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit error
      if ((error.message?.includes('429') || error.message?.includes('quota')) && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
};

const geminiService = {
  /**
   * Ask Gemini a question
   */
  askGemini: async (prompt) => {
    try {
      const rate = checkRateLimit();
      if (!rate.allowed) {
        throw new Error(`RATE_LIMIT: Please wait ${rate.waitTime} seconds before making another request.`);
      }
      
      recordRequest();

      const ENV_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE;
      const DEFAULT_BASE = '';
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname.match(/^[0-9.]+$/);
      const API_BASE_URL = ENV_BASE || (isLocal ? `http://${window.location.hostname}:5000` : DEFAULT_BASE);

      const response = await fetch(`${API_BASE_URL}/api/diagnosis/voice-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to get response');
      }
      
      return data.text;
      
      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      if (error.message?.includes('RATE_LIMIT')) {
        const waitTime = error.message.match(/(\d+) seconds/)?.[1] || 'a few';
        return `⏳ Rate limit reached. Please wait ${waitTime} seconds before asking another question.`;
      }
      
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        requestHistory = [];
        return '⏳ API rate limit exceeded. Please wait a moment before trying again.';
      }
      
      if (error.message?.includes('403') || error.message?.includes('401') || error.message?.includes('API key')) {
        return 'Sorry, your API key is invalid or lacks permission. Please check your GEMINI_API_KEY.';
      }
      
      if (error.message?.includes('400')) {
        return 'Sorry, the request was invalid. Please try rephrasing your question.';
      }
      
      const ENV_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE;
      const DEFAULT_BASE = '';
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname.match(/^[0-9.]+$/);
      const API_BASE_URL = ENV_BASE || (isLocal ? `http://${window.location.hostname}:5000` : DEFAULT_BASE);
      return `Sorry, I could not process your request. Error: ${error.message}. Attempted to connect to: ${API_BASE_URL}/api/diagnosis/voice-assist. Please check your internet connection and try again.`;
    }
  },

  /**
   * Get crop diagnosis from symptoms
   */
  getCropDiagnosis: async (symptoms, cropType) => {
    const prompt = `As an agricultural expert, analyze these symptoms for ${cropType}: ${symptoms}. 

Provide a detailed analysis including:
1) Most likely disease or pest issue
2) Severity assessment (Mild/Moderate/Severe)
3) Immediate treatment recommendations (organic and chemical options)
4) Prevention tips for the future
5) Expected recovery timeline

Keep the response practical and actionable for Indian farmers.`;
    
    return await geminiService.askGemini(prompt);
  },

  /**
   * Get fertilizer recommendations
   */
  getFertilizerRecommendation: async (soilType, cropType, season) => {
    const prompt = `Recommend optimal fertilizer for:
- Soil Type: ${soilType}
- Crop: ${cropType}
- Season: ${season}

Provide:
1) NPK ratio needed
2) Quantity per acre/hectare
3) Application timing (pre-sowing, post-sowing, etc.)
4) Organic alternatives
5) Cost-effective options for small farmers
6) Application method

Consider Indian agricultural practices and local availability.`;
    
    return await geminiService.askGemini(prompt);
  },

  /**
   * Get crop recommendations
   */
  getCropRecommendation: async (soilData, climateData, region) => {
    const soilInfo = typeof soilData === 'object' ? JSON.stringify(soilData) : soilData;
    const climateInfo = typeof climateData === 'object' ? JSON.stringify(climateData) : climateData;
    
    const prompt = `Recommend the best crops for:
- Region: ${region}
- Soil Conditions: ${soilInfo}
- Climate Data: ${climateInfo}

Provide top 3 crop recommendations with:
1) Crop name and variety
2) Expected yield per acre
3) Growing duration
4) Water requirements
5) Market demand and pricing
6) Key cultivation tips
7) Common challenges and solutions

Focus on crops suitable for Indian agriculture and local markets.`;
    
    return await geminiService.askGemini(prompt);
  },

  /**
   * Analyze soil health from description
   */
  analyzeSoilHealth: async (soilDescription, location) => {
    const prompt = `As a soil scientist, analyze this soil:
- Description: ${soilDescription}
- Location: ${location || 'Not specified'}

Provide:
1) Soil type classification
2) Nutrient status assessment
3) pH level estimation
4) Recommended improvements
5) Suitable crops for this soil
6) Organic amendments needed
7) Testing recommendations

Consider Indian soil types and local agricultural practices.`;
    
    return await geminiService.askGemini(prompt);
  },

  /**
   * Get pest control recommendations
   */
  getPestControl: async (pestDescription, cropType) => {
    const prompt = `Identify and provide control measures for:
- Pest/Disease: ${pestDescription}
- Affected Crop: ${cropType}

Provide:
1) Pest/disease identification
2) Life cycle and behavior
3) Organic control methods
4) Chemical control options (if necessary)
5) Preventive measures
6) Natural predators (biological control)
7) Cultural practices to prevent recurrence

Prioritize eco-friendly and cost-effective solutions for Indian farmers.`;
    
    return await geminiService.askGemini(prompt);
  },

  /**
   * Get irrigation guidance
   */
  getIrrigationAdvice: async (cropType, soilType, climate, stage) => {
    const prompt = `Provide irrigation guidance for:
- Crop: ${cropType}
- Soil Type: ${soilType}
- Climate: ${climate}
- Growth Stage: ${stage}

Include:
1) Optimal watering frequency
2) Water quantity per irrigation
3) Best time of day for watering
4) Signs of over/under watering
5) Water conservation techniques
6) Drip vs flood irrigation suitability
7) Monsoon season adjustments

Consider water scarcity and Indian irrigation practices.`;
    
    return await geminiService.askGemini(prompt);
  },

  /**
   * Get weather-based farming advice
   */
  getWeatherAdvice: async (weatherData, cropType) => {
    const weatherInfo = typeof weatherData === 'object' ? JSON.stringify(weatherData) : weatherData;
    
    const prompt = `Based on weather forecast:
${weatherInfo}

For crop: ${cropType}

Provide:
1) Immediate farming actions needed
2) Risks to watch for (frost, heat, excessive rain, etc.)
3) Crop protection measures
4) Harvest timing adjustments
5) Irrigation adjustments
6) Disease/pest risks from weather
7) Opportunities to leverage (good rainfall, etc.)

Make recommendations practical and timely for Indian farmers.`;
    
    return await geminiService.askGemini(prompt);
  },

  /**
   * Get market price and selling advice
   */
  getMarketAdvice: async (cropType, region, quantity) => {
    const prompt = `Provide market guidance for:
- Crop: ${cropType}
- Region: ${region}
- Quantity: ${quantity}

Include:
1) Current market price trends
2) Best time to sell
3) Where to sell (mandi, direct buyer, online)
4) Storage tips if holding for better prices
5) Price negotiation tips
6) Value addition opportunities
7) Government schemes for market access

Consider Indian agricultural marketing system (APMC, MSP, etc.).`;
    
    return await geminiService.askGemini(prompt);
  },

  /**
   * Clear request history cache
   */
  clearCache: () => {
    requestHistory = [];
  }
};

export default geminiService;
