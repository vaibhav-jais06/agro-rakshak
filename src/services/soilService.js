import axios from 'axios';

const SOIL_API_KEY = process.env.REACT_APP_SOIL_API_KEY;

// State mapping for India (approximate)
const stateCoordinates = {
  'Andhra Pradesh': { lat: 15.9129, lon: 78.6675 },
  'Arunachal Pradesh': { lat: 28.2180, lon: 94.7278 },
  'Assam': { lat: 26.2006, lon: 92.9376 },
  'Bihar': { lat: 25.0961, lon: 85.3131 },
  'Chhattisgarh': { lat: 21.2787, lon: 81.8661 },
  'Goa': { lat: 15.2993, lon: 73.8243 },
  'Gujarat': { lat: 22.2587, lon: 71.1924 },
  'Haryana': { lat: 29.0588, lon: 77.0745 },
  'Himachal Pradesh': { lat: 31.1048, lon: 77.1734 },
  'Jharkhand': { lat: 23.6102, lon: 85.2799 },
  'Karnataka': { lat: 15.3173, lon: 75.7139 },
  'Kerala': { lat: 10.8505, lon: 76.2711 },
  'Madhya Pradesh': { lat: 22.9375, lon: 78.6553 },
  'Maharashtra': { lat: 19.7515, lon: 75.7139 },
  'Manipur': { lat: 24.6637, lon: 93.9063 },
  'Meghalaya': { lat: 25.4670, lon: 91.3662 },
  'Mizoram': { lat: 23.1645, lon: 92.9376 },
  'Nagaland': { lat: 26.1584, lon: 94.5624 },
  'Odisha': { lat: 20.9517, lon: 85.0985 },
  'Punjab': { lat: 31.1471, lon: 75.3412 },
  'Rajasthan': { lat: 27.0238, lon: 74.2179 },
  'Sikkim': { lat: 27.5330, lon: 88.5122 },
  'Tamil Nadu': { lat: 11.1271, lon: 79.2787 },
  'Telangana': { lat: 18.1124, lon: 79.0193 },
  'Tripura': { lat: 23.9408, lon: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'Uttarakhand': { lat: 30.0668, lon: 79.0193 },
  'West Bengal': { lat: 24.5155, lon: 88.2289 }
};

// State-wise average soil properties (estimated from Soil Health Card Scheme data)
const stateSoilData = {
  'Andhra Pradesh': { avgPh: 7.1, avgOM: 0.8, avgMoisture: 18, soilType: 'clay-loam', avgNitrogen: 185, avgPhosphorus: 32, avgPotassium: 245 },
  'Arunachal Pradesh': { avgPh: 5.2, avgOM: 2.1, avgMoisture: 25, soilType: 'loamy', avgNitrogen: 220, avgPhosphorus: 28, avgPotassium: 185 },
  'Assam': { avgPh: 5.8, avgOM: 1.9, avgMoisture: 28, soilType: 'clay', avgNitrogen: 215, avgPhosphorus: 25, avgPotassium: 175 },
  'Bihar': { avgPh: 6.5, avgOM: 1.2, avgMoisture: 22, soilType: 'silt', avgNitrogen: 195, avgPhosphorus: 30, avgPotassium: 210 },
  'Chhattisgarh': { avgPh: 6.3, avgOM: 1.5, avgMoisture: 20, soilType: 'clay-loam', avgNitrogen: 205, avgPhosphorus: 28, avgPotassium: 195 },
  'Goa': { avgPh: 6.8, avgOM: 1.1, avgMoisture: 24, soilType: 'sandy-loam', avgNitrogen: 190, avgPhosphorus: 26, avgPotassium: 188 },
  'Gujarat': { avgPh: 7.3, avgOM: 0.6, avgMoisture: 14, soilType: 'sandy', avgNitrogen: 165, avgPhosphorus: 22, avgPotassium: 175 },
  'Haryana': { avgPh: 7.6, avgOM: 0.7, avgMoisture: 16, soilType: 'sandy-loam', avgNitrogen: 170, avgPhosphorus: 24, avgPotassium: 182 },
  'Himachal Pradesh': { avgPh: 6.1, avgOM: 1.8, avgMoisture: 26, soilType: 'loamy', avgNitrogen: 212, avgPhosphorus: 29, avgPotassium: 202 },
  'Jharkhand': { avgPh: 6.2, avgOM: 1.4, avgMoisture: 21, soilType: 'clay-loam', avgNitrogen: 200, avgPhosphorus: 27, avgPotassium: 192 },
  'Karnataka': { avgPh: 6.9, avgOM: 0.9, avgMoisture: 17, soilType: 'red-loam', avgNitrogen: 180, avgPhosphorus: 25, avgPotassium: 198 },
  'Kerala': { avgPh: 5.5, avgOM: 2.3, avgMoisture: 30, soilType: 'loamy', avgNitrogen: 225, avgPhosphorus: 30, avgPotassium: 205 },
  'Madhya Pradesh': { avgPh: 7.2, avgOM: 0.8, avgMoisture: 16, soilType: 'clay-loam', avgNitrogen: 175, avgPhosphorus: 23, avgPotassium: 190 },
  'Maharashtra': { avgPh: 7.4, avgOM: 0.7, avgMoisture: 15, soilType: 'black-clay', avgNitrogen: 172, avgPhosphorus: 21, avgPotassium: 185 },
  'Manipur': { avgPh: 6.0, avgOM: 2.0, avgMoisture: 27, soilType: 'clay', avgNitrogen: 220, avgPhosphorus: 31, avgPotassium: 210 },
  'Meghalaya': { avgPh: 5.1, avgOM: 2.4, avgMoisture: 32, soilType: 'loamy', avgNitrogen: 230, avgPhosphorus: 29, avgPotassium: 195 },
  'Mizoram': { avgPh: 5.3, avgOM: 2.2, avgMoisture: 30, soilType: 'loamy', avgNitrogen: 228, avgPhosphorus: 28, avgPotassium: 192 },
  'Nagaland': { avgPh: 5.9, avgOM: 2.0, avgMoisture: 28, soilType: 'clay-loam', avgNitrogen: 218, avgPhosphorus: 27, avgPotassium: 200 },
  'Odisha': { avgPh: 6.0, avgOM: 1.6, avgMoisture: 24, soilType: 'sandy-loam', avgNitrogen: 208, avgPhosphorus: 26, avgPotassium: 188 },
  'Punjab': { avgPh: 7.5, avgOM: 0.6, avgMoisture: 14, soilType: 'sandy-loam', avgNitrogen: 168, avgPhosphorus: 20, avgPotassium: 178 },
  'Rajasthan': { avgPh: 7.8, avgOM: 0.5, avgMoisture: 12, soilType: 'sandy', avgNitrogen: 160, avgPhosphorus: 18, avgPotassium: 172 },
  'Sikkim': { avgPh: 5.4, avgOM: 2.5, avgMoisture: 31, soilType: 'loamy', avgNitrogen: 232, avgPhosphorus: 31, avgPotassium: 208 },
  'Tamil Nadu': { avgPh: 6.7, avgOM: 1.0, avgMoisture: 19, soilType: 'red-loam', avgNitrogen: 185, avgPhosphorus: 24, avgPotassium: 195 },
  'Telangana': { avgPh: 7.2, avgOM: 0.8, avgMoisture: 17, soilType: 'clay-loam', avgNitrogen: 180, avgPhosphorus: 22, avgPotassium: 200 },
  'Tripura': { avgPh: 5.7, avgOM: 2.1, avgMoisture: 29, soilType: 'clay', avgNitrogen: 220, avgPhosphorus: 28, avgPotassium: 198 },
  'Uttar Pradesh': { avgPh: 7.4, avgOM: 0.9, avgMoisture: 17, soilType: 'silt', avgNitrogen: 185, avgPhosphorus: 25, avgPotassium: 205 },
  'Uttarakhand': { avgPh: 6.0, avgOM: 1.9, avgMoisture: 25, soilType: 'loamy', avgNitrogen: 215, avgPhosphorus: 28, avgPotassium: 205 },
  'West Bengal': { avgPh: 6.3, avgOM: 1.7, avgMoisture: 26, soilType: 'silt', avgNitrogen: 210, avgPhosphorus: 29, avgPotassium: 200 }
};

// Crop requirements and thresholds with nutrient requirements
const cropRequirements = {
  'Wheat': { phMin: 6.0, phMax: 7.5, moistureMin: 15, moistureMax: 25, omMin: 0.8, nitrogenMin: 150, phosphorusMin: 20, potassiumMin: 150, soilTypes: ['loamy', 'silt', 'clay-loam'], regions: ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan'] },
  'Rice': { phMin: 5.5, phMax: 7.5, moistureMin: 25, moistureMax: 40, omMin: 1.2, nitrogenMin: 180, phosphorusMin: 25, potassiumMin: 180, soilTypes: ['clay', 'silt', 'clay-loam'], regions: ['West Bengal', 'Punjab', 'Odisha', 'Bihar', 'Assam'] },
  'Maize': { phMin: 6.0, phMax: 7.0, moistureMin: 18, moistureMax: 30, omMin: 0.8, nitrogenMin: 170, phosphorusMin: 22, potassiumMin: 160, soilTypes: ['loamy', 'sandy-loam', 'clay-loam'], regions: ['Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan'] },
  'Sugarcane': { phMin: 6.0, phMax: 7.5, moistureMin: 20, moistureMax: 35, omMin: 1.0, nitrogenMin: 200, phosphorusMin: 28, potassiumMin: 210, soilTypes: ['loamy', 'clay-loam', 'silt'], regions: ['Maharashtra', 'Uttar Pradesh', 'Karnataka'] },
  'Bajra': { phMin: 6.5, phMax: 8.0, moistureMin: 10, moistureMax: 18, omMin: 0.4, nitrogenMin: 140, phosphorusMin: 15, potassiumMin: 140, soilTypes: ['sandy', 'sandy-loam'], regions: ['Rajasthan', 'Gujarat', 'Haryana'] },
  'Soybean': { phMin: 6.0, phMax: 7.5, moistureMin: 15, moistureMax: 25, omMin: 0.8, nitrogenMin: 160, phosphorusMin: 20, potassiumMin: 160, soilTypes: ['loamy', 'clay-loam', 'sandy-loam'], regions: ['Madhya Pradesh', 'Maharashtra', 'Rajasthan'] },
  'Groundnut': { phMin: 6.0, phMax: 7.5, moistureMin: 12, moistureMax: 22, omMin: 0.7, nitrogenMin: 150, phosphorusMin: 18, potassiumMin: 150, soilTypes: ['sandy', 'sandy-loam', 'loamy'], regions: ['Gujarat', 'Andhra Pradesh', 'Tamil Nadu'] },
  'Barley': { phMin: 6.0, phMax: 7.5, moistureMin: 12, moistureMax: 20, omMin: 0.7, nitrogenMin: 145, phosphorusMin: 18, potassiumMin: 140, soilTypes: ['loamy', 'sandy-loam'], regions: ['Uttar Pradesh', 'Rajasthan', 'Himachal Pradesh'] },
  'Cotton': { phMin: 6.0, phMax: 8.5, moistureMin: 15, moistureMax: 25, omMin: 0.8, nitrogenMin: 180, phosphorusMin: 22, potassiumMin: 200, soilTypes: ['black-clay', 'clay-loam', 'loamy'], regions: ['Maharashtra', 'Gujarat', 'Telangana'] },
  'Pulses': { phMin: 6.0, phMax: 7.5, moistureMin: 14, moistureMax: 24, omMin: 0.7, nitrogenMin: 140, phosphorusMin: 16, potassiumMin: 140, soilTypes: ['loamy', 'clay-loam', 'sandy-loam'], regions: ['Madhya Pradesh', 'Rajasthan', 'Uttar Pradesh'] }
};

// Reverse geocode lat/lon to state
const getStateFromCoords = async (lat, lon) => {
  try {
    // Simple distance-based state assignment
    let closestState = 'Punjab';
    let minDist = Infinity;

    for (const [state, coords] of Object.entries(stateCoordinates)) {
      const dist = Math.sqrt(
        Math.pow(coords.lat - lat, 2) + Math.pow(coords.lon - lon, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        closestState = state;
      }
    }
    return closestState;
  } catch (e) {
    console.error('Geocode error:', e);
    return 'Punjab'; // default fallback
  }
};

// Calculate crop match percentage with enhanced algorithm
const calculateCropMatch = (ph, moisture, om, soilType, state, nitrogen, phosphorus, potassium, cropReq) => {
  let score = 100;

  // pH scoring (25% weight)
  if (ph >= cropReq.phMin && ph <= cropReq.phMax) {
    score -= 0;
  } else if (Math.abs(ph - (cropReq.phMin + cropReq.phMax) / 2) <= 0.5) {
    score -= 5;
  } else if (Math.abs(ph - (cropReq.phMin + cropReq.phMax) / 2) <= 1) {
    score -= 12;
  } else {
    score -= 25;
  }

  // Moisture scoring (20% weight)
  if (moisture >= cropReq.moistureMin && moisture <= cropReq.moistureMax) {
    score -= 0;
  } else if (Math.abs(moisture - (cropReq.moistureMin + cropReq.moistureMax) / 2) <= 2) {
    score -= 8;
  } else if (Math.abs(moisture - (cropReq.moistureMin + cropReq.moistureMax) / 2) <= 5) {
    score -= 15;
  } else {
    score -= 20;
  }

  // Organic Matter scoring (15% weight)
  if (om >= cropReq.omMin) {
    score -= 0;
  } else if (om >= cropReq.omMin * 0.85) {
    score -= 10;
  } else if (om >= cropReq.omMin * 0.70) {
    score -= 18;
  } else {
    score -= 25;
  }

  // Nitrogen scoring (13% weight)
  if (nitrogen >= cropReq.nitrogenMin) {
    score -= 0;
  } else if (nitrogen >= cropReq.nitrogenMin * 0.9) {
    score -= 5;
  } else if (nitrogen >= cropReq.nitrogenMin * 0.75) {
    score -= 12;
  } else {
    score -= 18;
  }

  // Phosphorus scoring (12% weight)
  if (phosphorus >= cropReq.phosphorusMin) {
    score -= 0;
  } else if (phosphorus >= cropReq.phosphorusMin * 0.9) {
    score -= 5;
  } else if (phosphorus >= cropReq.phosphorusMin * 0.75) {
    score -= 12;
  } else {
    score -= 18;
  }

  // Potassium scoring (10% weight)
  if (potassium >= cropReq.potassiumMin) {
    score -= 0;
  } else if (potassium >= cropReq.potassiumMin * 0.9) {
    score -= 4;
  } else if (potassium >= cropReq.potassiumMin * 0.75) {
    score -= 10;
  } else {
    score -= 15;
  }

  // Soil Type scoring (5% weight)
  if (cropReq.soilTypes.includes(soilType)) {
    score -= 0;
  } else {
    score -= 5;
  }

  // Region bonus (up to +10)
  if (cropReq.regions.includes(state)) {
    score += 8;
  }

  return Math.max(0, Math.min(100, score));
};

// Get soil improvement suggestions with enhanced accuracy
const getSoilImprovements = (ph, moisture, om, soilType, nitrogen, phosphorus, potassium) => {
  const suggestions = [];

  // pH-based suggestions
  if (ph < 5.5) {
    suggestions.push('Critical: Very acidic soil. Apply 2-3 tons/ha of limestone (CaCO3) or 1-2 tons/ha of gypsum');
  } else if (ph < 6.0) {
    suggestions.push('Low pH: Apply 1-2 tons/ha of lime or limestone to raise pH to 6.0-6.5');
  } else if (ph > 8.0) {
    suggestions.push('High pH: Add 500-1000 kg/ha of sulfur or acidifying amendments like ammonium sulfate');
  } else if (ph > 7.5) {
    suggestions.push('Moderately alkaline: Consider acidifying fertilizers (ammonium nitrate, ammonium sulfate)');
  }

  // Organic Matter suggestions
  if (om < 0.5) {
    suggestions.push('Critical: Very low OM. Add 10-15 tons/ha of well-rotted farmyard manure or 5-7 tons/ha of compost');
  } else if (om < 1.0) {
    suggestions.push('Low OM: Apply 5-10 tons/ha of compost or farmyard manure. Practice green manuring with legumes');
  } else if (om < 1.5) {
    suggestions.push('Moderate OM: Maintain by adding 2-3 tons/ha organic matter yearly and practicing crop residue incorporation');
  }

  // Moisture suggestions
  if (moisture < 10) {
    suggestions.push('Severe drought: Implement drip irrigation, add 5-8 tons/ha mulch, increase OM to 1.5-2%');
  } else if (moisture < 15) {
    suggestions.push('Low moisture: Use mulching, drip irrigation, and increase organic matter to 1.2%');
  } else if (moisture > 35) {
    suggestions.push('Waterlogged: Improve drainage with raised beds, French drains, or subsurface drainage systems');
  } else if (moisture > 30) {
    suggestions.push('High moisture: Aerate soil, add gypsum (1 ton/ha), and install drainage systems');
  }

  // Nutrient suggestions
  if (nitrogen < 140) {
    suggestions.push('Low Nitrogen: Apply 50-100 kg/ha of nitrogen fertilizer (urea 46% N or ammonium sulfate)');
  } else if (nitrogen < 160) {
    suggestions.push('Moderate Nitrogen: Apply 25-50 kg/ha nitrogen during planting; use legume crop rotation');
  }

  if (phosphorus < 15) {
    suggestions.push('Low Phosphorus: Apply 40-60 kg/ha of phosphate fertilizer (DAP or SSP)');
  } else if (phosphorus < 20) {
    suggestions.push('Moderate Phosphorus: Apply 20-30 kg/ha phosphate before planting');
  }

  if (potassium < 140) {
    suggestions.push('Low Potassium: Apply 40-60 kg/ha of potash fertilizer (MOP or wood ash)');
  } else if (potassium < 160) {
    suggestions.push('Moderate Potassium: Apply 20-30 kg/ha potash; incorporate wood ash if available');
  }

  // Soil type suggestions
  if (soilType === 'sandy') {
    suggestions.push('Sandy soil: Add 8-10 tons/ha OM, mulch heavily, increase irrigation frequency by 30-40%');
  } else if (soilType === 'clay' || soilType === 'black-clay') {
    suggestions.push('Heavy clay: Incorporate 4-6 tons/ha OM, add gypsum (1 ton/ha), use raised bed system');
  } else if (soilType === 'silt') {
    suggestions.push('Silt soil: Maintain 1.2-1.5% OM, avoid compaction, practice minimum tillage');
  }

  return suggestions.slice(0, 5); // Return top 5 suggestions
};

const soilService = {
  // Get state from lat/lon
  getStateFromCoordinates: getStateFromCoords,

  // Auto-fill soil data from state-based estimation
  getAutoSoilData: async (lat, lon) => {
    try {
      const state = await getStateFromCoords(lat, lon);
      const stateData = stateSoilData[state] || stateSoilData['Punjab'];

      return {
        state,
        ph: stateData.avgPh,
        organicMatter: stateData.avgOM,
        moisture: stateData.avgMoisture,
        soilType: stateData.soilType,
        nitrogen: stateData.avgNitrogen,
        phosphorus: stateData.avgPhosphorus,
        potassium: stateData.avgPotassium,
        source: 'estimated'
      };
    } catch (e) {
      console.error('Auto soil data error:', e);
      return {
        state: 'Punjab',
        ph: 7.5,
        organicMatter: 0.6,
        moisture: 14,
        soilType: 'sandy-loam',
        nitrogen: 168,
        phosphorus: 20,
        potassium: 178,
        source: 'default'
      };
    }
  },

  // Get smart crop recommendations with enhanced accuracy
  getCropRecommendations: async (ph, moisture, om, soilType, state, nitrogen = 180, phosphorus = 25, potassium = 190, t) => {
    try {
      const recommendations = [];

      for (const [cropName, cropReq] of Object.entries(cropRequirements)) {
        const match = calculateCropMatch(
          ph, 
          moisture, 
          om, 
          soilType, 
          state, 
          nitrogen, 
          phosphorus, 
          potassium, 
          cropReq
        );
        recommendations.push({
          name: cropName,
          matchPercent: Math.round(match),
          matchLevel: match >= 80 ? t('soilHealth.excellent') : match >= 65 ? t('soilHealth.good') : match >= 50 ? t('soilHealth.average') : t('soilHealth.poor')
        });
      }

      // Sort by match percentage
      recommendations.sort((a, b) => b.matchPercent - a.matchPercent);

      return {
        best: recommendations.filter((r) => r.matchPercent >= 75),
        average: recommendations.filter((r) => r.matchPercent >= 50 && r.matchPercent < 75),
        notRecommended: recommendations.filter((r) => r.matchPercent < 50)
      };
    } catch (e) {
      console.error('Crop recommendation error:', e);
      return { best: [], average: [], notRecommended: [] };
    }
  },

  // Get soil improvement suggestions with enhanced accuracy
  getSoilImprovementSuggestions: (ph, moisture, om, soilType, nitrogen = 180, phosphorus = 25, potassium = 190) => {
    return getSoilImprovements(ph, moisture, om, soilType, nitrogen, phosphorus, potassium);
  }
};

export default soilService;
