import apiService from './apiService'

const farmerService = {
  getDashboardStats: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/dashboard/stats', { params })
    return res.data || res
  },
  getAnalytics: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/dashboard/analytics', { params })
    return res.data || res
  },
  getProfile: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/profile', { params })
    return res.data || res
  },
  updateProfile: async (payload) => {
    const res = await apiService.api.put('/api/farmer/profile', payload)
    return res.data || res
  },
  uploadAvatar: async (file, params = {}) => {
    const form = new FormData()
    form.append('avatar', file)
    const res = await apiService.api.post('/api/farmer/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params
    })
    return res.data || res
  },
  listLands: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/lands', { params })
    return res.data || res
  },
  createLand: async (payload, params = {}) => {
    const res = await apiService.api.post('/api/farmer/lands', payload, { params })
    return res.data || res
  },
  updateLand: async (id, payload, params = {}) => {
    const res = await apiService.api.put(`/api/farmer/lands/${id}`, payload, { params })
    return res.data || res
  },
  deleteLand: async (id, params = {}) => {
    const res = await apiService.api.delete(`/api/farmer/lands/${id}`, { params })
    return res.data || res
  },
  listCrops: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/crops', { params })
    return res.data || res
  },
  getCrop: async (id, params = {}) => {
    const res = await apiService.api.get(`/api/farmer/crops/${id}`, { params })
    return res.data || res
  },
  createCrop: async (payload, params = {}) => {
    const res = await apiService.api.post('/api/farmer/crops', payload, { params })
    return res.data || res
  },
  updateCrop: async (id, payload, params = {}) => {
    const res = await apiService.api.put(`/api/farmer/crops/${id}`, payload, { params })
    return res.data || res
  },
  deleteCrop: async (id, params = {}) => {
    const res = await apiService.api.delete(`/api/farmer/crops/${id}`, { params })
    return res.data || res
  },
  listActivities: async (cropId, params = {}) => {
    const res = await apiService.api.get(`/api/farmer/crops/${cropId}/activities`, { params })
    return res.data || res
  },
  addActivity: async (cropId, payload, params = {}) => {
    const res = await apiService.api.post(`/api/farmer/crops/${cropId}/activities`, payload, { params })
    return res.data || res
  },
  listTransactions: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/finances/transactions', { params })
    return res.data || res
  },
  addTransaction: async (payload, params = {}) => {
    const res = await apiService.api.post('/api/farmer/finances/transactions', payload, { params })
    return res.data || res
  },
  listLoans: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/finances/loans', { params })
    return res.data || res
  },
  addLoan: async (payload, params = {}) => {
    const res = await apiService.api.post('/api/farmer/finances/loans', payload, { params })
    return res.data || res
  },
  payLoan: async (loanId, payload, params = {}) => {
    const res = await apiService.api.put(`/api/farmer/finances/loans/${loanId}/pay`, payload, { params })
    return res.data || res
  },
  getFinancialSummary: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/finances/summary', { params })
    return res.data || res
  },
  listSchemes: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/schemes', { params })
    return res.data || res
  },
  applyScheme: async (payload, params = {}) => {
    const res = await apiService.api.post('/api/farmer/schemes/applications', payload, { params })
    return res.data || res
  },
  listApplications: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/schemes/applications', { params })
    return res.data || res
  },
  listAdvisories: async () => {
    const res = await apiService.api.get('/api/farmer/advisories')
    return res.data || res
  },
  markAdvisoryRead: async (id) => {
    const res = await apiService.api.put(`/api/farmer/advisories/${id}/read`)
    return res.data || res
  },
  getUnreadCount: async () => {
    const res = await apiService.api.get('/api/farmer/advisories/unread-count')
    return res.data || res
  },
  listConsultations: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/consultations', { params })
    return res.data || res
  },
  createConsultation: async (payload, params = {}) => {
    const res = await apiService.api.post('/api/farmer/consultations', payload, { params })
    return res.data || res
  },
  getMarketPrices: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/market/prices', { params })
    return res.data || res
  },
  getMarketTrends: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/market/trends', { params })
    return res.data || res
  },
  getWeather: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/weather/current', { params })
    return res.data || res
  },
  getForecast: async (params = {}) => {
    const res = await apiService.api.get('/api/farmer/weather/forecast', { params })
    return res.data || res
  }
}

export default farmerService
