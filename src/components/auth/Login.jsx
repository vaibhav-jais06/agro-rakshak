import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Lock, Cloud, Droplets, Wind, ArrowRight, MapPin, Search, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import apiService from '../../services/apiService';
import weatherService from '../../services/weatherService';

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [weatherRefreshing, setWeatherRefreshing] = useState(false);

  useEffect(() => {
    fetchWeatherData();
    // Refresh weather every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const detectAndSetLanguage = async () => {
      try {
        const geoData = await weatherService.getCurrentWeatherAuto();
        if (geoData && geoData.raw && geoData.raw.coord) {
          const { lat, lon } = geoData.raw.coord;
          const locationDetails = await weatherService.searchLocation(`${lat},${lon}`, 1);
          if (locationDetails && locationDetails.length > 0) {
            const countryCode = locationDetails[0].country;
            if (countryCode === 'IN') {
              i18n.changeLanguage('hi');
            } else if (countryCode === 'BD') {
              i18n.changeLanguage('bn');
            } else if (countryCode === 'LK') {
              i18n.changeLanguage('ta');
            } else {
              i18n.changeLanguage('en');
            }
          }
        }
      } catch (error) {
        console.error('Error detecting and setting language:', error);
        // Fallback to English if detection fails
        i18n.changeLanguage('en');
      }
    };

    // Only detect language if it's not already set by user or stored
    if (!localStorage.getItem('i18nextLng')) {
      detectAndSetLanguage();
    }
  }, []);

  const fetchWeatherData = async () => {
    try {
      setWeatherRefreshing(true);
      const data = await weatherService.getCurrentWeatherAuto();
      setWeather(data);
      setLocationName(data?.locationName || t('weather.unknownLocation'));
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      setWeatherRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.login({ username, password });

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.user);
      } else {
        setError(response.message || t('errors.loginFailed'));
      }
    } catch (err) {
      setError(err.message || t('errors.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleWeatherClick = () => {
    navigate('/weather-intelligence', { state: { from: 'login' } });
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    setLocationLoading(true);
    try {
      const results = await weatherService.searchLocation(manualLocation.trim());
      if (results && results.length) {
        const s = results[0];
        const name = s.name + (s.state ? ', ' + s.state : '') + (s.country ? ', ' + s.country : '');
        setLocationName(name);
        const w = await weatherService.getCurrentWeather(s.lat, s.lon);
        setWeather(w);
      }
    } catch (err) {
      console.error('Manual location error:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    try {
      const data = await weatherService.getCurrentWeatherAuto();
      setWeather(data);
      setLocationName(data?.locationName || t('weather.unknownLocation'));
    } catch (err) {
      console.error('Auto location error:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  const getWindDirection = (degrees) => {
    if (!degrees) return 'N';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const calculateRainChance = () => {
    if (!weather) return 0;
    // Simple estimation based on humidity and condition
    const humidity = weather.humidity || 0;
    const condition = weather.condition?.toLowerCase() || '';

    if (condition.includes('rain')) return 85;
    if (condition.includes('cloud')) return Math.min(humidity, 70);
    return Math.min(humidity / 2, 30);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/images/logo.png" alt={t('common.appName')} className="w-10 h-10 rounded-full" />
          <h1 className="text-2xl font-bold text-green-800">{t('common.appName')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-600" />
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            value={i18n.language}
            className="bg-white border border-green-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="en">{t('common.language.english')}</option>
            <option value="hi">{t('common.language.hindi')}</option>
            <option value="bn">{t('common.language.bengali')}</option>
            <option value="te">{t('common.language.telugu')}</option>
            <option value="ta">{t('common.language.tamil')}</option>
          </select>
        </div>
      </div>

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-green-800 mb-3">{t('auth.welcomeBack')}</h2>
            <p className="text-gray-700 text-lg">{t('auth.signIn')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.username')}
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.enterUsername') || 'Enter username'}
                  className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.enterPassword') || '••••••••'}
                  className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg bg-red-50 border-2 border-red-200 p-4"
                >
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </motion.div>
              )}
            </AnimatePresence>

            

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                t('auth.loggingIn') || 'Logging in...'
              ) : (
                <>
                  {t('auth.login')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="text-green-700 hover:text-green-800 font-medium">
                  {t('auth.registerHere')}
                </Link>
              </p>
              <button
                type="button"
                onClick={handleWeatherClick}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                {t('login.publicGuestViewActive')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Weather Preview */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-8 py-24">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-green-800 mb-2">{t('login.weatherPreviewTitle')}</h3>
              <p className="text-gray-700">{t('login.livePublicOverview')}</p>
            </div>
            {weatherRefreshing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-700">{t('weather.refreshing')}</span>
              </div>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/70 backdrop-blur-md border-2 border-green-200 rounded-2xl p-6 mb-6"
          >
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">{t('weather.location')}</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder={t('weather.searchCityOrVillage')}
                    className="w-full pl-9 pr-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 text-gray-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleManualLocationSubmit}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {locationLoading ? t('weather.setting') : t('weather.set')}
                </button>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locationLoading}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {t('weather.useMyLocation')}
                </button>
              </div>
              {locationName && (
                <div className="text-sm text-green-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{locationName}</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-6">
                {weather?.icon ? (
                  <img src={weather.icon} alt="weather" className="w-24 h-24" />
                ) : (
                  <Cloud className="w-24 h-24 text-green-500" />
                )}
                <div>
                  <div className="text-5xl font-bold text-gray-800">{weather?.temp || 24}°C</div>
                  <div className="text-lg text-gray-700 mt-1">{weather?.condition || 'Clear'}</div>
                  <div className="text-sm text-gray-600 mt-1">{t('weather.feelsLike')} {weather?.feels_like || 20}°C</div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">⚡</span>
                  <div className="text-sm text-gray-700">{t('login.aiForecast')}</div>
                </div>
                <div className="text-lg text-gray-800 font-semibold mb-2">
                  {t('login.forecastSentence', { percent: calculateRainChance() })}
                </div>
                <div className="text-xs text-green-700 font-medium mt-2">{t('login.confidenceScoreHigh')}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-green-100">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('weather.humidity')}</div>
                  <div className="text-xl font-semibold text-gray-800">{weather?.humidity || 45}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('weather.wind')}</div>
                  <div className="text-xl font-semibold text-gray-800">{weather?.windSpeed || 12} m/s</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t('weather.direction')}</div>
                  <div className="text-xl font-semibold text-gray-800">{getWindDirection(weather?.raw?.wind?.deg)}</div>
                </div>
              </div>
          </motion.div>

            <div className="text-center">
              <p className="text-sm text-green-700 mb-2">{locationName}</p>
              <button
                type="button"
                onClick={handleWeatherClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-text-primary border border-green-200 rounded-full hover:bg-green-50 transition-colors text-sm"
              >
                {t('login.openWeatherGuestMode')}
              </button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
