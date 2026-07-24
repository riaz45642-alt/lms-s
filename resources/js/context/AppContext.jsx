import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { notificationsSeed } from '../data/appData'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Amelia Carter',
    email: 'amelia.carter@example.com',
    role: 'student',
    avatar: '👩‍🎓',
    joined: 'Sept 2024',
  })
  const [favorites, setFavorites] = useState(['Adding 2 Worksheet', 'Parts of a Plant'])
  const [recentlyViewed, setRecentlyViewed] = useState(['Letter Tracing A–Z', 'Continents & Oceans'])
  const [recentlyDownloaded, setRecentlyDownloaded] = useState(['Sight Words Practice'])
  const [notifications, setNotifications] = useState(notificationsSeed)

  const toggleFavorite = useCallback((title) => {
    setFavorites((f) => (f.includes(title) ? f.filter((t) => t !== title) : [title, ...f]))
  }, [])

  const addRecentlyViewed = useCallback((title) => {
    setRecentlyViewed((r) => [title, ...r.filter((t) => t !== title)].slice(0, 8))
  }, [])

  const addRecentlyDownloaded = useCallback((title) => {
    setRecentlyDownloaded((r) => [title, ...r.filter((t) => t !== title)].slice(0, 8))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const setRole = useCallback((role) => setUser((u) => ({ ...u, role })), [])
  const updateUser = useCallback((patch) => setUser((u) => ({ ...u, ...patch })), [])

  const value = useMemo(() => ({
    user, setRole, updateUser,
    favorites, toggleFavorite,
    recentlyViewed, addRecentlyViewed,
    recentlyDownloaded, addRecentlyDownloaded,
    notifications, markAllRead, markRead,
    unreadCount: notifications.filter((n) => !n.read).length,
  }), [user, favorites, recentlyViewed, recentlyDownloaded, notifications, toggleFavorite, addRecentlyViewed, addRecentlyDownloaded, markAllRead, markRead, setRole, updateUser])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
