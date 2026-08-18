import axios from 'axios';
import { isNativePlatform, getCurrentLocation } from './capacitorService';

// Open-Meteo requires no API key

const capitalize = (s) => (typeof s === 'string' && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const getWeatherInfo = (code) => {
  if (code === 0) return { condition: 'Clear', icon: '01d' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy', icon: '02d' };
  if (code === 3) return { condition: 'Cloudy', icon: '03d' };
  if ([45, 48].includes(code)) return { condition: 'Fog', icon: '50d' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Drizzle', icon: '09d' };
  if ([61, 63, 65, 66, 67].includes(code)) return { condition: 'Rain', icon: '10d' };
  if ([71, 73, 75, 77].includes(code)) return { condition: 'Snow', icon: '13d' };
  if ([80, 81, 82].includes(code)) return { condition: 'Rain Showers', icon: '09d' };
  if ([85, 86].includes(code)) return { condition: 'Snow Showers', icon: '13d' };
  if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorm', icon: '11d' };
  return { condition: 'Unknown', icon: '01d' };
};

const mapOwmToApp = (data, locationName = null) => {
  if (!data || !data.current) return null;
  const info = getWeatherInfo(data.current.weather_code);
  return {
    temp: Math.round(data.current.temperature_2m ?? 0),
    feels_like: Math.round(data.current.apparent_temperature ?? 0),
    condition: info.condition,
    humidity: data.current.relative_humidity_2m ?? null,
    windSpeed: data.current.wind_speed_10m ?? null,
    locationName: locationName || 'Current Location',
    icon: `https://openweathermap.org/img/wn/${info.icon}@2x.png`,
    raw: data
  };
};

const weatherService = {
  getCurrentWeather: async (lat, lon, name = null) => {
    try {
      if (lat == null || lon == null) throw new Error('lat/lon required');
      const res = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
          timezone: 'auto'
        }
      });
      return mapOwmToApp(res.data, name);
    } catch (err) {
      console.error('Open-Meteo getCurrentWeather error:', err);
      return { temp: 28, condition: 'Partly Cloudy', humidity: 65, windSpeed: 12 };
    }
  },

  searchLocation: async (query, limit = 5) => {
    try {
      if (!query || !query.trim()) return [];
      const res = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: query, count: limit }
      });
      if (!res.data.results) return [];
      return res.data.results.map((item) => ({
        name: item.name,
        lat: item.latitude,
        lon: item.longitude,
        country: item.country,
        state: item.admin1
      }));
    } catch (err) {
      console.error('Open-Meteo searchLocation error:', err);
      return [];
    }
  },

  getCurrentWeatherAuto: async (options = { timeout: 10000 }) => {
    const defaultCoords = { lat: 28.7041, lon: 77.1025 }; // New Delhi
    try {
      if (isNativePlatform()) {
        const location = await getCurrentLocation({ highAccuracy: true, timeout: options.timeout });
        if (location.success) {
          return weatherService.getCurrentWeather(location.latitude, location.longitude);
        } else {
          return weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon, 'New Delhi');
        }
      }
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon, 'New Delhi');
      }
      return new Promise((resolve) => {
        let settled = false;
        const success = async (pos) => {
          if (settled) return;
          settled = true;
          const { latitude: lat, longitude: lon } = pos.coords;
          const data = await weatherService.getCurrentWeather(lat, lon);
          resolve(data);
        };
        const failure = async () => {
          if (settled) return;
          settled = true;
          const data = await weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon, 'New Delhi');
          resolve(data);
        };
        navigator.geolocation.getCurrentPosition(success, failure, {
          enableHighAccuracy: true, timeout: options.timeout, maximumAge: 0
        });
        setTimeout(async () => {
          if (settled) return;
          settled = true;
          const data = await weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon, 'New Delhi');
          resolve(data);
        }, options.timeout + 500);
      });
    } catch (error) {
      return weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon, 'New Delhi');
    }
  },

  getForecast: async (lat, lon, cnt = 7) => {
    try {
      if (lat == null || lon == null) throw new Error('lat/lon required');
      const res = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
          timezone: 'auto'
        }
      });
      if (res.data && res.data.daily) {
        const daily = res.data.daily;
        const forecastArray = [];
        for (let i = 0; i < Math.min(cnt, daily.time.length); i++) {
          const info = getWeatherInfo(daily.weather_code[i]);
          forecastArray.push({
            date: new Date(daily.time[i]),
            tempMin: Math.round(daily.temperature_2m_min[i]),
            tempMax: Math.round(daily.temperature_2m_max[i]),
            condition: info.condition,
            icon: `https://openweathermap.org/img/wn/${info.icon}@2x.png`,
            humidity: 65,
            windSpeed: Math.round(daily.wind_speed_10m_max[i]),
            rainChance: daily.precipitation_probability_max[i],
            rainfall: daily.precipitation_sum[i]
          });
        }
        return forecastArray;
      }
    } catch (err) {
      console.error('Open-Meteo getForecast error:', err);
      const today = new Date();
      return Array.from({ length: cnt }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return {
          date,
          tempMin: 22, tempMax: 28,
          condition: 'Partly Cloudy',
          icon: null,
          humidity: 60, windSpeed: 10, rainChance: 0, rainfall: 0
        };
      });
    }
  }
};

export default weatherService;
