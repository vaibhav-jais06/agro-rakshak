const axios = require('axios');
const Weather = require('../models/Weather');

exports.getCurrentWeather = async (req, res) => {
  try {
    const { locationKey = '202396' } = req.query; // Default to Delhi
    
    const response = await axios.get(
      `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}`,
      {
        params: {
          apikey: process.env.ACCUWEATHER_API_KEY,
          details: true
        }
      }
    );

    const data = response.data[0];
    
    // Save to database
    const weather = new Weather({
      location: locationKey,
      temperature: {
        current: data.Temperature.Metric.Value,
        min: data.TemperatureSummary?.Past24HourRange?.Minimum?.Metric?.Value,
        max: data.TemperatureSummary?.Past24HourRange?.Maximum?.Metric?.Value
      },
      humidity: data.RelativeHumidity,
      windSpeed: data.Wind.Speed.Metric.Value,
      condition: data.WeatherText
    });

    await weather.save();

    res.json({
      success: true,
      data: {
        temp: data.Temperature.Metric.Value,
        condition: data.WeatherText,
        humidity: data.RelativeHumidity,
        windSpeed: data.Wind.Speed.Metric.Value,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to fetch weather data' 
    });
  }
};

exports.getForecast = async (req, res) => {
  try {
    const { locationKey = '202396' } = req.query;
    
    const response = await axios.get(
      `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}`,
      {
        params: {
          apikey: process.env.ACCUWEATHER_API_KEY,
          metric: true,
          details: true
        }
      }
    );

    const forecast = response.data.DailyForecasts.map(day => ({
      date: day.Date,
      tempMin: day.Temperature.Minimum.Value,
      tempMax: day.Temperature.Maximum.Value,
      condition: day.Day.IconPhrase,
      rainfall: day.Day.RainProbability
    }));

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Forecast API error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to fetch forecast data' 
    });
  }
};

exports.searchLocation = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const response = await axios.get(
      'https://dataservice.accuweather.com/locations/v1/cities/search',
      {
        params: {
          apikey: process.env.ACCUWEATHER_API_KEY,
          q: query,
          language: 'en-us'
        }
      }
    );

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Location search error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to search location' 
    });
  }
};