import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import api, { clearToken, saveToken, storedToken } from '../services/api'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(Boolean(storedToken()))
  const [favorites, setFavorites] = useState(['Adding 2 Worksheet', 'Parts of a Plant'])
  const [recentlyViewed, setRecentlyViewed] = useState(['Letter Tracing A–Z', 'Continents & Oceans'])
  const [recentlyDownloaded, setRecentlyDownloaded] = useState(['Sight Words Practice'])

  const toggleFavorite = useCallback((title) => {
    setFavorites((f) => (f.includes(title) ? f.filter((t) => t !== title) : [title, ...f]))
  }, [])

  const addRecentlyViewed = useCallback((title) => {
    setRecentlyViewed((r) => [title, ...r.filter((t) => t !== title)].slice(0, 8))
  }, [])

  const addRecentlyDownloaded = useCallback((title) => {
    setRecentlyDownloaded((r) => [title, ...r.filter((t) => t !== title)].slice(0, 8))
  }, [])

  const refreshUser = useCallback(async () => {
    if (!storedToken()) { setAuthLoading(false); return null }
    try {
      const { data } = await api.get('/user')
      setUser(data)
      return data
    } catch {
      clearToken()
      setUser(null)
      return null
    } finally {
      setAuthLoading(false)
    }
  }, [])

  useEffect(() => { refreshUser() }, [refreshUser])

  const login = useCallback(async (credentials, remember = false) => {
    const { data } = await api.post('/auth/login', credentials)
    saveToken(data.token, remember)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    saveToken(data.token, false)
    setUser(data.user)
    return data
  }, [])

  // Trades an Auth0 access token for a Sanctum token. A first-time visitor comes
  // back with { needs_role: true } instead, because Auth0 cannot tell us whether
  // the person is a parent, teacher or student.
  const loginWithAuth0Token = useCallback(async (accessToken, extra = {}) => {
    const { data } = await api.post('/auth/auth0/exchange', { access_token: accessToken, ...extra })
    if (data.needs_role) return data
    saveToken(data.token, true)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout') } finally { clearToken(); setUser(null) }
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.patch('/profile', payload)
    setUser(data)
    return data
  }, [])

  const value = useMemo(() => ({
    user, authLoading, login, register, logout, refreshUser, updateProfile, api,
    loginWithAuth0Token,
    favorites, toggleFavorite,
    recentlyViewed, addRecentlyViewed,
    recentlyDownloaded, addRecentlyDownloaded,
  }), [user, authLoading, login, register, logout, refreshUser, updateProfile, loginWithAuth0Token, favorites, recentlyViewed, recentlyDownloaded, toggleFavorite, addRecentlyViewed, addRecentlyDownloaded])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
