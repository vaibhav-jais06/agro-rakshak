import axios from 'axios';

// API Base URL configuration
const ENV_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE;
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.match(/^[0-9.]+$/));
const API_BASE_URL = ENV_BASE ? ENV_BASE : (isLocal ? `http://${window.location.hostname}:5000` : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const isShop = typeof config.url === 'string' && (config.url.startsWith('/api/marketplace') || config.url.startsWith('/api/upload/products'));
    const token = isShop ? localStorage.getItem('agri_shop_token') : localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const apiService = {
  api: api,

  // User authentication
  register: async (userData) => {
    try {
      const response = await apiService.api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
      throw new Error(msg || 'Registration failed');
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiService.api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
      throw new Error(msg || 'Login failed');
    }
  },

  // Crop diagnosis
  diagnoseCrop: async (imageData, analysisType) => {
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      if (analysisType) formData.append('analysisType', analysisType);
      const response = await apiService.api.post('/api/diagnosis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      try {
        const mod = await import('./cropAnalysisService');
        const result = await mod.analyzeAgricultureImage(imageData, analysisType || 'plant');
        return {
          success: true,
          analysis: result.analysis,
          metadata: result.metadata
        };
      } catch (fallbackErr) {
        const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
        throw new Error(msg || fallbackErr.message || 'Diagnosis failed');
      }
    }
  },

  // Get recommendations
  getRecommendations: async (farmData) => {
    try {
      const response = await apiService.api.post('/api/recommendations', farmData);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
      throw new Error(msg || 'Failed to load recommendations');
    }
  },

  // Marketplace
  getProducts: async (category) => {
    try {
      const response = await apiService.api.get(`/api/marketplace/products?category=${category}`);
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
      throw new Error(msg || 'Failed to load products');
    }
  }
};

// Notifications
apiService.getNotification = async () => {
  try {
    const res = await apiService.api.get('/api/notifications');
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Failed to load notification');
  }
};

apiService.updateNotification = async (payload) => {
  try {
    const res = await apiService.api.put('/api/notifications', payload);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Update failed');
  }
};

apiService.updateNotificationById = async (id, payload) => {
  try {
    const res = await apiService.api.put(`/api/notifications/${id}`, payload);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Update failed');
  }
};

apiService.getNotifications = async () => {
  try {
    const res = await apiService.api.get('/api/notifications/list');
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Failed to load notifications');
  }
};

apiService.createNotification = async (payload) => {
  try {
    const res = await apiService.api.post('/api/notifications', payload);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Create failed');
  }
};

apiService.deleteNotification = async (id) => {
  try {
    const res = await apiService.api.delete(`/api/notifications/${id}`);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Delete failed');
  }
};

apiService.subscribeNotificationUpdates = (onMessage) => {
  const base = API_BASE_URL;
  const es = new EventSource(`${base}/api/notifications/stream`);
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage && onMessage(data);
    } catch (_) {}
  };
  es.onerror = () => {};
  return es;
};

// Research & References
apiService.getResearch = async () => {
  try {
    const res = await apiService.api.get('/api/research');
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Failed to load research');
  }
};

apiService.getResearchById = async (id) => {
  try {
    const res = await apiService.api.get(`/api/research/${id}`);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Failed to load entry');
  }
};

apiService.createResearch = async (payload) => {
  try {
    const res = await apiService.api.post('/api/research', payload);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Create failed');
  }
};

apiService.updateResearch = async (id, payload) => {
  try {
    const res = await apiService.api.put(`/api/research/${id}`, payload);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Update failed');
  }
};

apiService.deleteResearch = async (id) => {
  try {
    const res = await apiService.api.delete(`/api/research/${id}`);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Delete failed');
  }
};

apiService.uploadResearchImages = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await apiService.api.post('/api/upload/research', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Upload failed');
  }
};

apiService.deleteResearchUpload = async (filename) => {
  try {
    const res = await apiService.api.delete(`/api/upload/research/${filename}`);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : error.message);
    throw new Error(msg || 'Delete failed');
  }
};

apiService.subscribeResearchUpdates = (onMessage) => {
  const base = API_BASE_URL;
  const es = new EventSource(`${base}/api/research/stream`);
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage && onMessage(data);
    } catch (_) {}
  };
  es.onerror = () => {};
  return es;
};

export default apiService;
