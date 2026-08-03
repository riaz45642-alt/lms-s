import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
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

export function errorMessage(error) {
  const errors = error.response?.data?.errors
  if (errors) return Object.values(errors).flat().join(' ')
  return error.response?.data?.message || 'The request could not be completed. Please try again.'
}

export default client
