import { useEffect, useRef, useState } from 'react'
import { useRouter } from '../router/Router'
import { useApp } from '../context/AppContext'
import './Navbar.css'

const PRIMARY_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/worksheets', label: 'Worksheets' },
  { to: '/workbooks', label: 'Workbooks' },
  { to: '/courses', label: 'Courses' },
  { to: '/activities', label: 'Activities' },
]

const MORE_LINKS = [
  { to: '/subjects', label: 'Subjects' },
  { to: '/events', label: 'Events' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/our-services', label: 'Our services' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/progress', label: 'Progress' },
  { to: '/discussions', label: 'Discussions' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/bookmarks', label: 'Bookmarks' },
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar({ onNavigate, onSectionSelect, onLogoClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [q, setQ] = useState('')
  const [activePath, setActivePath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  )
  const { navigate } = useRouter()
  const { unreadCount } = useApp()
  const moreRef = useRef(null)

  // Keep activePath in sync with browser back/forward buttons
  useEffect(() => {
    const onPopState = () => setActivePath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!moreOpen) return
    const onClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [moreOpen])

  const handleAuth = (view) => {
    onNavigate(view)
    setMenuOpen(false)
  }

  const handleHelp = () => {
    navigate('/help')
    setActivePath('/help')
    onSectionSelect('help')
    setMenuOpen(false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const target = q ? `/search?q=${encodeURIComponent(q)}` : '/search'
    navigate(target)
    setActivePath('/search')
    setMenuOpen(false)
  }

  // Central navigation helper — updates the route AND marks the clicked link active
  const go = (to) => {
    navigate(to)
    setActivePath(to)
    setMenuOpen(false)
    setMoreOpen(false)
  }

  const isActive = (to) => activePath === to

  return (
    <header>
      <div className="wrap nav">
        <a
          className="logo"
          href="#"
          onClick={(e) => { e.preventDefault(); onLogoClick(); setMenuOpen(false) }}
        >
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0" stopColor="#1f86e0" /><stop offset="1" stopColor="#142d6f" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="22" r="16" fill="none" stroke="url(#g1)" strokeWidth="2.2" />
            <ellipse cx="24" cy="22" rx="7" ry="16" fill="none" stroke="url(#g1)" strokeWidth="1.6" />
            <line x1="8" y1="22" x2="40" y2="22" stroke="url(#g1)" strokeWidth="1.6" />
            <path d="M24 16c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z" fill="#142d6f" />
            <path d="M16 30h16l-8 4z" fill="#1f86e0" />
            <path d="M38 10l1.6 3.4 3.6.4-2.7 2.5.8 3.6L38 18l-3.3 1.9.8-3.6L32.8 13.8l3.6-.4z" fill="#f6b81e" />
          </svg>
          <span>Edu<span className="blue">Sphere</span></span>
        </a>

        <form className="search" onSubmit={handleSearchSubmit}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input type="search" placeholder="Search worksheets…" aria-label="Search worksheets" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
          {PRIMARY_LINKS.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={isActive(l.to) ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); go(l.to) }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#"
            className={isActive('/help') ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); handleHelp() }}
          >
            Help
          </a>

          <div className="more-wrap" ref={moreRef}>
            <button
              type="button"
              className="more-btn"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
            >
              More <span className={`chev${moreOpen ? ' up' : ''}`}>›</span>
            </button>
            <div className={`more-menu${moreOpen ? ' open' : ''}`}>
              {MORE_LINKS.map((l) => (
                <a
                  key={l.to}
                  href={l.to}
                  className={isActive(l.to) ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); go(l.to) }}
                >
                  {l.label}
                  {l.to === '/notifications' && unreadCount > 0 && <span className="more-badge">{unreadCount}</span>}
                </a>
              ))}
            </div>
          </div>

          <div className="nav-cta nav-cta-mobile">
            <button className="login" onClick={() => handleAuth('login')}>Log in</button>
            <button className="btn btn-primary" onClick={() => handleAuth('signup')}>Sign up</button>
          </div>
        </nav>

        <button className="icon-btn" aria-label="Notifications" onClick={() => go('/notifications')}>
          🔔{unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
        </button>

        <div className="nav-cta nav-cta-desktop">
          <button className="login" onClick={() => handleAuth('login')}>Log in</button>
          <button className="btn btn-primary" onClick={() => handleAuth('signup')}>Sign up</button>
        </div>

        <button
          className={`burger${menuOpen ? ' open' : ''}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  )
}