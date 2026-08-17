import axios from 'axios';
import { isNativePlatform, getCurrentLocation } from './capacitorService';

// OpenWeatherMap API key: read from env var `REACT_APP_OWM_KEY`
// Must be set in .env file: REACT_APP_OWM_KEY=your_api_key_here
const OWM_API_KEY = process.env.REACT_APP_OWM_KEY;
const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

if (!OWM_API_KEY) {
  console.error('⚠️  Warning: REACT_APP_OWM_KEY is not set in .env file. Weather features will not work.');
}

const capitalize = (s) => (typeof s === 'string' && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const mapOwmToApp = (data) => {
  if (!data) return null;
  return {
    temp: Math.round(data.main?.temp ?? 0),
    feels_like: Math.round(data.main?.feels_like ?? 0),
    condition: data.weather && data.weather[0] ? capitalize(data.weather[0].description) : 'Unknown',
    humidity: data.main?.humidity ?? null,
    windSpeed: data.wind?.speed ?? null,
    pressure: data.main?.pressure ?? null,
    visibility: data.visibility ?? null,
    sunrise: data.sys?.sunrise ?? null,
    sunset: data.sys?.sunset ?? null,
    locationName: data.name ? `${data.name}${data.sys?.country ? ', ' + data.sys.country : ''}` : null,
    icon: data.weather && data.weather[0] ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : null,
    raw: data
  };
};

const weatherService = {
  // Get current weather by lat/lon using OpenWeatherMap
  getCurrentWeather: async (lat, lon) => {
    try {
      if (!OWM_API_KEY) {
        throw new Error('REACT_APP_OWM_KEY is not set in .env file');
      }
      
      if (lat == null || lon == null) {
        throw new Error('lat/lon required');
      }

      const res = await axios.get(`${OWM_BASE}/weather`, {
        params: {
          lat,
          lon,
          appid: OWM_API_KEY,
          units: 'metric'
        }
      });

      return mapOwmToApp(res.data);
    } catch (err) {
      console.error('OpenWeather getCurrentWeather error:', err);
      // return fallback demo data
      return {
        temp: 28,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12
      };
    }
  },

  // Search for locations using OpenWeather Geocoding API (direct geocoding)
  // returns array of { name, lat, lon, country, state }
  searchLocation: async (query, limit = 5) => {
    try {
      if (!OWM_API_KEY) {
        console.error('REACT_APP_OWM_KEY is not set in .env file');
        return [];
      }
      
      if (!query || !query.trim()) return [];
      const res = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
        params: {
          q: query,
          limit,
          appid: OWM_API_KEY
        }
      });

      if (!Array.isArray(res.data)) return [];

      return res.data.map((item) => ({
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country,
        state: item.state
      }));
    } catch (err) {
      console.error('OpenWeather searchLocation error:', err);
      return [];
    }
  },

  // Try browser/native geolocation; fall back to a default location (New Delhi)
  getCurrentWeatherAuto: async (options = { timeout: 10000 }) => {
    const defaultCoords = { lat: 28.7041, lon: 77.1025 }; // New Delhi

    try {
      // Use Capacitor geolocation if on native platform
      if (isNativePlatform()) {
        console.log('Using Capacitor Geolocation...');
        const location = await getCurrentLocation({ 
          highAccuracy: true, 
          timeout: options.timeout 
        });
        
        if (location.success) {
          const data = await weatherService.getCurrentWeather(location.latitude, location.longitude);
          return data;
        } else {
          console.warn('Capacitor geolocation failed, using fallback');
          return weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon);
        }
      }

      // Web platform - use browser geolocation
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon);
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
          const data = await weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon);
          resolve(data);
        };

        navigator.geolocation.getCurrentPosition(success, failure, {
          enableHighAccuracy: true,
          timeout: options.timeout,
          maximumAge: 0
        });

        // Safety timeout: if geolocation hangs, fallback
        setTimeout(async () => {
          if (settled) return;
          settled = true;
          const data = await weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon);
          resolve(data);
        }, options.timeout + 500);
      });
    } catch (error) {
      console.error('Geolocation error:', error);
      return weatherService.getCurrentWeather(defaultCoords.lat, defaultCoords.lon);
    }
  },

  // Get 7-day forecast using OpenWeather daily forecast endpoint
  // API endpoint: api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt={cnt}&appid={API key}
  getForecast: async (lat, lon, cnt = 7) => {
    try {
      if (!OWM_API_KEY) {
        throw new Error('REACT_APP_OWM_KEY is not set in .env file');
      }
      
      if (lat == null || lon == null) {
        throw new Error('lat/lon required');
      }

      // Try daily forecast endpoint first (as specified)
      try {
        const res = await axios.get(`${OWM_BASE}/forecast/daily`, {
          params: {
            lat,
            lon,
            cnt: cnt, // Number of days (up to 16 for free tier)
            appid: OWM_API_KEY,
            units: 'metric'
          }
        });

        if (res.data && res.data.list) {
          // Map daily forecast data to our format
          const forecastArray = res.data.list.map((day) => {
            const date = new Date(day.dt * 1000);
            return {
              date: date,
              tempMin: Math.round(day.temp?.min ?? day.temp?.day ?? 0),
              tempMax: Math.round(day.temp?.max ?? day.temp?.day ?? 0),
              condition: capitalize(day.weather && day.weather[0] ? day.weather[0].description : 'Clear'),
              icon: day.weather && day.weather[0] 
                ? `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`
                : null,
              humidity: day.humidity ?? null,
              windSpeed: day.speed ? Math.round(day.speed * 10) / 10 : null,
              rainChance: day.pop ? Math.round(day.pop * 100) : 0,
              rainfall: day.rain ?? 0
            };
          });

          return forecastArray;
        }
      } catch (dailyErr) {
        console.warn('Daily forecast endpoint failed, trying standard forecast endpoint:', dailyErr.message);
        // Fallback to standard forecast endpoint if daily endpoint fails
      }

      // Fallback: Use standard forecast endpoint (5-day, 3-hour intervals)
      const res = await axios.get(`${OWM_BASE}/forecast`, {
        params: {
          lat,
          lon,
          appid: OWM_API_KEY,
          units: 'metric'
        }
      });

      if (!res.data || !res.data.list) {
        throw new Error('Invalid forecast data');
      }

      // Group by day and get daily min/max
      const dailyForecasts = {};
      res.data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!dailyForecasts[dayKey]) {
          dailyForecasts[dayKey] = {
            date: date,
            temps: [],
            conditions: [],
            icons: [],
            humidity: [],
            windSpeed: [],
            rain: item.rain?.['3h'] || 0,
            pop: item.pop || 0
          };
        }
        
        dailyForecasts[dayKey].temps.push(item.main.temp);
        dailyForecasts[dayKey].conditions.push(item.weather[0]?.description || '');
        dailyForecasts[dayKey].icons.push(item.weather[0]?.icon || '');
        dailyForecasts[dayKey].humidity.push(item.main.humidity);
        dailyForecasts[dayKey].windSpeed.push(item.wind.speed);
        dailyForecasts[dayKey].rain = Math.max(dailyForecasts[dayKey].rain, item.rain?.['3h'] || 0);
        dailyForecasts[dayKey].pop = Math.max(dailyForecasts[dayKey].pop, item.pop || 0);
      });

      // Convert to array and format
      const forecastArray = Object.values(dailyForecasts)
        .slice(0, cnt) // Get requested number of days
        .map((day) => ({
          date: day.date,
          tempMin: Math.round(Math.min(...day.temps)),
          tempMax: Math.round(Math.max(...day.temps)),
          condition: capitalize(day.conditions[Math.floor(day.conditions.length / 2)] || 'Clear'),
          icon: day.icons[Math.floor(day.icons.length / 2)] 
            ? `https://openweathermap.org/img/wn/${day.icons[Math.floor(day.icons.length / 2)]}@2x.png`
            : null,
          humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
          windSpeed: Math.round((day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length) * 10) / 10,
          rainChance: Math.round(day.pop * 100),
          rainfall: day.rain
        }));

      return forecastArray;
    } catch (err) {
      console.error('OpenWeather getForecast error:', err);
      // Return fallback demo data
      const today = new Date();
      return Array.from({ length: cnt }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return {
          date,
          tempMin: 22 + Math.floor(Math.random() * 5),
          tempMax: 28 + Math.floor(Math.random() * 5),
          condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
          icon: null,
          humidity: 60 + Math.floor(Math.random() * 20),
          windSpeed: 10 + Math.floor(Math.random() * 5),
          rainChance: Math.floor(Math.random() * 40),
          rainfall: 0
        };
      });
    }
  }
};

export default weatherService;
