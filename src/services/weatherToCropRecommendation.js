import axios from 'axios';

const DEFAULT_BASE = '';
const ENV_BASE = process.env.REACT_APP_API_BASE;
const API_BASE = ENV_BASE || DEFAULT_BASE;

const weatherToCropService = {
  generateCropRecommendations: async (weatherData, region, soilType = null) => {
    try {
      const response = await axios.post(`${API_BASE}/api/recommendations/crop-alerts`, {
        weather: weatherData,
        region,
        soilType
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate crop recommendations:', error);
      return {
        success: false,
        recommendations: [],
        error: error.message
      };
    }
  },

  getCropAlertHistory: async (userId, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE}/api/recommendations/crop-alerts/${userId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch crop alert history:', error);
      return {
        success: false,
        alerts: []
      };
    }
  },

  dismissCropAlert: async (alertId) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/recommendations/crop-alerts/${alertId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to dismiss crop alert:', error);
      return { success: false };
    }
  }
};

export default weatherToCropService;
