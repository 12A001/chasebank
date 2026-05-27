// src/services/api.js

import axios from 'axios'

const api = axios.create({
  baseURL:
  import.meta.env.VITE_API_URL ||
  'https://chasebank-backend.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')


  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 🔄 Response interceptor (handle global errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API ERROR:', error.response?.data || error.message) // DEBUG

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
