const axios = require('axios');
const SoilAnalysis = require('../models/SoilAnalysis');

const AGRO_API_KEY = process.env.AGRO_API_KEY;

// Crop optimal ranges and weights (ported from HTML spec)
const CROP_OPTIMAL_RANGES = {
  'Wheat': { ph: [6.0, 7.5], N: [180, 250], P: [20, 35], K: [250, 300], weights: { N: 0.35, P: 0.25, K: 0.2, ph: 0.2 } },
  'Rice': { ph: [5.5, 6.5], N: [220, 350], P: [30, 50], K: [280, 350], weights: { N: 0.4, P: 0.2, K: 0.2, ph: 0.2 }, soilType: ['clay', 'clay-loam', 'silt'] },
  'Cotton': { ph: [6.0, 7.0], N: [150, 220], P: [25, 45], K: [200, 300], weights: { N: 0.3, P: 0.3, K: 0.2, ph: 0.2 } },
  'Sugarcane': { ph: [6.5, 7.5], N: [250, 400], P: [30, 60], K: [300, 450], weights: { N: 0.35, P: 0.2, K: 0.3, ph: 0.15 } },
  'Maize': { ph: [6.0, 7.0], N: [180, 300], P: [25, 40], K: [250, 350], weights: { N: 0.35, P: 0.2, K: 0.25, ph: 0.2 } },
  'Soybean': { ph: [6.0, 7.5], N: [100, 180], P: [20, 35], K: [200, 280], weights: { N: 0.2, P: 0.3, K: 0.3, ph: 0.2 } },
  'Potato': { ph: [5.0, 6.5], N: [150, 220], P: [35, 50], K: [300, 400], weights: { N: 0.2, P: 0.3, K: 0.4, ph: 0.1 } },
  'Mustard': { ph: [6.0, 7.5], N: [150, 250], P: [20, 40], K: [200, 300], weights: { N: 0.35, P: 0.25, K: 0.2, ph: 0.2 } },
  'Groundnut': { ph: [6.0, 7.0], N: [80, 150], P: [15, 30], K: [150, 250], weights: { N: 0.15, P: 0.35, K: 0.3, ph: 0.2 } },
  'Pulses': { ph: [6.5, 7.5], N: [50, 120], P: [15, 30], K: [180, 250], weights: { N: 0.1, P: 0.4, K: 0.3, ph: 0.2 } }
};

const indianSoilProperties = {
  'Punjab': { soilType: 'alluvial', basePh: 7.2, baseN: 250, baseP: 30, baseK: 280, organicMatterBase: 0.8, regionFactor: 1.0 },
  'Haryana': { soilType: 'alluvial', basePh: 7.5, baseN: 240, baseP: 28, baseK: 270, organicMatterBase: 0.7, regionFactor: 0.95 },
  'Uttar Pradesh': { soilType: 'alluvial', basePh: 7.0, baseN: 220, baseP: 25, baseK: 260, organicMatterBase: 1.2, regionFactor: 1.0 },
  'Maharashtra': { soilType: 'black', basePh: 6.8, baseN: 200, baseP: 22, baseK: 240, organicMatterBase: 1.0, regionFactor: 0.9 },
  'Gujarat': { soilType: 'black', basePh: 7.3, baseN: 210, baseP: 24, baseK: 250, organicMatterBase: 0.9, regionFactor: 0.9 },
  'Rajasthan': { soilType: 'sandy', basePh: 8.0, baseN: 180, baseP: 18, baseK: 220, organicMatterBase: 0.5, regionFactor: 0.8 },
  'Tamil Nadu': { soilType: 'red', basePh: 6.5, baseN: 230, baseP: 26, baseK: 270, organicMatterBase: 1.5, regionFactor: 1.0 },
  'Karnataka': { soilType: 'red', basePh: 6.7, baseN: 215, baseP: 23, baseK: 255, organicMatterBase: 1.2, regionFactor: 0.95 },
  'Andhra Pradesh': { soilType: 'red', basePh: 6.9, baseN: 225, baseP: 25, baseK: 265, organicMatterBase: 1.3, regionFactor: 1.0 },
  'West Bengal': { soilType: 'alluvial', basePh: 6.2, baseN: 240, baseP: 27, baseK: 275, organicMatterBase: 2.0, regionFactor: 1.1 },
  'Bihar': { soilType: 'alluvial', basePh: 6.8, baseN: 230, baseP: 26, baseK: 270, organicMatterBase: 1.4, regionFactor: 1.0 },
  'Madhya Pradesh': { soilType: 'black', basePh: 7.1, baseN: 205, baseP: 22, baseK: 245, organicMatterBase: 1.1, regionFactor: 0.95 },
  'Odisha': { soilType: 'red', basePh: 6.4, baseN: 220, baseP: 24, baseK: 260, organicMatterBase: 1.6, regionFactor: 1.0 },
  'Assam': { soilType: 'alluvial', basePh: 5.8, baseN: 250, baseP: 28, baseK: 280, organicMatterBase: 2.5, regionFactor: 1.2 },
  'Kerala': { soilType: 'laterite', basePh: 5.5, baseN: 245, baseP: 27, baseK: 275, organicMatterBase: 3.0, regionFactor: 1.15 },
  'Jammu and Kashmir': { soilType: 'alluvial', basePh: 6.8, baseN: 220, baseP: 24, baseK: 260, organicMatterBase: 1.8, regionFactor: 1.0 }
};

const cityToState = {
  delhi: 'Haryana', mumbai: 'Maharashtra', bangalore: 'Karnataka', chennai: 'Tamil Nadu', hyderabad: 'Andhra Pradesh', kolkata: 'West Bengal', ahmedabad: 'Gujarat', pune: 'Maharashtra', surat: 'Gujarat', jaipur: 'Rajasthan', lucknow: 'Uttar Pradesh', kanpur: 'Uttar Pradesh', nagpur: 'Maharashtra', indore: 'Madhya Pradesh', thane: 'Maharashtra', bhopal: 'Madhya Pradesh', visakhapatnam: 'Andhra Pradesh', patna: 'Bihar', vadodara: 'Gujarat', ghaziabad: 'Uttar Pradesh', ludhiana: 'Punjab', agra: 'Uttar Pradesh', nashik: 'Maharashtra', faridabad: 'Haryana', meerut: 'Uttar Pradesh', rajkot: 'Gujarat', varanasi: 'Uttar Pradesh', srinagar: 'Jammu and Kashmir', jammu: 'Jammu and Kashmir', kashmir: 'Jammu and Kashmir', amritsar: 'Punjab', chandigarh: 'Punjab'
};

const reverseGeocode = async (lat, lon) => {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { format: 'json', lat, lon },
      headers: { 'User-Agent': 'AgroRakshak/1.0' }
    });
    return res.data?.display_name || `${lat}, ${lon}`;
  } catch (e) {
    return `${lat}, ${lon}`;
  }
};

const findIndianState = (locationName) => {
  if (!locationName) return null;
  const lowerLocation = String(locationName).toLowerCase();
  for (const state of Object.keys(indianSoilProperties)) {
    if (lowerLocation.includes(state.toLowerCase())) return state;
  }
  for (const city of Object.keys(cityToState)) {
    if (lowerLocation.includes(city)) return cityToState[city];
  }
  return null;
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const rangeCloseness = (val, [min, max]) => {
  if (typeof val !== 'number') return 0;
  if (val >= min && val <= max) return 1;
  if (val < min) return clamp(1 - (min - val) / (min || 1), 0, 1) * 0.6;
  return clamp(1 - (val - max) / (max || 1), 0, 1) * 0.6;
};

const computeCropMatch = (sample) => {
  const soilType = sample.soilType || '';
  const results = Object.keys(CROP_OPTIMAL_RANGES).map((crop) => {
    const cfg = CROP_OPTIMAL_RANGES[crop];
    const w = cfg.weights;
    const scoreN = rangeCloseness(sample.nitrogen, cfg.N) * (w.N || 0);
    const scoreP = rangeCloseness(sample.phosphorus, cfg.P) * (w.P || 0);
    const scoreK = rangeCloseness(sample.potassium, cfg.K) * (w.K || 0);
    const scorePh = rangeCloseness(sample.ph, cfg.ph) * (w.ph || 0);
    let total = scoreN + scoreP + scoreK + scorePh;
    if (cfg.soilType && soilType) {
      const compatible = cfg.soilType.includes(soilType);
      if (!compatible) total *= 0.85;
    }
    const percent = clamp(total, 0, 1);
    let level = 'low';
    if (percent >= 0.75) level = 'high'; else if (percent >= 0.55) level = 'medium';
    return { name: crop, matchPercent: Math.round(percent * 100), matchLevel: level };
  });
  results.sort((a, b) => b.matchPercent - a.matchPercent);
  return results.slice(0, 3);
};

const computeQuality = (sample) => {
  const baseWeights = { N: 0.35, P: 0.25, K: 0.2, ph: 0.2 };
  const genRanges = { N: [150, 300], P: [20, 40], K: [200, 350], ph: [6.0, 7.5] };
  const score = (
    rangeCloseness(sample.nitrogen, genRanges.N) * baseWeights.N +
    rangeCloseness(sample.phosphorus, genRanges.P) * baseWeights.P +
    rangeCloseness(sample.potassium, genRanges.K) * baseWeights.K +
    rangeCloseness(sample.ph, genRanges.ph) * baseWeights.ph
  );
  const percent = Math.round(clamp(score, 0, 1) * 100);
  let status = 'soilHealth.statusPoor';
  if (percent >= 80) status = 'soilHealth.statusExcellent'; else if (percent >= 65) status = 'soilHealth.statusGood'; else if (percent >= 50) status = 'soilHealth.statusFair';
  return { score: percent, status };
};

const generateEnhancements = (sample) => {
  const tips = [];
  if (typeof sample.ph === 'number') {
    if (sample.ph < 6.0) tips.push('Apply lime to raise soil pH towards neutral.');
    if (sample.ph > 7.5) tips.push('Apply elemental sulfur to lower soil pH.');
  }
  if (typeof sample.organicMatter === 'number' && sample.organicMatter < 2) {
    tips.push('Increase organic matter using compost, green manure, or mulch.');
  }
  if (typeof sample.nitrogen === 'number' && sample.nitrogen < 150) {
    tips.push('Add nitrogen through urea or organic sources; split applications recommended.');
  }
  if (typeof sample.phosphorus === 'number' && sample.phosphorus < 20) {
    tips.push('Apply phosphorus (DAP/SSP) near root zone for better uptake.');
  }
  if (typeof sample.potassium === 'number' && sample.potassium < 200) {
    tips.push('Apply potassium (MOP) and maintain moisture for uptake.');
  }
  if (typeof sample.moisture === 'number') {
    if (sample.moisture < 25) tips.push('Use mulch and drip irrigation to conserve moisture.');
    if (sample.moisture > 40) tips.push('Improve drainage; avoid waterlogging to protect roots.');
  }
  return tips;
};

const generateAnalysisDetails = (sample) => {
  const details = [];
  const pushDetail = (label, value, optimal, status) => {
    details.push({ label, value, optimal, status });
  };
  const statusByRange = (val, [min, max]) => {
    if (typeof val !== 'number') return 'warning';
    if (val >= min && val <= max) return 'good';
    const diff = Math.min(Math.abs(val - min), Math.abs(val - max));
    return diff < (max - min) * 0.25 ? 'warning' : 'danger';
  };
  pushDetail('pH', sample.ph, '6.0 - 7.5', statusByRange(sample.ph, [6.0, 7.5]));
  pushDetail('Nitrogen (kg/ha)', sample.nitrogen, '150 - 300', statusByRange(sample.nitrogen, [150, 300]));
  pushDetail('Phosphorus (kg/ha)', sample.phosphorus, '20 - 40', statusByRange(sample.phosphorus, [20, 40]));
  pushDetail('Potassium (kg/ha)', sample.potassium, '200 - 350', statusByRange(sample.potassium, [200, 350]));
  if (typeof sample.organicMatter === 'number') pushDetail('Organic Matter (%)', sample.organicMatter, '2 - 5', statusByRange(sample.organicMatter, [2, 5]));
  if (typeof sample.moisture === 'number') pushDetail('Moisture (%)', sample.moisture, '25 - 40', statusByRange(sample.moisture, [25, 40]));
  if (sample.soilType) pushDetail('Soil Type', sample.soilType, 'Depends on crop', 'good');
  if (typeof sample.temperature === 'number') pushDetail('Avg Temperature (°C)', sample.temperature, '20 - 30', statusByRange(sample.temperature, [20, 30]));
  return details;
};

exports.getAgroSoil = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!AGRO_API_KEY) {
      return res.status(500).json({ success: false, message: 'AGRO_API_KEY not configured' });
    }
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'lat and lon are required' });
    }
    const url = `https://api.agromonitoring.com/agro/1.0/soil?lat=${lat}&lon=${lon}&appid=${AGRO_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });
    const locationName = await reverseGeocode(lat, lon);
    res.json({ success: true, locationName, data: response.data });
  } catch (error) {
    console.error('Agro soil error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch soil data' });
  }
};

exports.getLocationInfo = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'lat and lon are required' });
    }
    const locationName = await reverseGeocode(lat, lon);
    res.json({ success: true, locationName });
  } catch (error) {
    console.error('Location info error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get location info' });
  }
};

const getExistingPolygons = async () => {
  if (!AGRO_API_KEY) return [];
  try {
    const url = `https://api.agromonitoring.com/agro/1.0/polygons?appid=${AGRO_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });
    return Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    return [];
  }
};

const findExistingPolygon = async (lat, lon) => {
  try {
    const polygons = await getExistingPolygons();
    const tolerance = 0.01;
    for (const polygon of polygons) {
      const coords = polygon?.geo_json?.geometry?.coordinates?.[0];
      if (coords && coords.length > 2) {
        const centerLon = (coords[0][0] + coords[2][0]) / 2;
        const centerLat = (coords[0][1] + coords[2][1]) / 2;
        if (Math.abs(centerLat - lat) < tolerance && Math.abs(centerLon - lon) < tolerance) {
          return polygon.id;
        }
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

const createPolygon = async (lat, lon) => {
  if (!AGRO_API_KEY) return null;
  const existing = await findExistingPolygon(lat, lon);
  if (existing) return existing;
  const offset = 0.01;
  const coordinates = [
    [
      [lon - offset, lat - offset],
      [lon + offset, lat - offset],
      [lon + offset, lat + offset],
      [lon - offset, lat + offset],
      [lon - offset, lat - offset]
    ]
  ];
  const payload = {
    name: `Field_${Date.now()}`,
    geo_json: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates } }
  };
  try {
    const url = `https://api.agromonitoring.com/agro/1.0/polygons?appid=${AGRO_API_KEY}`;
    const response = await axios.post(url, payload, { timeout: 10000 });
    return response.data?.id || null;
  } catch (err) {
    if (err.response && err.response.status === 422) {
      const foundId = await findExistingPolygon(lat, lon);
      if (foundId) return foundId;
      return null;
    }
    return null;
  }
};

const fetchSoilByPolygon = async (polygonId) => {
  if (!AGRO_API_KEY) return null;
  try {
    const url = `https://api.agromonitoring.com/agro/1.0/soil?polyid=${polygonId}&appid=${AGRO_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });
    return response.data || null;
  } catch (e) {
    return null;
  }
};

const fetchSatelliteData = async (polygonId, startDate, endDate) => {
  if (!AGRO_API_KEY) return null;
  try {
    const url = `https://api.agromonitoring.com/agro/1.0/image/search?start=${startDate}&end=${endDate}&polyid=${polygonId}&appid=${AGRO_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });
    return Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    return null;
  }
};

const predictNitrogen = (ph, organicMatter, temperature, moisture, baseN, regionFactor) => {
  let n = (baseN || 200) * (regionFactor || 1);
  if (typeof ph === 'number') {
    const f = ph >= 6.5 && ph <= 7.5 ? 1.1 : ph >= 6.0 && ph < 6.5 ? 1.0 : ph > 7.5 && ph <= 8.0 ? 0.95 : 0.85;
    n *= f;
  }
  if (typeof organicMatter === 'number') n *= 1 + organicMatter * 0.15;
  if (typeof temperature === 'number') {
    const f = temperature >= 20 && temperature <= 30 ? 1.05 : temperature < 15 ? 0.9 : temperature > 35 ? 0.9 : 1.0;
    n *= f;
  }
  if (typeof moisture === 'number') {
    const f = moisture >= 25 && moisture <= 40 ? 1.05 : moisture < 20 ? 0.9 : moisture > 50 ? 0.95 : 1.0;
    n *= f;
  }
  return Math.round(n);
};

const predictPhosphorus = (ph, organicMatter, temperature, moisture, baseP, regionFactor) => {
  let p = (baseP || 25) * (regionFactor || 1);
  if (typeof ph === 'number') {
    const f = ph >= 6.0 && ph <= 7.0 ? 1.05 : ph < 6.0 ? 0.9 : ph > 7.5 ? 0.95 : 1.0;
    p *= f;
  }
  if (typeof organicMatter === 'number') p *= 1 + organicMatter * 0.05;
  if (typeof temperature === 'number') p *= temperature >= 18 && temperature <= 28 ? 1.03 : 1.0;
  if (typeof moisture === 'number') p *= moisture >= 25 && moisture <= 40 ? 1.03 : 0.98;
  return Math.round(p);
};

const predictPotassium = (ph, organicMatter, temperature, moisture, baseK, regionFactor) => {
  let k = (baseK || 240) * (regionFactor || 1);
  if (typeof ph === 'number') k *= ph >= 6.0 && ph <= 7.5 ? 1.02 : 0.98;
  if (typeof organicMatter === 'number') k *= 1 + organicMatter * 0.03;
  if (typeof temperature === 'number') k *= temperature >= 18 && temperature <= 32 ? 1.02 : 1.0;
  if (typeof moisture === 'number') k *= moisture >= 25 && moisture <= 40 ? 1.02 : 0.99;
  return Math.round(k);
};

const predictIndianSoilNutrients = (stateName, ph, organicMatter, temperature, moisture) => {
  const st = stateName && indianSoilProperties[stateName] ? indianSoilProperties[stateName] : null;
  const soilType = st ? st.soilType : '';
  const n = predictNitrogen(ph, organicMatter, temperature, moisture, st ? st.baseN : 200, st ? st.regionFactor : 1);
  const p = predictPhosphorus(ph, organicMatter, temperature, moisture, st ? st.baseP : 25, st ? st.regionFactor : 1);
  const k = predictPotassium(ph, organicMatter, temperature, moisture, st ? st.baseK : 240, st ? st.regionFactor : 1);
  return { soilType, nitrogen: n, phosphorus: p, potassium: k };
};

exports.testAgroKey = async (req, res) => {
  try {
    if (!AGRO_API_KEY) return res.status(500).json({ success: false, message: 'AGRO_API_KEY not configured' });
    const url = `https://api.agromonitoring.com/agro/1.0/polygons?appid=${AGRO_API_KEY}`;
    const response = await axios.get(url, { timeout: 10000 });
    res.json({ success: true, status: response.status, ok: response.status >= 200 && response.status < 300 });
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(200).json({ success: false, status, ok: false });
  }
};

exports.autoFillFromLocation = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat and lon are required' });
    const locationName = await reverseGeocode(lat, lon);
    const state = findIndianState(locationName);
    let polygonId = null;
    if (AGRO_API_KEY) {
      polygonId = await createPolygon(parseFloat(lat), parseFloat(lon));
    }
    const soilData = polygonId ? await fetchSoilByPolygon(polygonId) : null;
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - 30 * 24 * 60 * 60;
    const satellite = polygonId ? await fetchSatelliteData(polygonId, startDate, endDate) : null;
    let latestNdvi = null;
    if (Array.isArray(satellite) && satellite.length > 0) {
      const last = satellite[satellite.length - 1];
      latestNdvi = last?.stats?.ndvi || null;
    }
    let temperature = soilData?.t0 ? (soilData.t0 - 273.15) : null;
    let moisturePct = soilData?.moisture ? soilData.moisture * 100 : null;
    let ph = typeof soilData?.ph === 'number' ? soilData.ph : null;
    let organicMatter = typeof soilData?.organicMatterPct === 'number' ? soilData.organicMatterPct : null;
    if (!organicMatter && typeof latestNdvi === 'number' && latestNdvi > 0.3) {
      organicMatter = parseFloat((latestNdvi * 3).toFixed(1));
    }
    const preds = predictIndianSoilNutrients(state, ph, organicMatter, temperature, moisturePct);
    res.json({
      success: true,
      locationName,
      polygonId,
      soil: soilData || null,
      satellite: { latestNdvi },
      predictions: { state, soilType: preds.soilType, nitrogen: preds.nitrogen, phosphorus: preds.phosphorus, potassium: preds.potassium },
      estimated: { organicMatter }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to auto-fill from location' });
  }
};

exports.analyzeSoil = async (req, res) => {
  try {
    const sample = req.body || {};
    const { userId, locationName, lat, lon } = req.body || {};
    if (!sample || Object.keys(sample).length === 0) {
      return res.status(400).json({ success: false, message: 'No sample data provided' });
    }

    const recs = [];
    if (typeof sample.nitrogen === 'number') {
      if (sample.nitrogen < 150) recs.push({ input: 'N', amount: '30 kg/acre', note: 'Increase nitrogen for better yield' });
      else if (sample.nitrogen > 350) recs.push({ input: 'N', amount: 'Reduce', note: 'Nitrogen seems high, avoid overuse' });
    }
    if (typeof sample.phosphorus === 'number') {
      if (sample.phosphorus < 20) recs.push({ input: 'P', amount: '10 kg/acre' });
    }
    if (typeof sample.potassium === 'number') {
      if (sample.potassium < 200) recs.push({ input: 'K', amount: '20 kg/acre' });
    }
    if (typeof sample.organicMatter === 'number' && sample.organicMatter < 2) {
      recs.push({ note: 'Increase organic matter using compost or green manure.' });
    }

    const state = locationName ? findIndianState(locationName) : null;
    const crops = computeCropMatch(sample);
    const quality = computeQuality(sample);
    const enhancements = generateEnhancements(sample);
    const analysisDetails = generateAnalysisDetails(sample);

    const record = new SoilAnalysis({
      userId: userId || null,
      locationName: locationName || null,
      coordinates: { lat, lon },
      input: {
        ph: sample.ph,
        nitrogen: sample.nitrogen,
        phosphorus: sample.phosphorus,
        potassium: sample.potassium,
        organicMatter: sample.organicMatter,
        moisture: sample.moisture,
        soilType: sample.soilType,
        temperature: sample.temperature
      },
      recommendations: recs,
      external: { agro: null }
    });
    await record.save();

    res.json({
      success: true,
      sampleReceived: true,
      quality,
      crops,
      analysisDetails,
      enhancements,
      recommendations: recs,
      region: state || null,
      savedId: record._id
    });
  } catch (error) {
    console.error('Analyze soil error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to analyze soil' });
  }
};
