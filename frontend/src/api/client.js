import axios from 'axios'

const API_KEY = import.meta.env.VITE_API_KEY || 'dev-secret-key-change-in-production'
const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
  timeout: 120000,
})

client.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.detail || err.message || 'Unknown error'
    return Promise.reject(new Error(msg))
  }
)

export const sendChat = (message, history = [], filters = {}) =>
  client.post('/api/chat', { message, history, filters }).then(r => r.data)

export const getTopTitles = (params = {}) =>
  client.get('/api/analytics/top-titles', { params }).then(r => r.data)

export const getGenreTrends = () =>
  client.get('/api/analytics/genre-trends').then(r => r.data)

export const getRegionalPerformance = (params = {}) =>
  client.get('/api/analytics/regional', { params }).then(r => r.data)

export const getTrending = (days = 90) =>
  client.get('/api/analytics/trending', { params: { days } }).then(r => r.data)

export const getMarketingRoi = () =>
  client.get('/api/analytics/marketing-roi').then(r => r.data)

export const getPlatformStats = () =>
  client.get('/api/analytics/platform-stats').then(r => r.data)

export const healthCheck = () =>
  client.get('/health').then(r => r.data)
