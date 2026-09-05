import axios from 'axios'

const client = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, ''),
  headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
  timeout: 15000,
})

export function storedToken() {
  return sessionStorage.getItem('lms_token') || localStorage.getItem('lms_token')
}

export function saveToken(token, remember = false) {
  clearToken()
  ;(remember ? localStorage : sessionStorage).setItem('lms_token', token)
}

export function clearToken() {
  sessionStorage.removeItem('lms_token')
  localStorage.removeItem('lms_token')
}

client.interceptors.request.use((config) => {
  const token = storedToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && storedToken()) {
      clearToken()
      window.dispatchEvent(new CustomEvent('lms:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error) {
  const errors = error.response?.data?.errors
  if (errors) return Object.values(errors).flat().join(' ')
  if (!error.response) return 'Unable to reach the LMS. Check your connection and try again.'
  const statusMessages = {
    401: 'Your session has expired. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested information could not be found.',
    500: 'The LMS encountered a problem. Please try again shortly.',
  }
  return error.response?.data?.message || statusMessages[error.response.status] || 'The request could not be completed. Please try again.'
}

export default client
