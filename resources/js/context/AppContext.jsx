import { createContext, useContext, useMemo, useState, useCallback } from 'react'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
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

  const value = useMemo(() => ({
    favorites, toggleFavorite,
    recentlyViewed, addRecentlyViewed,
    recentlyDownloaded, addRecentlyDownloaded,
  }), [favorites, recentlyViewed, recentlyDownloaded, toggleFavorite, addRecentlyViewed, addRecentlyDownloaded])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
