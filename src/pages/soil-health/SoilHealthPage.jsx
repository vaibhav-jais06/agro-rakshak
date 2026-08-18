import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ArrowLeft, MapPin, Search, Thermometer, Droplets, Wind, Activity, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import soilService from '../../services/soilService';
import CropRecommendations from '../../components/soil/CropRecommendations';
import SoilImprovements from '../../components/soil/SoilImprovements';
import SoilQATab from '../../components/soil/SoilQATab';

export default function SoilHealthPage({ user }) {
  const { t } = useTranslation();
  const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
  const navigate = useNavigate();
  const [locationInfo, setLocationInfo] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [formData, setFormData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicMatter: '',
    moisture: '',
    soilType: '',
    temperature: ''
  });
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [state, setState] = useState('');
  const [cropRecommendations, setCropRecommendations] = useState(null);
  const [soilImprovements, setSoilImprovements] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingLocations, setSearchingLocations] = useState(false);

  const updateField = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const indianCities = [
    { name: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025 },
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
    { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
    { name: 'Chandigarh', state: 'Haryana', lat: 30.7333, lon: 76.8277 },
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673 },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6869, lon: 83.2185 },
    { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538 },
    { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
    { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
    { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
    { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973 },
    { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366 },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
    { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8711 },
    { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
    { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362 },
    { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322 },
    { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0026, lon: 76.9969 }
  ];

  const handleLocationSearch = (value) => {
    setManualLocation(value);
    if (value.trim().length === 0) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = indianCities.filter(city =>
      city.name.toLowerCase().includes(value.toLowerCase()) ||
      city.state.toLowerCase().includes(value.toLowerCase())
    );
    setLocationSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSuggestionClick = async (city) => {
    setManualLocation(city.name);
    setShowSuggestions(false);
    setSearchingLocations(true);
    try {
      const autoData = await soilService.getAutoSoilData(city.lat, city.lon);
      const locState = autoData.state;
      setState(locState);

      const locationName = `${city.name}, ${locState}`;
      const recommendation = t('soilHealth.recommendedFor', { soil: autoData.soilType.replace('-', ' ').toUpperCase(), ph: autoData.ph });

      setLocationInfo({ 
        name: locationName, 
        recommendation: recommendation,
        state: locState,
        data: { lat: city.lat, lon: city.lon, state: locState } 
      });
      
      await fetchWeather(city.lat, city.lon);

      setFormData(prev => ({
        ...prev,
        ph: autoData.ph || prev.ph,
        moisture: autoData.moisture || prev.moisture,
        organicMatter: autoData.organicMatter || prev.organicMatter,
        soilType: autoData.soilType || prev.soilType,
        nitrogen: autoData.nitrogen || prev.nitrogen,
        phosphorus: autoData.phosphorus || prev.phosphorus,
        potassium: autoData.potassium || prev.potassium
      }));
      setError('');
    } catch (err) {
      setError(t('soilHealth.failedToLoadLocationData'));
    } finally {
      setSearchingLocations(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`);
      const data = await r.json();
      const tempC = data?.current?.temperature_2m;
      const humidity = data?.current?.relative_humidity_2m;
      const code = data?.current?.weather_code;
      
      let condition = 'Unknown';
      if (code === 0) condition = 'Clear';
      else if (code === 1 || code === 2) condition = 'Partly Cloudy';
      else if (code === 3) condition = 'Cloudy';
      else if (code >= 45 && code <= 48) condition = 'Fog';
      else if (code >= 51 && code <= 57) condition = 'Drizzle';
      else if (code >= 61 && code <= 67) condition = 'Rain';
      else if (code >= 71 && code <= 77) condition = 'Snow';
      else if (code >= 80 && code <= 82) condition = 'Rain Showers';
      else if (code >= 85 && code <= 86) condition = 'Snow Showers';
      else if (code >= 95 && code <= 99) condition = 'Thunderstorm';
      
      setWeatherInfo({ temp: tempC, humidity, condition });
      if (typeof tempC === 'number') updateField('temperature', tempC.toFixed(1));
    } catch (e) {
      console.error("SoilHealth weather fetch error", e);
    }
  };

  const detectLocation = async () => {
    setLoadingLocation(true);
    setError('');
    try {
      if (!navigator.geolocation) {
        setError(t('soilHealth.geolocationNotSupported'));
        setLoadingLocation(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const autoData = await soilService.getAutoSoilData(latitude, longitude);
          const locState = autoData.state;
          setState(locState);

          const locationName = `${locState} (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;
          const recommendation = t('soilHealth.recommendedFor', { soil: autoData.soilType.replace('-', ' ').toUpperCase(), ph: autoData.ph });

          setLocationInfo({
            name: locationName,
            recommendation: recommendation,
            state: locState,
            data: { lat: latitude, lon: longitude, state: locState }
          });

          setFormData(prev => ({
            ...prev,
            ph: autoData.ph || prev.ph,
            moisture: autoData.moisture || prev.moisture,
            organicMatter: autoData.organicMatter || prev.organicMatter,
            soilType: autoData.soilType || prev.soilType,
            nitrogen: autoData.nitrogen || prev.nitrogen,
            phosphorus: autoData.phosphorus || prev.phosphorus,
            potassium: autoData.potassium || prev.potassium
          }));

          await fetchWeather(latitude, longitude);
        } catch (e) {
          setLocationInfo({ name: `${t('soilHealth.latitudePrefix')}${latitude.toFixed(4)}, ${t('soilHealth.longitudePrefix')}${longitude.toFixed(4)}`, data: null });
        } finally {
          setLoadingLocation(false);
        }
      }, () => {
        setError(t('soilHealth.couldNotDetectLocation'));
        setLoadingLocation(false);
      });
    } catch (e) {
      setError(t('soilHealth.locationDetectionFailed'));
      setLoadingLocation(false);
    }
  };

  const setManualLocationHandler = async () => {
    setError('');
    if (!manualLocation.trim()) return;
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(manualLocation)}&count=1`);
      const data = await r.json();
      if (!data || !data.results || data.results.length === 0) {
        setError(t('soilHealth.couldNotFindLocation'));
        return;
      }
      const loc = data.results[0];
      const lat = loc.latitude;
      const lon = loc.longitude;
      const infoName = `${loc.name}, ${loc.country || ''}`.trim();

      const autoData = await soilService.getAutoSoilData(lat, lon);
      const locState = autoData.state;
      setState(locState);

      const locationName = `${infoName} - ${locState}`;
      const recommendation = t('soilHealth.recommendedFor', { soil: autoData.soilType.replace('-', ' ').toUpperCase(), ph: autoData.ph });

      setLocationInfo({ 
        name: locationName, 
        recommendation: recommendation,
        state: locState,
        data: { lat, lon, state: locState } 
      });
      
      await fetchWeather(lat, lon);

      setFormData(prev => ({
        ...prev,
        ph: autoData.ph || prev.ph,
        moisture: autoData.moisture || prev.moisture,
        organicMatter: autoData.organicMatter || prev.organicMatter,
        soilType: autoData.soilType || prev.soilType,
        nitrogen: autoData.nitrogen || prev.nitrogen,
        phosphorus: autoData.phosphorus || prev.phosphorus,
        potassium: autoData.potassium || prev.potassium
      }));
    } catch {
      setError(t('soilHealth.failedToSetLocation'));
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResults(null);
    setCropRecommendations(null);
    setSoilImprovements(null);

    try {
      const numPh = parseFloat(formData.ph) || 7.0;
      const numMoisture = parseFloat(formData.moisture) || 18;
      const numOM = parseFloat(formData.organicMatter) || 1.0;
      const numNitrogen = parseFloat(formData.nitrogen) || 180;
      const numPhosphorus = parseFloat(formData.phosphorus) || 25;
      const numPotassium = parseFloat(formData.potassium) || 190;
      const soilT = formData.soilType || 'loamy';

      const crops = await soilService.getCropRecommendations(
        numPh, numMoisture, numOM, soilT, state, numNitrogen, numPhosphorus, numPotassium, t
      );
      setCropRecommendations(crops);

      const improvements = soilService.getSoilImprovementSuggestions(
        numPh, numMoisture, numOM, soilT, numNitrogen, numPhosphorus, numPotassium
      );
      setSoilImprovements(improvements);

      try {
        const res = await axios.post(`${API_BASE}/api/soil/analysis`, formData);
        setResults(res.data);
      } catch (err) {
        console.warn('Backend analysis unavailable');
      }
    } catch (err) {
      setError(t('soilHealth.analysisError'));
    } finally {
      setSubmitting(false);
    }
  };

  const clearAll = () => {
    setFormData({ ph: '', nitrogen: '', phosphorus: '', potassium: '', organicMatter: '', moisture: '', soilType: '', temperature: '' });
    setResults(null);
    setError('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-text-primary pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">{t('weatherIntelligence.backToDashboard')}</span>
          </motion.button>
          <h1 className="font-semibold text-lg">{t('features.soilHealth')}</h1>
          <div className="w-24" /> 
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Location Section */}
        <section className="glass-card rounded-3xl p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{t('soilHealth.yourLocation')}</h2>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={detectLocation} 
                disabled={loadingLocation} 
                className="px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
              >
                <MapPin className="w-4 h-4" />
                {t('soilHealth.detectMyLocation')}
              </button>
              
              <div className="flex-1 min-w-[220px] relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input 
                  value={manualLocation} 
                  onChange={(e) => handleLocationSearch(e.target.value)} 
                  onFocus={() => manualLocation.trim().length > 0 && setShowSuggestions(true)}
                  placeholder={t('soilHealth.enterCityPlaceholder')}
                  className="w-full bg-background border border-transparent focus:bg-white focus:border-primary/20 rounded-xl py-3 pl-10 pr-4 outline-none transition-all"
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {locationSuggestions.map((city, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(city)}
                        disabled={searchingLocations}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                      >
                        <div className="font-medium text-text-primary">{city.name}</div>
                        <div className="text-xs text-text-secondary">{city.state}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={setManualLocationHandler} 
                disabled={searchingLocations} 
                className="px-6 py-3 bg-white border border-border text-text-primary rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('soilHealth.setLocation')}
              </button>
            </div>

            <AnimatePresence>
              {locationInfo && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-green-50/50 rounded-2xl p-4 border border-green-100"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-primary flex items-center gap-2">
                         {locationInfo.name}
                         <Check className="w-4 h-4" />
                      </div>
                      {locationInfo.recommendation && (
                        <div className="text-sm text-text-secondary mt-1">{locationInfo.recommendation}</div>
                      )}
                    </div>
                    {weatherInfo && (
                      <div className="flex gap-4 text-sm text-text-secondary">
                         <div className="flex flex-col items-center">
                           <Thermometer className="w-4 h-4 mb-1" />
                           <span>{t('soilHealth.temperatureDisplay', { temp: typeof weatherInfo.temp === 'number' ? weatherInfo.temp.toFixed(1) : '--' })}</span>
                         </div>
                         <div className="flex flex-col items-center">
                           <Droplets className="w-4 h-4 mb-1" />
                           <span>{t('soilHealth.humidityDisplay', { humidity: typeof weatherInfo.humidity === 'number' ? weatherInfo.humidity : '--' })}</span>
                         </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Input Form */}
        <form onSubmit={submitForm} className="glass-card rounded-3xl p-6 sm:p-8 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">{t('soilHealth.parametersTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('soilHealth.phLabel')}</label>
              <input type="number" step="0.1" min="0" max="14" value={formData.ph} onChange={(e) => updateField('ph', e.target.value)} className="input-field" />
              <div className="text-xs text-text-secondary">{t('soilHealth.optimalPhRange')}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('soilHealth.nitrogenLabel')}</label>
              <input type="number" step="0.1" min="0" value={formData.nitrogen} onChange={(e) => updateField('nitrogen', e.target.value)} className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('soilHealth.phosphorusLabel')}</label>
              <input type="number" step="0.1" min="0" value={formData.phosphorus} onChange={(e) => updateField('phosphorus', e.target.value)} className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('soilHealth.potassiumLabel')}</label>
              <input type="number" step="0.1" min="0" value={formData.potassium} onChange={(e) => updateField('potassium', e.target.value)} className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('soilHealth.organicMatterLabel')}</label>
              <input type="number" step="0.1" min="0" max="100" value={formData.organicMatter} onChange={(e) => updateField('organicMatter', e.target.value)} className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('soilHealth.moistureLabel')}</label>
              <input type="number" step="0.1" min="0" max="100" value={formData.moisture} onChange={(e) => updateField('moisture', e.target.value)} className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('soilHealth.soilTypeLabel')}</label>
              <select value={formData.soilType} onChange={(e) => updateField('soilType', e.target.value)} className="input-field">
                <option value="">{t('soilHealth.selectSoilType')}</option>
                <option value="sandy">{t('soilHealth.sandy')}</option>
                <option value="loamy">{t('soilHealth.loamy')}</option>
                <option value="clayey">{t('soilHealth.clayey')}</option>
                <option value="silt">{t('soilHealth.silt')}</option>
                <option value="peaty">{t('soilHealth.peaty')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{t('soilHealth.temperatureLabel')}</label>
              <input type="number" step="0.1" min="-10" max="50" value={formData.temperature} onChange={(e) => updateField('temperature', e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-8">
            <button 
              type="submit" 
              disabled={submitting} 
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {submitting ? t('common.loading') : t('common.analyze')}
            </button>
            <button 
              type="button" 
              onClick={clearAll} 
              className="px-6 py-3 bg-white border border-border text-text-primary rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              {t('common.clearAll')}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </form>



        {/* Smart Crop Recommendations */}
        {cropRecommendations && (
          <CropRecommendations recommendations={cropRecommendations} state={state} />
        )}

        {/* Soil Improvements */}
        {soilImprovements && (
          <SoilImprovements
            suggestions={soilImprovements}
            ph={parseFloat(formData.ph) || 7}
            moisture={parseFloat(formData.moisture) || 18}
            om={parseFloat(formData.organicMatter) || 1}
            soilType={formData.soilType || 'loamy'}
            nitrogen={parseFloat(formData.nitrogen) || 180}
            phosphorus={parseFloat(formData.phosphorus) || 25}
            potassium={parseFloat(formData.potassium) || 190}
          />
        )}

        {/* Tabs */}
        {(results || cropRecommendations || soilImprovements) && (
          <div className="glass-card rounded-3xl bg-white overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  activeTab === 'analysis'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                {t('common.analysisRecommendations')}
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  activeTab === 'qa'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                {t('soilHealth.askQuestions')}
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'analysis' && (
                <div className="text-text-secondary">
                  <p>{t('soilHealth.analysisInfo')}</p>
                </div>
              )}
              {activeTab === 'qa' && (
                <SoilQATab />
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
