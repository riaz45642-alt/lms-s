import { useEffect, useState } from 'react'
import { useRouter } from '../router/Router'
import { useApp } from '../context/AppContext'
import './Navbar.css'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/worksheets', label: 'Worksheets' },
  { to: '/activities', label: 'Activities' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About Us' },
  { to: '/help', label: 'Help' },
]

export default function Navbar({ onNavigate, onSectionSelect, onLogoClick }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activePath, setActivePath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  )
  const { navigate } = useRouter()
  const { user, logout } = useApp()

  // Keep activePath in sync with browser back/forward buttons
  useEffect(() => {
    const onPopState = () => setActivePath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Compact, more opaque header once the page has scrolled a little
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAuth = (view) => {
    onNavigate(view)
    setMenuOpen(false)
  }

  // Central navigation helper — updates the route AND marks the clicked link active
  const go = (to) => {
    navigate(to)
    setActivePath(to)
    setMenuOpen(false)
    if (onSectionSelect) onSectionSelect()
  }

  const isActive = (to) => activePath === to
  const handleLogout = async () => { await logout(); go('/') }

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="wrap nav">
        <a
          className="logo"
          href="#"
          onClick={(e) => { e.preventDefault(); onLogoClick(); setMenuOpen(false) }}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0" stopColor="#8467F5" /><stop offset="1" stopColor="#241A4D" />
              </linearGradient>
            </defs>
            <rect x="6" y="6" width="36" height="36" rx="12" fill="url(#g1)" />
            <path d="M14 30V18l10-4 10 4v12" stroke="#FF8A3D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M14 18l10 4 10-4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span>Edu<span className="blue">Sphere</span></span>
        </a>

        <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
          {LINKS.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={isActive(l.to) ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); go(l.to) }}
            >
              {l.label}
            </a>
          ))}

          {!user && <div className="nav-cta nav-cta-mobile">
            <button className="login" onClick={() => handleAuth('login')}>Log in</button>
            <button className="btn btn-primary" onClick={() => handleAuth('signup')}>Sign up</button>
          </div>}
          {user && <div className="nav-cta nav-cta-mobile">
            <button className="login" onClick={() => go(user.role === 'admin' ? '/admin' : `/${user.role}`)}>Dashboard</button>
            <button className="btn btn-primary" onClick={handleLogout}>Log out</button>
          </div>}
        </nav>

        {!user ? <div className="nav-cta nav-cta-desktop">
          <button className="login" onClick={() => handleAuth('login')}>Log in</button>
          <button className="btn btn-primary" onClick={() => handleAuth('signup')}>Sign up</button>
        </div> : <div className="nav-cta nav-cta-desktop"><button className="login" onClick={() => go(user.role === 'admin' ? '/admin' : `/${user.role}`)}>Dashboard</button><button className="btn btn-primary" onClick={handleLogout}>Log out</button></div>}

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
