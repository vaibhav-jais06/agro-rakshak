import axios from 'axios'

const AGMARKNET_API_KEY = process.env.AGRO_API_KEY || process.env.REACT_APP_AGMARKNET_API_KEY
const AGMARKNET_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070'

export const getCommodityPrices = async (commodity = '', state = '', market = '') => {
  try {
    const params = {
      'api-key': AGMARKNET_API_KEY,
      format: 'json',
      limit: 100,
    }

    if (commodity) params['filters[commodity]'] = commodity
    if (state) params['filters[state]'] = state
    if (market) params['filters[market]'] = market

    const response = await axios.get(AGMARKNET_BASE_URL, { params })
    return response.data
  } catch (error) {
    return {
      records: [
        {
          commodity: 'Wheat',
          state: 'Punjab',
          market: 'Amritsar',
          min_price: 2100,
          max_price: 2400,
          modal_price: 2250,
          date: new Date().toISOString().split('T')[0]
        },
        {
          commodity: 'Rice',
          state: 'Haryana',
          market: 'Karnal',
          min_price: 1800,
          max_price: 2200,
          modal_price: 2000,
          date: new Date().toISOString().split('T')[0]
        },
        {
          commodity: 'Cotton',
          state: 'Gujarat',
          market: 'Ahmedabad',
          min_price: 6500,
          max_price: 7200,
          modal_price: 6800,
          date: new Date().toISOString().split('T')[0]
        }
      ]
    }
  }
}

export const getWeatherData = async (lat = 28.6139, lon = 77.2090) => {
  try {
    const API_KEY = process.env.REACT_APP_WEATHER_API_KEY
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    )
    return response.data
  } catch (error) {
    return {
      list: [
        {
          dt: Date.now() / 1000,
          main: { temp: 28, humidity: 65 },
          weather: [{ main: 'Clear', description: 'clear sky' }],
          wind: { speed: 3.5 }
        }
      ],
      city: { name: 'Delhi', country: 'IN' }
    }
  }
}

export const initiatePayment = async (amount, orderId, userInfo) => {
  try {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'Agro Rakshak',
      description: `Order #${orderId}`,
      order_id: orderId,
      handler: function (response) {},
      prefill: {
        name: userInfo.name,
        email: userInfo.email,
        contact: userInfo.phone
      },
      theme: { color: '#0B7A00' }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  } catch (error) {
    throw error
  }
}
