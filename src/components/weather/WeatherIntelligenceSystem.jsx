import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Search, Cloud, Droplets, Wind, ThermometerSun, Sun, CloudRain, AlertTriangle, Sprout, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import weatherService from '../../services/weatherService';

export default function WeatherIntelligenceSystem({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [locationName, setLocationName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cropRecommendations, setCropRecommendations] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    // Auto-detect location on mount
    fetchWeatherAuto();
  }, []);

  const fetchWeatherAuto = async () => {
    setLoading(true);
    try {
      const data = await weatherService.getCurrentWeatherAuto();
      setCurrentWeather(data);
      setLocationName(data?.locationName || '');

      // Get coordinates for forecast
      if (data?.raw?.coord) {
        const forecastData = await weatherService.getForecast(data.raw.coord.lat, data.raw.coord.lon);
        setForecast(forecastData);
        generateCropRecommendations(data, forecastData);
      }
    } catch (error) {
      console.error('Auto weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const results = await weatherService.searchLocation(value);
      setSuggestions(results);
    } catch (err) {
      console.error('Location search error:', err);
      setSuggestions([]);
    }
  };

  const selectLocation = async (suggestion) => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedLocation(suggestion);
    setLocationName(
      suggestion.name +
      (suggestion.state ? ', ' + suggestion.state : '') +
      (suggestion.country ? ', ' + suggestion.country : '')
    );

    setLoading(true);
    try {
      const weatherData = await weatherService.getCurrentWeather(suggestion.lat, suggestion.lon);
      setCurrentWeather(weatherData);

      const forecastData = await weatherService.getForecast(suggestion.lat, suggestion.lon);
      setForecast(forecastData);
      generateCropRecommendations(weatherData, forecastData);
    } catch (err) {
      console.error('Failed to load weather for selected location', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCropRecommendations = (current, forecast) => {
    if (!current || !forecast || forecast.length === 0) return;

    const avgTemp = current.temp;
    const avgHumidity = current.humidity || 65;
    const avgWind = current.windSpeed || 10;
    const rainChance = forecast[0]?.rainChance || 0;
    const now = new Date();
    const month = now.getMonth() + 1;
    const season = (month >= 6 && month <= 9) ? 'kharif' : ((month >= 10 || month <= 2) ? 'rabi' : 'summer');
    const rainWindow = season === 'kharif' ? 5 : 3;
    const rainThreshold = season === 'kharif' ? 50 : 60;
    const upcomingRain = forecast.slice(0, rainWindow).some(day => day.rainChance > rainThreshold);
    const highTemp = Math.max(...forecast.map(d => d.tempMax));
    const lowTemp = Math.min(...forecast.map(d => d.tempMin));

    const seasonFactors = {
      kharif: { irrigationLowHum: 45, irrigationModHum: 60, pestHum: 75, pestTemp: 26, diseaseHumHigh: 82, diseaseRainHigh: 60, diseaseHumMod: 70, diseaseRainMod: 40 },
      rabi: { irrigationLowHum: 50, irrigationModHum: 65, pestHum: 70, pestTemp: 22, diseaseHumHigh: 80, diseaseRainHigh: 55, diseaseHumMod: 68, diseaseRainMod: 35 },
      summer: { irrigationLowHum: 55, irrigationModHum: 70, pestHum: 65, pestTemp: 28, diseaseHumHigh: 78, diseaseRainHigh: 50, diseaseHumMod: 65, diseaseRainMod: 35 }
    };
    const F = seasonFactors[season];
    const cropSeason = {
      rice: 'kharif', wheat: 'rabi', cotton: 'kharif', sugarcane: 'kharif', maize: 'kharif', soybean: 'kharif', groundnut: 'summer', mustard: 'rabi', potato: 'rabi', tomato: 'summer', onion: 'rabi', turmeric: 'kharif', chilli: 'kharif', chickpea: 'rabi', pigeonPea: 'kharif', sunflower: 'kharif', bajra: 'kharif', jowar: 'kharif'
    };
    const seasonMatch = (c) => cropSeason[c] === season;

    const recommendations = {
      irrigation: {
        status: avgHumidity < F.irrigationLowHum ? 'high' : avgHumidity < F.irrigationModHum ? 'moderate' : 'low',
        message: avgHumidity < 50
          ? t('weatherIntelligence.messages.lowHumidityIrrigation', 'Low humidity detected. Consider irrigation soon.')
          : avgHumidity < 70
            ? t('weatherIntelligence.messages.moderateHumidityIrrigation', 'Moderate humidity. Monitor soil moisture.')
            : t('weatherIntelligence.messages.adequateHumidityIrrigation', 'Adequate humidity levels. Normal irrigation schedule.')
      },
      fertilizer: {
        status: upcomingRain ? 'optimal' : 'wait',
        message: upcomingRain
          ? t('weatherIntelligence.messages.rainExpectedFertilizer', 'Rain expected in next 3 days. Good time to apply fertilizer.')
          : t('weatherIntelligence.messages.noRainFertilizer', 'No significant rain expected. Consider delaying fertilizer application.')
      },
      pestRisk: {
        status: avgHumidity > F.pestHum && avgTemp > F.pestTemp ? 'high' : avgHumidity > (F.pestHum - 5) ? 'moderate' : 'low',
        message: avgHumidity > 75 && avgTemp > 25
          ? t('weatherIntelligence.messages.highPestRisk', 'High humidity and temperature - increased pest activity risk. Monitor crops closely.')
          : avgHumidity > 70
            ? t('weatherIntelligence.messages.moderatePestRisk', 'Moderate conditions may favor some pests. Regular monitoring recommended.')
            : t('weatherIntelligence.messages.lowPestRisk', 'Low pest risk conditions.')
      },
      diseaseRisk: {
        status: avgHumidity > F.diseaseHumHigh && rainChance > F.diseaseRainHigh ? 'high' : avgHumidity > F.diseaseHumMod && rainChance > F.diseaseRainMod ? 'moderate' : 'low',
        message: avgHumidity > 80 && rainChance > 60
          ? t('weatherIntelligence.messages.highDiseaseRisk', 'High humidity and rain expected - fungal disease risk elevated. Consider preventive measures.')
          : avgHumidity > 70 && rainChance > 40
            ? t('weatherIntelligence.messages.moderateDiseaseRisk', 'Moderate disease risk. Keep crops well-ventilated.')
            : t('weatherIntelligence.messages.lowDiseaseRisk', 'Low disease risk conditions.')
      },
      harvestTiming: {
        status: upcomingRain ? 'delay' : 'optimal',
        message: upcomingRain
          ? t('weatherIntelligence.messages.rainExpectedHarvest', 'Rain expected in coming days. Consider delaying harvest if possible.')
          : t('weatherIntelligence.messages.goodHarvestConditions', 'Good weather conditions for harvest activities.')
      },
      cropStress: {
        rice: {
          stress: (highTemp > 35 || lowTemp < 15) ? 'high' : (avgTemp < 20 || avgTemp > 32 || !seasonMatch('rice')) ? 'moderate' : 'low',
          message: highTemp > 35
            ? t('weatherIntelligence.cropStressMessages.rice.highTempStress')
            : lowTemp < 15
              ? t('weatherIntelligence.cropStressMessages.rice.lowTempStress')
              : t('weatherIntelligence.cropStressMessages.rice.optimalConditions')
        },
        wheat: {
          stress: (avgTemp > 30 || avgTemp < 10 || !seasonMatch('wheat')) ? 'moderate' : 'low',
          message: avgTemp > 30
            ? t('weatherIntelligence.cropStressMessages.wheat.warmConditions')
            : avgTemp < 10
              ? t('weatherIntelligence.cropStressMessages.wheat.coolConditions')
              : t('weatherIntelligence.cropStressMessages.wheat.idealConditions')
        },
        cotton: {
          stress: (avgTemp < 20 || avgHumidity < 40 || !seasonMatch('cotton')) ? 'moderate' : 'low',
          message: avgTemp < 20
            ? t('weatherIntelligence.cropStressMessages.cotton.coolTemperatures')
            : avgHumidity < 40
              ? t('weatherIntelligence.cropStressMessages.cotton.lowHumidity')
              : t('weatherIntelligence.cropStressMessages.cotton.goodConditions')
        },
        sugarcane: {
          stress: (avgTemp < 20 || avgTemp > 35 || !seasonMatch('sugarcane')) ? 'moderate' : 'low',
          message: avgTemp < 20
            ? t('weatherIntelligence.cropStressMessages.sugarcane.coolTemperatures')
            : avgTemp > 35
              ? t('weatherIntelligence.cropStressMessages.sugarcane.highTemperatures')
              : t('weatherIntelligence.cropStressMessages.sugarcane.optimalConditions')
        },
        maize: {
          stress: (avgTemp < 15 || avgTemp > 30 || avgHumidity < 50 || !seasonMatch('maize')) ? 'moderate' : 'low',
          message: avgTemp < 15
            ? t('weatherIntelligence.cropStressMessages.maize.coolTemperatures')
            : avgTemp > 30
              ? t('weatherIntelligence.cropStressMessages.maize.highTemperatures')
              : avgHumidity < 50
                ? t('weatherIntelligence.cropStressMessages.maize.lowHumidity')
                : t('weatherIntelligence.cropStressMessages.maize.favorableConditions')
        },
        soybean: {
          stress: (avgTemp < 15 || avgTemp > 32 || avgHumidity < 60 || !seasonMatch('soybean')) ? 'moderate' : 'low',
          message: avgTemp < 15
            ? t('weatherIntelligence.cropStressMessages.soybean.coolTemperatures')
            : avgTemp > 32
              ? t('weatherIntelligence.cropStressMessages.soybean.highTemperatures')
              : avgHumidity < 60
                ? t('weatherIntelligence.cropStressMessages.soybean.lowHumidity')
                : t('weatherIntelligence.cropStressMessages.soybean.optimalConditions')
        },
        groundnut: {
          stress: (avgTemp < 20 || avgTemp > 35 || rainChance > 70 || !seasonMatch('groundnut')) ? 'moderate' : 'low',
          message: avgTemp < 20
            ? t('weatherIntelligence.cropStressMessages.groundnut.coolTemperatures')
            : avgTemp > 35
              ? t('weatherIntelligence.cropStressMessages.groundnut.highTemperatures')
              : rainChance > 70
                ? t('weatherIntelligence.cropStressMessages.groundnut.heavyRain')
                : t('weatherIntelligence.cropStressMessages.groundnut.goodConditions')
        },
        mustard: {
          stress: (avgTemp > 25 || avgTemp < 10 || avgHumidity > 80 || !seasonMatch('mustard')) ? 'moderate' : 'low',
          message: avgTemp > 25
            ? t('weatherIntelligence.cropStressMessages.mustard.warmConditions')
            : avgTemp < 10
              ? t('weatherIntelligence.cropStressMessages.mustard.coolConditions')
              : avgHumidity > 80
                ? t('weatherIntelligence.cropStressMessages.mustard.highHumidity')
                : t('weatherIntelligence.cropStressMessages.mustard.idealConditions')
        },
        potato: {
          stress: (avgTemp > 25 || avgTemp < 10 || avgHumidity > 85 || !seasonMatch('potato')) ? 'moderate' : 'low',
          message: avgTemp > 25
            ? t('weatherIntelligence.cropStressMessages.potato.highTemperatures')
            : avgTemp < 10
              ? t('weatherIntelligence.cropStressMessages.potato.coolConditions')
              : avgHumidity > 85
                ? t('weatherIntelligence.cropStressMessages.potato.highHumidity')
                : t('weatherIntelligence.cropStressMessages.potato.favorableConditions')
        },
        tomato: {
          stress: (avgTemp > 32 || avgTemp < 15 || rainChance > 60 || !seasonMatch('tomato')) ? 'moderate' : 'low',
          message: avgTemp > 32
            ? t('weatherIntelligence.cropStressMessages.tomato.highTemperatures')
            : avgTemp < 15
              ? t('weatherIntelligence.cropStressMessages.tomato.coolTemperatures')
              : rainChance > 60
                ? t('weatherIntelligence.cropStressMessages.tomato.rainExpected')
                : t('weatherIntelligence.cropStressMessages.tomato.goodConditions')
        },
        onion: {
          stress: (avgTemp > 30 || avgTemp < 10 || avgHumidity > 75 || !seasonMatch('onion')) ? 'moderate' : 'low',
          message: avgTemp > 30
            ? t('weatherIntelligence.cropStressMessages.onion.highTemperatures')
            : avgTemp < 10
              ? t('weatherIntelligence.cropStressMessages.onion.coolConditions')
              : avgHumidity > 75
                ? t('weatherIntelligence.cropStressMessages.onion.highHumidity')
                : t('weatherIntelligence.cropStressMessages.onion.idealConditions')
        },
        turmeric: {
          stress: (avgTemp < 20 || avgTemp > 35 || avgHumidity < 60 || !seasonMatch('turmeric')) ? 'moderate' : 'low',
          message: avgTemp < 20
            ? t('weatherIntelligence.cropStressMessages.turmeric.coolTemperatures')
            : avgTemp > 35
              ? t('weatherIntelligence.cropStressMessages.turmeric.highTemperatures')
              : avgHumidity < 60
                ? t('weatherIntelligence.cropStressMessages.turmeric.lowHumidity')
                : t('weatherIntelligence.cropStressMessages.turmeric.optimalConditions')
        },
        chilli: {
          stress: (avgTemp < 18 || avgTemp > 32 || rainChance > 70 || !seasonMatch('chilli')) ? 'moderate' : 'low',
          message: avgTemp < 18
            ? t('weatherIntelligence.cropStressMessages.chilli.coolTemperatures')
            : avgTemp > 32
              ? t('weatherIntelligence.cropStressMessages.chilli.highTemperatures')
              : rainChance > 70
                ? t('weatherIntelligence.cropStressMessages.chilli.heavyRain')
                : t('weatherIntelligence.cropStressMessages.chilli.favorableConditions')
        },
        chickpea: {
          stress: (avgTemp < 10 || avgTemp > 30 || avgHumidity > 70 || !seasonMatch('chickpea')) ? 'moderate' : 'low',
          message: avgTemp < 10
            ? t('weatherIntelligence.cropStressMessages.chickpea.coolConditions')
            : avgTemp > 30
              ? t('weatherIntelligence.cropStressMessages.chickpea.highTemperatures')
              : avgHumidity > 70
                ? t('weatherIntelligence.cropStressMessages.chickpea.highHumidity')
                : t('weatherIntelligence.cropStressMessages.chickpea.idealConditions')
        },
        pigeonPea: {
          stress: (avgTemp < 20 || avgTemp > 35 || avgHumidity < 50 || !seasonMatch('pigeonPea')) ? 'moderate' : 'low',
          message: avgTemp < 20
            ? t('weatherIntelligence.cropStressMessages.pigeonPea.coolTemperatures')
            : avgTemp > 35
              ? t('weatherIntelligence.cropStressMessages.pigeonPea.highTemperatures')
              : avgHumidity < 50
                ? t('weatherIntelligence.cropStressMessages.pigeonPea.lowHumidity')
                : t('weatherIntelligence.cropStressMessages.pigeonPea.goodConditions')
        },
        sunflower: {
          stress: (avgTemp < 15 || avgTemp > 30 || avgHumidity > 75 || !seasonMatch('sunflower')) ? 'moderate' : 'low',
          message: avgTemp < 15
            ? t('weatherIntelligence.cropStressMessages.sunflower.coolTemperatures')
            : avgTemp > 30
              ? t('weatherIntelligence.cropStressMessages.sunflower.highTemperatures')
              : avgHumidity > 75
                ? t('weatherIntelligence.cropStressMessages.sunflower.highHumidity')
                : t('weatherIntelligence.cropStressMessages.sunflower.favorableConditions')
        },
        bajra: {
          stress: (avgTemp < 20 || avgTemp > 38 || avgHumidity < 40 || !seasonMatch('bajra')) ? 'moderate' : 'low',
          message: avgTemp < 20
            ? t('weatherIntelligence.cropStressMessages.bajra.coolTemperatures')
            : avgTemp > 38
              ? t('weatherIntelligence.cropStressMessages.bajra.veryHighTemperatures')
              : avgHumidity < 40
                ? t('weatherIntelligence.cropStressMessages.bajra.lowHumidity')
                : t('weatherIntelligence.cropStressMessages.bajra.optimalConditions')
        },
        jowar: {
          stress: (avgTemp < 18 || avgTemp > 35 || avgHumidity < 45 || !seasonMatch('jowar')) ? 'moderate' : 'low',
          message: avgTemp < 18
            ? t('weatherIntelligence.cropStressMessages.jowar.coolTemperatures')
            : avgTemp > 35
              ? t('weatherIntelligence.cropStressMessages.jowar.highTemperatures')
              : avgHumidity < 45
                ? t('weatherIntelligence.cropStressMessages.jowar.lowHumidity')
                : t('weatherIntelligence.cropStressMessages.jowar.goodConditions')
        }
      }
    };

    setCropRecommendations(recommendations);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'optimal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'wait': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'delay': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStressColor = (stress) => {
    switch (stress) {
      case 'high': return 'text-red-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleBackClick = () => {
    // Check if user came from login page
    const fromLogin = routeLocation.state?.from === 'login';

    if (fromLogin || !user) {
      // Go back to login if came from login or not logged in
      navigate('/login');
    } else {
      // Go back to user portal if logged in and came from portal
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-brown-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-2 text-green-700 hover:text-green-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">{user ? t('weatherIntelligence.backToDashboard') : 'Back to Login'}</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <img src="/assets/images/logo.png" alt="Agro Rakshak" className="w-8 h-8 rounded-full" />
                <h1 className="text-2xl font-bold text-gray-800">{t('weatherIntelligence.title')}</h1>

              </div>
            </div>
            {user ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{user.name}</span>
              </div>
            ) : (
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {t('weatherIntelligence.guestView')}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <MapPin className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t('weatherIntelligence.searchLocation')}
                className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-700"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-40 bg-white border-2 border-green-200 w-full mt-2 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {suggestions.map((s, idx) => (
                    <li
                      key={idx}
                      onClick={() => selectLocation(s)}
                      className="p-3 hover:bg-green-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-500">
                        {[s.state, s.country].filter(Boolean).join(', ')}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={fetchWeatherAuto}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Search className="w-5 h-5" />
              <span>{t('common.search')}</span>
            </button>
            <button
              onClick={fetchWeatherAuto}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <MapPin className="w-5 h-5" />
              <span>{t('weather.useMyLocation')}</span>
            </button>
          </div>
          {locationName && (
            <div className="mt-4 flex items-center space-x-2 text-green-700">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{locationName}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('weather.loadingWeather')}</p>
          </div>
        ) : currentWeather ? (
          <>
            {/* Real-Time Weather Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('weatherIntelligence.currentWeather')}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-6">
                  {currentWeather.icon ? (
                    <img src={currentWeather.icon} alt="weather" className="w-24 h-24" />
                  ) : (
                    <Sun className="w-24 h-24 text-yellow-500" />
                  )}
                  <div>
                    <div className="text-5xl font-bold text-gray-800">{currentWeather.temp}°C</div>
                    <div className="text-xl text-gray-600 mt-1">{currentWeather.condition}</div>
                    <div className="text-sm text-gray-500 mt-1">{t('weather.feelsLike')} {currentWeather.feels_like}°C</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <Droplets className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('weather.humidity')}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">{currentWeather.humidity || '--'}%</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <Wind className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('weather.wind')}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{currentWeather.windSpeed || '--'} m/s</div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <CloudRain className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('weatherIntelligence.rainChance')}</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-700">{forecast[0]?.rainChance || '--'}%</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <Cloud className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('weatherIntelligence.currentWeather')}</span>
                    </div>
                    <div className="text-lg font-bold text-purple-700">{currentWeather.condition}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Forecast Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-green-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('weatherIntelligence.forecast')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                {forecast.map((day, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200 text-center">
                    <div className="font-semibold text-gray-700 mb-2">{formatDate(day.date)}</div>
                    {day.icon ? (
                      <img src={day.icon} alt="weather" className="w-16 h-16 mx-auto mb-2" />
                    ) : (
                      <Sun className="w-16 h-16 mx-auto mb-2 text-yellow-500" />
                    )}
                    <div className="text-sm text-gray-600 mb-2">{day.condition}</div>
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <ThermometerSun className="w-4 h-4 text-red-500" />
                      <span className="text-lg font-bold text-gray-800">{day.tempMax}°</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <ThermometerSun className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-600">{day.tempMin}°</span>
                    </div>
                    {day.rainChance > 0 && (
                      <div className="mt-2 text-xs text-blue-600">
                        <CloudRain className="w-3 h-3 inline mr-1" />
                        {day.rainChance}% {t('weatherIntelligence.rainChance')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Crop Impact & Recommendations Card */}
            {cropRecommendations && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Sprout className="w-6 h-6 text-green-600" />
                  <span>{t('weatherIntelligence.recommendations')}</span>
                </h2>

                {/* Key Recommendations */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className={'p-4 rounded-lg border-2 ' + getStatusColor(cropRecommendations.irrigation.status)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="w-5 h-5" />
                      <h3 className="font-semibold">{t('weatherIntelligence.irrigation')}</h3>
                    </div>
                    <p className="text-sm">{cropRecommendations.irrigation.message}</p>
                  </div>

                  <div className={'p-4 rounded-lg border-2 ' + getStatusColor(cropRecommendations.fertilizer.status)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <h3 className="font-semibold">{t('weatherIntelligence.fertilizer')}</h3>
                    </div>
                    <p className="text-sm">{cropRecommendations.fertilizer.message}</p>
                  </div>

                  <div className={'p-4 rounded-lg border-2 ' + getStatusColor(cropRecommendations.pestRisk.status)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <h3 className="font-semibold">{t('weatherIntelligence.pestRisk')}</h3>
                    </div>
                    <p className="text-sm">{cropRecommendations.pestRisk.message}</p>
                  </div>

                  <div className={'p-4 rounded-lg border-2 ' + getStatusColor(cropRecommendations.diseaseRisk.status)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <h3 className="font-semibold">{t('weatherIntelligence.diseaseRisk')}</h3>
                    </div>
                    <p className="text-sm">{cropRecommendations.diseaseRisk.message}</p>
                  </div>

                  <div className={'p-4 rounded-lg border-2 ' + getStatusColor(cropRecommendations.harvestTiming.status)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5" />
                      <h3 className="font-semibold">{t('weatherIntelligence.harvestTiming')}</h3>
                    </div>
                    <p className="text-sm">{cropRecommendations.harvestTiming.message}</p>
                  </div>
                </div>

                {/* Crop-Specific Stress Analysis */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('weatherIntelligence.cropStress')}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(cropRecommendations.cropStress).map(([crop, data]) => {
                      // Get translated crop name
                      const cropKey = crop.replace(/([A-Z])/g, ' $1').toLowerCase().trim().replace(/\s+/g, '');
                      const cropDisplayName = t('crops.' + cropKey) || crop;

                      return (
                        <div key={crop} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{cropDisplayName}</h4>
                            <span className={'text-sm font-medium ' + getStressColor(data.stress)}>
                              {t('weatherIntelligence.stressLevels.' + data.stress, data.stress.toUpperCase())}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{data.message}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-green-200">
            <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('weatherIntelligence.searchLocation')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

