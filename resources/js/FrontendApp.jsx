import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Featured from './components/Featured'
import WaveBand from './components/WaveBand'
import Popular from './components/Popular'
import Testimonials from './components/Testimonials'
import Events from './components/Events'
import LearnMore from './components/LearnMore'
import Faq from './components/Faq'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'
import Login from './components/Login'
import Signup from './components/Signup'
import Reveal from './components/Reveal'
import ScrollProgress from './components/ScrollProgress'
import FeatureJourney from './components/FeatureJourney'
import { RouterProvider, useRouter } from './router/Router'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import Worksheets from './pages/Worksheets'
import WorksheetDetails from './pages/WorksheetDetails'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Help from './pages/Help'
import Activities from './pages/Activities'
import ActivityDetails from './pages/ActivityDetails'
import { NotFound } from './pages/NotFound'
import PortalDashboard from './pages/PortalDashboard'
import AccountProfile from './pages/AccountProfile'
import AdminWorksheets from './pages/AdminWorksheets'
import AuthCallback from './pages/AuthCallback'
import { AUTH0_REDIRECT_PATH, isAuth0Configured } from './services/auth0Config'
import './App.css'

const HOME_SECTIONS = [
  { Comp: Intro, variant: 'up' },
  { Comp: FeatureJourney, variant: 'up' },
  { Comp: Featured, variant: 'up' },
  { Comp: WaveBand, variant: 'scale' },
  { Comp: Popular, variant: 'left' },
  { Comp: Events, variant: 'right' },
  { Comp: LearnMore, variant: 'up' },
  { Comp: Testimonials, variant: 'up' },
  { Comp: Newsletter, variant: 'up' },
  { Comp: Faq, variant: 'up' },
]

function HomePage() {
  return (
    <>
      <Hero />
      {HOME_SECTIONS.map(({ Comp, variant }, i) => (
        <Reveal key={i} variant={variant}>
          <Comp />
        </Reveal>
      ))}
    </>
  )
}

function AppShell() {
  const [authView, setAuthView] = useState(null)
  const { path, navigate } = useRouter()
  const { user, authLoading } = useApp()

  const goHome = () => {
    setAuthView(null)
    navigate('/')
  }

  const handleSectionSelect = () => {
    setAuthView(null)
  }

  // The Auth0 redirect must be handled before anything else: it owns its own
  // full-screen flow and does not depend on a restored Sanctum session.
  if (isAuth0Configured && path === AUTH0_REDIRECT_PATH) return <AuthCallback />

  if (authLoading) return <main className="portal"><p>Restoring your session...</p></main>

  if (authView === 'login' && !user) {
    return <Login onBack={goHome} onSwitch={() => setAuthView('signup')} />
  }
  if (authView === 'signup' && !user) {
    return <Signup onBack={goHome} onSwitch={() => setAuthView('login')} />
  }

  const worksheetMatch = path.match(/^\/worksheets\/([^/]+)$/)
  const activityMatch = path.match(/^\/activities\/([^/]+)$/)

  let Page = null
  const protectedPage = (content, roles = []) => {
    if (!user) return <Login onBack={goHome} onSwitch={() => navigate('/signup')} />
    if (roles.length && !roles.includes(user.role)) return <NotFound />
    return content
  }
  if (path === '/') {
    Page = <HomePage />
  } else if (worksheetMatch) {
    Page = protectedPage(<WorksheetDetails worksheetId={decodeURIComponent(worksheetMatch[1])} />)
  } else if (path === '/worksheets') {
    Page = protectedPage(<Worksheets />)
  } else if (['/dashboard', '/admin', '/teacher', '/parent', '/student'].includes(path)) {
    Page = protectedPage(<PortalDashboard />)
  } else if (path === '/profile') {
    Page = protectedPage(<AccountProfile />)
  } else if (path === '/admin/worksheets') {
    Page = protectedPage(<AdminWorksheets />, ['admin'])
  } else if (activityMatch) {
    Page = <ActivityDetails activityId={decodeURIComponent(activityMatch[1])} />
  } else if (path === '/activities') {
    Page = <Activities />
  } else if (path === '/pricing') {
    Page = <Pricing />
  } else if (path === '/help') {
    Page = <Help />
  } else if (path === '/about') {
    Page = <About />
  } else if (path === '/login' && !user) {
    Page = <Login onBack={goHome} onSwitch={() => navigate('/signup')} />
  } else if (path === '/signup' && !user) {
    Page = <Signup onBack={goHome} onSwitch={() => navigate('/login')} />
  } else {
    Page = <NotFound />
  }

  if ((path === '/login' || path === '/signup') && !user) {
    return Page
  }

  return (
    <>
      <ScrollProgress />
      <Navbar
        onNavigate={setAuthView}
        onSectionSelect={handleSectionSelect}
        onLogoClick={goHome}
      />
      {Page}
      <Footer />
    </>
  )
}

function App() {
  return (
    <RouterProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </RouterProvider>
  )
}

export default App
