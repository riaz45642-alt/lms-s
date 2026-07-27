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
import { RouterProvider, useRouter } from './router/Router'
import { AppProvider } from './context/AppContext'
import Worksheets from './pages/Worksheets'
import WorksheetDetails from './pages/WorksheetDetails'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Help from './pages/Help'
import Activities from './pages/Activities'
import ActivityDetails from './pages/ActivityDetails'
import { NotFound } from './pages/NotFound'
import './App.css'

const HOME_SECTIONS = [Intro, Featured, WaveBand, Popular, Events, LearnMore, Testimonials, Newsletter, Faq]

function HomePage() {
  return (
    <>
      <Hero />
      {HOME_SECTIONS.map((Comp, i) => (
        <Reveal key={i}>
          <Comp />
        </Reveal>
      ))}
    </>
  )
}

function AppShell() {
  const [authView, setAuthView] = useState(null)
  const { path, navigate } = useRouter()

  const goHome = () => {
    setAuthView(null)
    navigate('/')
  }

  const handleSectionSelect = () => {
    setAuthView(null)
  }

  if (authView === 'login') {
    return <Login onBack={goHome} onSwitch={() => setAuthView('signup')} />
  }
  if (authView === 'signup') {
    return <Signup onBack={goHome} onSwitch={() => setAuthView('login')} />
  }

  const worksheetMatch = path.match(/^\/worksheets\/([^/]+)$/)
  const activityMatch = path.match(/^\/activities\/([^/]+)$/)

  let Page = null
  if (path === '/') {
    Page = <HomePage />
  } else if (worksheetMatch) {
    Page = <WorksheetDetails worksheetId={decodeURIComponent(worksheetMatch[1])} />
  } else if (path === '/worksheets') {
    Page = <Worksheets />
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
  } else if (path === '/login') {
    Page = <Login onBack={goHome} onSwitch={() => navigate('/signup')} />
  } else if (path === '/signup') {
    Page = <Signup onBack={goHome} onSwitch={() => navigate('/login')} />
  } else {
    Page = <NotFound />
  }

  if (path === '/login' || path === '/signup') {
    return Page
  }

  return (
    <>
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
