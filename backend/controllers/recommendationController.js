const Crop = require('../models/Crop');
const User = require('../models/User');
const CropAlert = require('../models/CropAlert');
const PushSubscription = require('../models/PushSubscription');
const axios = require('axios');
const config = require('../config/config');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.getCropRecommendations = async (req, res) => {
  try {
    const { 
      soilType, 
      location, 
      season, 
      waterAvailability,
      landArea,
      userId 
    } = req.body;


    if (!soilType || !season) {
      return res.status(400).json({ 
        success: false, 
        message: 'Soil type and season are required' 
      });
    }

    // Find suitable crops based on criteria
    const crops = await Crop.find({
      soilRequirement: { $in: [soilType] },
      season: season
    }).limit(10);

    if (crops.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No crops found matching the criteria'
      });
    }

    // Calculate suitability score for each crop
    const recommendations = crops.map(crop => {
      const suitabilityScore = calculateSuitability(crop, {
        soilType,
        location,
        season,
        waterAvailability,
        landArea
      });

      const profitability = calculateProfitability(crop, landArea || 1);
      const riskAssessment = assessRisk(crop, location);

      return {
        cropId: crop._id,
        name: crop.name,
        scientificName: crop.scientificName,
        category: crop.category,
        season: crop.season,
        duration: crop.duration,
        waterRequirement: crop.waterRequirement,
        suitabilityScore: Math.round(suitabilityScore),
        yieldPotential: crop.yieldPotential,
        estimatedYield: landArea ? crop.yieldPotential * landArea : crop.yieldPotential,
        profitability: {
          estimatedRevenue: profitability.revenue,
          estimatedCost: profitability.cost,
          netProfit: profitability.profit,
          roi: profitability.roi
        },
        riskLevel: riskAssessment.level,
        riskFactors: riskAssessment.factors,
        cultivationTips: generateCultivationTips(crop, soilType)
      };
    });

    // Sort by suitability score
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    // Save recommendation history if userId provided
    if (userId) {
      await saveRecommendationHistory(userId, recommendations.slice(0, 5));
    }

    res.json({
      success: true,
      message: 'Crop recommendations generated successfully',
      count: recommendations.length,
      data: recommendations,
      metadata: {
        soilType,
        season,
        location: location || 'Not specified',
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Crop recommendation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating crop recommendations',
      error: error.message 
    });
  }
};

// Get fertilizer recommendations
exports.getFertilizerRecommendations = async (req, res) => {
  try {
    const { 
      cropType, 
      soilType, 
      landArea, 
      soilTestResults,
      userId 
    } = req.body;

    // Validate required fields
    if (!cropType || !soilType || !landArea) {
      return res.status(400).json({ 
        success: false, 
        message: 'Crop type, soil type, and land area are required' 
      });
    }

    // Find crop details
    const crop = await Crop.findOne({ name: new RegExp(cropType, 'i') });
    
    if (!crop) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crop not found in database' 
      });
    }

    // Calculate nutrient requirements
    const nitrogen = calculateNitrogen(soilTestResults, landArea, cropType);
    const phosphorus = calculatePhosphorus(soilTestResults, landArea, cropType);
    const potassium = calculatePotassium(soilTestResults, landArea, cropType);

    // Calculate fertilizer quantities
    const ureaQuantity = (nitrogen / 0.46).toFixed(2); // Urea is 46% N
    const dapQuantity = (phosphorus / 0.46).toFixed(2); // DAP is 46% P2O5
    const mopQuantity = (potassium / 0.60).toFixed(2); // MOP is 60% K2O

    // Calculate application schedule
    const applicationSchedule = generateApplicationSchedule(crop, {
      urea: ureaQuantity,
      dap: dapQuantity,
      mop: mopQuantity
    });

    // Calculate costs
    const fertilizerCosts = calculateFertilizerCosts({
      urea: ureaQuantity,
      dap: dapQuantity,
      mop: mopQuantity
    });

    const recommendations = {
      cropName: crop.name,
      landArea: landArea,
      unit: 'acres',
      nutrients: {
        nitrogen: {
          required: nitrogen,
          unit: 'kg',
          fertilizer: 'Urea',
          quantity: ureaQuantity,
          cost: fertilizerCosts.urea
        },
        phosphorus: {
          required: phosphorus,
          unit: 'kg',
          fertilizer: 'DAP',
          quantity: dapQuantity,
          cost: fertilizerCosts.dap
        },
        potassium: {
          required: potassium,
          unit: 'kg',
          fertilizer: 'MOP (Muriate of Potash)',
          quantity: mopQuantity,
          cost: fertilizerCosts.mop
        }
      },
      organicAlternatives: {
        compost: {
          quantity: (landArea * 2).toFixed(2),
          unit: 'tons',
          benefits: 'Improves soil structure and water retention'
        },
        vermicompost: {
          quantity: (landArea * 0.5).toFixed(2),
          unit: 'tons',
          benefits: 'Rich in nutrients and beneficial microorganisms'
        },
        greenManure: {
          crops: ['Dhaincha', 'Sunhemp', 'Cowpea'],
          benefits: 'Adds nitrogen and organic matter to soil'
        }
      },
      applicationSchedule: applicationSchedule,
      totalCost: {
        chemical: fertilizerCosts.total,
        organic: calculateOrganicCost(landArea),
        currency: 'INR'
      },
      precautions: [
        'Always wear protective equipment when handling fertilizers',
        'Store fertilizers in a cool, dry place',
        'Apply fertilizers based on soil test results',
        'Avoid over-application to prevent nutrient leaching',
        'Maintain proper soil moisture during application'
      ],
      tips: [
        'Split nitrogen application for better efficiency',
        'Apply phosphorus and potassium as basal dose',
        'Consider soil pH before application',
        'Use bio-fertilizers along with chemical fertilizers',
        'Maintain records of fertilizer application'
      ]
    };

    // Save recommendation if userId provided
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          fertilizerRecommendations: {
            crop: cropType,
            recommendations: recommendations,
            date: new Date()
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Fertilizer recommendations generated successfully',
      data: recommendations
    });

  } catch (error) {
    console.error('Fertilizer recommendation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating fertilizer recommendations',
      error: error.message 
    });
  }
};

// Get pesticide recommendations
exports.getPesticideRecommendations = async (req, res) => {
  try {
    const { 
      cropType, 
      pest, 
      disease,
      severity,
      userId 
    } = req.body;

    if (!cropType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Crop type is required' 
      });
    }

    const crop = await Crop.findOne({ name: new RegExp(cropType, 'i') });
    
    if (!crop) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crop not found' 
      });
    }

    // Get disease/pest specific recommendations
    let recommendations = [];

    if (disease) {
      const diseaseInfo = crop.diseases.find(d => 
        d.name.toLowerCase().includes(disease.toLowerCase())
      );
      
      if (diseaseInfo) {
        recommendations.push({
          type: 'Disease',
          name: diseaseInfo.name,
          symptoms: diseaseInfo.symptoms,
          treatment: diseaseInfo.treatment,
          severity: severity || 'Medium',
          preventiveMeasures: generatePreventiveMeasures(diseaseInfo)
        });
      }
    }

    // Add general pest management recommendations
    const pestManagement = {
      chemical: [
        {
          name: 'Neem-based Pesticide',
          dosage: '2-3 ml per liter of water',
          application: 'Foliar spray',
          safetyPeriod: '7 days before harvest',
          cost: '₹200-300 per liter'
        },
        {
          name: 'Pyrethroid-based Pesticide',
          dosage: '1-2 ml per liter of water',
          application: 'Foliar spray',
          safetyPeriod: '14 days before harvest',
          cost: '₹400-600 per liter'
        }
      ],
      biological: [
        {
          method: 'Neem Oil',
          description: 'Natural pesticide effective against most pests',
          application: '5 ml per liter, spray weekly'
        },
        {
          method: 'Trichoderma',
          description: 'Bio-fungicide for soil-borne diseases',
          application: 'Mix with soil at planting'
        },
        {
          method: 'Pheromone Traps',
          description: 'Attracts and traps male insects',
          application: '10-12 traps per acre'
        }
      ],
      cultural: [
        'Crop rotation to break pest cycles',
        'Remove and destroy infected plant parts',
        'Maintain field sanitation',
        'Use resistant varieties',
        'Proper spacing for air circulation',
        'Avoid excess nitrogen fertilization'
      ]
    };

    const response = {
      cropName: crop.name,
      targetPest: pest || disease || 'General pests',
      severity: severity || 'Medium',
      recommendations: recommendations.length > 0 ? recommendations : [{
        type: 'General',
        treatment: 'Integrated Pest Management recommended',
        description: 'Combine chemical, biological, and cultural methods'
      }],
      pestManagement: pestManagement,
      applicationGuidelines: {
        timing: 'Early morning or late evening',
        weather: 'Avoid spraying during rain or strong winds',
        frequency: 'Every 7-10 days or as needed',
        coverage: 'Ensure complete coverage including underside of leaves'
      },
      safetyPrecautions: [
        'Wear protective clothing and mask',
        'Keep children and animals away from treated area',
        'Do not spray near water sources',
        'Follow recommended dosage strictly',
        'Maintain safety period before harvest'
      ]
    };

    res.json({
      success: true,
      message: 'Pesticide recommendations generated successfully',
      data: response
    });

  } catch (error) {
    console.error('Pesticide recommendation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating pesticide recommendations',
      error: error.message 
    });
  }
};

// Get irrigation recommendations
exports.getIrrigationRecommendations = async (req, res) => {
  try {
    const { cropType, soilType, season, location } = req.body;

    if (!cropType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Crop type is required' 
      });
    }

    const crop = await Crop.findOne({ name: new RegExp(cropType, 'i') });
    
    if (!crop) {
      return res.status(404).json({ 
        success: false, 
        message: 'Crop not found' 
      });
    }

    const recommendations = {
      cropName: crop.name,
      waterRequirement: crop.waterRequirement,
      irrigationMethods: {
        drip: {
          suitability: 'High',
          efficiency: '90-95%',
          waterSaving: '40-60%',
          cost: '₹40,000-60,000 per acre',
          benefits: ['Water conservation', 'Reduced weed growth', 'Uniform water distribution']
        },
        sprinkler: {
          suitability: 'Medium',
          efficiency: '75-85%',
          waterSaving: '30-40%',
          cost: '₹25,000-40,000 per acre',
          benefits: ['Good for light soils', 'Uniform coverage', 'Can be automated']
        },
        flood: {
          suitability: 'Low',
          efficiency: '40-50%',
          waterSaving: '0%',
          cost: '₹5,000-10,000 per acre',
          benefits: ['Low initial cost', 'Simple operation', 'Traditional method']
        }
      },
      schedule: generateIrrigationSchedule(crop, season),
      waterManagementTips: [
        'Monitor soil moisture regularly',
        'Irrigate during early morning or evening',
        'Avoid waterlogging',
        'Mulch to reduce evaporation',
        'Use drip irrigation for water efficiency'
      ]
    };

    res.json({
      success: true,
      message: 'Irrigation recommendations generated successfully',
      data: recommendations
    });

  } catch (error) {
    console.error('Irrigation recommendation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating irrigation recommendations',
      error: error.message 
    });
  }
};

// Helper Functions

// Calculate suitability score (0-100)
function calculateSuitability(crop, farmData) {
  let score = 70; // Base score

  // Soil match
  if (crop.soilRequirement.includes(farmData.soilType)) {
    score += 15;
  }

  // Season match
  if (crop.season === farmData.season) {
    score += 10;
  }

  // Water availability match
  if (farmData.waterAvailability) {
    if (crop.waterRequirement === 'Low' && farmData.waterAvailability === 'Limited') {
      score += 5;
    } else if (crop.waterRequirement === 'High' && farmData.waterAvailability === 'Abundant') {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

// Calculate profitability
function calculateProfitability(crop, landArea = 1) {
  const yieldPerAcre = crop.yieldPotential || 20; // quintals
  const pricePerQuintal = 2000; // Average INR
  const costPerAcre = 25000; // Average cultivation cost

  const revenue = yieldPerAcre * landArea * pricePerQuintal;
  const cost = costPerAcre * landArea;
  const profit = revenue - cost;
  const roi = ((profit / cost) * 100).toFixed(2);

  return {
    revenue: Math.round(revenue),
    cost: Math.round(cost),
    profit: Math.round(profit),
    roi: parseFloat(roi)
  };
}

// Assess risk
function assessRisk(crop, location) {
  const riskFactors = [];
  let riskLevel = 'Low';

  // Add risk factors based on crop characteristics
  if (crop.waterRequirement === 'High') {
    riskFactors.push('High water dependency');
    riskLevel = 'Medium';
  }

  if (crop.diseases && crop.diseases.length > 3) {
    riskFactors.push('Multiple disease vulnerabilities');
    riskLevel = 'Medium';
  }

  return {
    level: riskLevel,
    factors: riskFactors.length > 0 ? riskFactors : ['Low risk crop']
  };
}

// Generate cultivation tips
function generateCultivationTips(crop, soilType) {
  return [
    `Best grown in ${crop.season} season`,
    `Requires ${crop.waterRequirement.toLowerCase()} water`,
    `Duration: ${crop.duration} days`,
    `Suitable for ${soilType}`,
    'Ensure proper drainage',
    'Monitor for pests regularly'
  ];
}

// Calculate nitrogen requirement
function calculateNitrogen(soilTest, landArea, cropType) {
  const baseRequirement = 60; // kg per acre
  const adjustment = soilTest?.nitrogen || 0;
  return Math.max((baseRequirement - adjustment) * landArea, 0);
}

// Calculate phosphorus requirement
function calculatePhosphorus(soilTest, landArea, cropType) {
  const baseRequirement = 40; // kg per acre
  const adjustment = soilTest?.phosphorus || 0;
  return Math.max((baseRequirement - adjustment) * landArea, 0);
}

// Calculate potassium requirement
function calculatePotassium(soilTest, landArea, cropType) {
  const baseRequirement = 40; // kg per acre
  const adjustment = soilTest?.potassium || 0;
  return Math.max((baseRequirement - adjustment) * landArea, 0);
}

// Generate application schedule
function generateApplicationSchedule(crop, fertilizers) {
  return [
    {
      stage: 'Basal (At Sowing)',
      timing: 'Day 0',
      fertilizers: {
        urea: (fertilizers.urea * 0.25).toFixed(2),
        dap: fertilizers.dap,
        mop: (fertilizers.mop * 0.5).toFixed(2)
      }
    },
    {
      stage: 'First Top Dressing',
      timing: `Day ${Math.round(crop.duration * 0.25)}`,
      fertilizers: {
        urea: (fertilizers.urea * 0.35).toFixed(2),
        mop: (fertilizers.mop * 0.5).toFixed(2)
      }
    },
    {
      stage: 'Second Top Dressing',
      timing: `Day ${Math.round(crop.duration * 0.5)}`,
      fertilizers: {
        urea: (fertilizers.urea * 0.4).toFixed(2)
      }
    }
  ];
}

// Calculate fertilizer costs
function calculateFertilizerCosts(quantities) {
  const prices = {
    urea: 6, // INR per kg
    dap: 27,
    mop: 18
  };

  return {
    urea: Math.round(quantities.urea * prices.urea),
    dap: Math.round(quantities.dap * prices.dap),
    mop: Math.round(quantities.mop * prices.mop),
    total: Math.round(
      quantities.urea * prices.urea +
      quantities.dap * prices.dap +
      quantities.mop * prices.mop
    )
  };
}

// Calculate organic fertilizer cost
function calculateOrganicCost(landArea) {
  const compostCost = 3000; // per ton
  const vermicompostCost = 8000; // per ton
  
  return Math.round(
    (landArea * 2 * compostCost) + 
    (landArea * 0.5 * vermicompostCost)
  );
}

// Generate preventive measures
function generatePreventiveMeasures(diseaseInfo) {
  return [
    'Use disease-resistant varieties',
    'Maintain field sanitation',
    'Ensure proper drainage',
    'Avoid excessive irrigation',
    'Remove infected plant debris',
    'Practice crop rotation'
  ];
}

// Generate irrigation schedule
function generateIrrigationSchedule(crop, season) {
  const baseSchedule = {
    frequency: crop.waterRequirement === 'High' ? '5-7 days' : '10-15 days',
    amount: crop.waterRequirement === 'High' ? '40-50 mm' : '25-35 mm',
    criticalStages: [
      {
        stage: 'Germination',
        timing: 'Days 0-15',
        importance: 'Critical',
        waterNeeded: 'Light but frequent'
      },
      {
        stage: 'Vegetative Growth',
        timing: `Days 15-${Math.round(crop.duration * 0.5)}`,
        importance: 'High',
        waterNeeded: 'Regular irrigation'
      },
      {
        stage: 'Flowering/Fruiting',
        timing: `Days ${Math.round(crop.duration * 0.5)}-${Math.round(crop.duration * 0.8)}`,
        importance: 'Critical',
        waterNeeded: 'Consistent moisture'
      },
      {
        stage: 'Maturity',
        timing: `Days ${Math.round(crop.duration * 0.8)}-${crop.duration}`,
        importance: 'Medium',
        waterNeeded: 'Reduce gradually'
      }
    ]
  };

  return baseSchedule;
}

// Save recommendation history
async function saveRecommendationHistory(userId, recommendations) {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        recommendationHistory: {
          recommendations: recommendations.map(r => ({
            crop: r.name,
            score: r.suitabilityScore
          })),
          date: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error saving recommendation history:', error);
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const CROP_RECOMMENDATION_PROMPT = (weather, region, soilType) => `You are an expert agricultural consultant specializing in Indian farming practices.

WEATHER CONDITIONS:
- Temperature: ${weather.temp || weather.temperature}°C
- Humidity: ${weather.humidity}%
- Condition: ${weather.condition}
- Wind Speed: ${weather.windSpeed} km/h
- Rainfall: ${weather.rainfall || 0} mm
- Pressure: ${weather.pressure || 'N/A'} mb

REGION: ${region}
SOIL TYPE: ${soilType || 'Not specified'}

Based on the current weather conditions, analyze which crops are:
1. EXCELLENT to sow in the coming 7-14 days
2. GOOD but require specific conditions
3. NOT SUITABLE right now

Provide a JSON response with this exact structure:
{
  "suitableCrops": [
    {
      "name": "crop name",
      "suitability": "Excellent/Good/Moderate",
      "reason": "brief reason why",
      "sowingWindow": "days or timing",
      "expectedYield": "yield expectation"
    }
  ],
  "notSuitableCrops": [
    {
      "name": "crop name",
      "reason": "why not suitable now"
    }
  ],
  "advice": "General farming advice for this weather",
  "immediateActions": ["action1", "action2"],
  "summary": "One-line summary"
}

IMPORTANT:
- Only respond with valid JSON, no markdown
- Focus on crops common in India (rice, wheat, cotton, sugarcane, vegetables, etc.)
- Consider current season and weather patterns
- Provide practical, farmer-friendly advice`;

async function generateCropAlerts(userId, weatherData, region, soilType) {
  try {
    const geminiPrompt = CROP_RECOMMENDATION_PROMPT(weatherData, region, soilType);

    let recommendations = {};

    try {
      const models = ['gemini-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'];
      let text = '';
      let lastError;
      for (const m of models) {
        try {
          const model = genAI.getGenerativeModel({
            model: m,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          });
          const result = await model.generateContent(geminiPrompt);
          const response = await result.response;
          text = response.text();
          if (text) break;
        } catch (e) {
          lastError = e;
        }
      }
      if (!text) throw lastError || new Error('No response from Gemini');
      
      if (text) {
        try {
          const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          recommendations = JSON.parse(cleanedText);
        } catch (parseError) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              let jsonStr = jsonMatch[0];
              jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
              jsonStr = jsonStr.replace(/:\s*'([^']*)'/g, ': "$1"');
              recommendations = JSON.parse(jsonStr);
            } catch (fixError) {
              console.error('JSON parse error:', fixError);
              recommendations = getFallbackRecommendations(weatherData);
            }
          }
        }
      }
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      recommendations = getFallbackRecommendations(weatherData);
    }

    const suitableCrops = recommendations.suitableCrops || [];
    const notSuitableCrops = recommendations.notSuitableCrops || [];

    const cropAlert = new CropAlert({
      userId,
      title: recommendations.summary || `Weather-based Crop Recommendations for ${region}`,
      description: `${recommendations.advice || 'Based on current weather conditions'}.`,
      message: recommendations.advice,
      region,
      weatherData: {
        temperature: weatherData.temp || weatherData.temperature,
        humidity: weatherData.humidity,
        condition: weatherData.condition,
        windSpeed: weatherData.windSpeed,
        rainfall: weatherData.rainfall || 0,
        pressure: weatherData.pressure
      },
      recommendations: suitableCrops,
      notSuitable: notSuitableCrops,
      additionalAdvice: recommendations.advice
    });

    await cropAlert.save();

    return {
      success: true,
      alert: cropAlert,
      recommendations: suitableCrops,
      notRecommended: notSuitableCrops,
      advice: recommendations.advice
    };
  } catch (error) {
    console.error('Error generating crop alerts:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function getFallbackRecommendations(weatherData) {
  const temp = weatherData.temp || weatherData.temperature || 25;
  const humidity = weatherData.humidity || 60;

  let suitableCrops = [];
  let notSuitableCrops = [];

  if (temp > 20 && temp < 30 && humidity > 50) {
    suitableCrops = [
      { name: 'Rice', suitability: 'Excellent', reason: 'Ideal temperature and humidity', sowingWindow: 'Next 3-5 days', expectedYield: 'Good' },
      { name: 'Maize', suitability: 'Good', reason: 'Favorable conditions', sowingWindow: 'Next week', expectedYield: 'Good' },
      { name: 'Vegetables', suitability: 'Excellent', reason: 'Perfect growing conditions', sowingWindow: 'Immediate', expectedYield: 'Excellent' }
    ];
    notSuitableCrops = [
      { name: 'Wheat', reason: 'Temperature too high, prefer cooler season' }
    ];
  } else if (temp < 20 && humidity > 40) {
    suitableCrops = [
      { name: 'Wheat', suitability: 'Excellent', reason: 'Ideal temperature range', sowingWindow: 'Next 2-3 weeks', expectedYield: 'Excellent' },
      { name: 'Barley', suitability: 'Good', reason: 'Suitable conditions', sowingWindow: 'Next week', expectedYield: 'Good' }
    ];
    notSuitableCrops = [
      { name: 'Rice', reason: 'Temperature too low for optimal growth' }
    ];
  } else {
    suitableCrops = [
      { name: 'Pulses', suitability: 'Good', reason: 'Moderate conditions suitable', sowingWindow: 'Next 5-7 days', expectedYield: 'Good' }
    ];
  }

  return {
    suitableCrops,
    notSuitableCrops,
    advice: 'Monitor weather conditions closely. Ensure proper irrigation and soil preparation.',
    summary: 'Crop recommendations based on current weather'
  };
}

exports.createCropAlert = async (req, res) => {
  try {
    const { userId, weather, region, soilType } = req.body;

    if (!userId || !weather || !region) {
      return res.status(400).json({
        success: false,
        message: 'userId, weather, and region are required'
      });
    }

    const result = await generateCropAlerts(userId, weather, region, soilType);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error creating crop alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create crop alert',
      error: error.message
    });
  }
};

exports.getCropAlerts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const alerts = await CropAlert.find({
      userId,
      dismissed: false
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error fetching crop alerts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch crop alerts',
      error: error.message
    });
  }
};

exports.markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await CropAlert.findByIdAndUpdate(
      alertId,
      { read: true, updatedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    return res.status(200).json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
};

exports.dismissAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await CropAlert.findByIdAndUpdate(
      alertId,
      { dismissed: true, updatedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Alert dismissed',
      alert
    });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dismiss alert',
      error: error.message
    });
  }
};

exports.generateCropAlerts = generateCropAlerts;

module.exports = exports;
