import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
})

// Add auth token to requests (fallback for when cookies aren't available)
api.interceptors.request.use((config) => {
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`
  console.log('🌐 [API] Making request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullUrl,
    params: config.params
  })
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('CystaNiva_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      fullUrl: `${response.config.baseURL || ''}${response.config.url || ''}`,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
      isHtml: typeof response.data === 'string' && response.data.includes('<!DOCTYPE html'),
      dataSample: typeof response.data === 'string' ? response.data.substring(0, 200) : response.data
    })
    return response
  },
  (error) => {
    console.error('❌ [API] Request failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      isHtml: typeof error.response?.data === 'string' && error.response?.data.includes('<!DOCTYPE html')
    })
    
    if (error.response?.status === 401) {
      // Clear token and redirect to auth
      if (typeof window !== 'undefined') {
        localStorage.removeItem('CystaNiva_token')
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

export default api
