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
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import './App.css'
import './experience.css'
import LearningCompanion from './components/characters/LearningCompanion'
import CharacterWorld from './components/characters/CharacterWorld'
import ConnectedLms from './pages/ConnectedLms'
import GlobalSearch from './pages/GlobalSearch'

function companionPageForPath(path) {
  if (path === '/') return 'home'
  if (path === '/help') return 'help'
  if (path === '/activities') return 'activities'
  if (/^\/activities\//.test(path)) return 'activity'
  if (path === '/worksheets') return 'worksheets'
  if (/^\/worksheets\//.test(path)) return 'worksheet'
  if (['/dashboard', '/admin', '/teacher', '/parent', '/student'].includes(path)) return 'dashboard'
  if (path === '/courses') return 'courses'
  if (/^\/learning\//.test(path)) return 'learning'
  if (/progress|achievement|certificate/.test(path)) return 'progress'
  return null
}

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

  const openForgotPassword = () => {
    setAuthView(null)
    navigate('/forgot-password')
  }

  if (authLoading) return <main className="portal"><p>Restoring your session...</p></main>

  if (authView === 'login' && !user) {
    return <Login onBack={goHome} onSwitch={() => setAuthView('signup')} onForgotPassword={openForgotPassword} />
  }
  if (authView === 'signup' && !user) {
    return <Signup onBack={goHome} onSwitch={() => setAuthView('login')} />
  }

  const worksheetMatch = path.match(/^\/worksheets\/([^/]+)$/)
  const activityMatch = path.match(/^\/activities\/([^/]+)$/)
  const courseMatch = path.match(/^\/courses\/([^/]+)$/)
  const workbookMatch = path.match(/^\/workbooks\/([^/]+)$/)
  const bundleMatch = path.match(/^\/worksheet-bundles\/([^/]+)$/)

  let Page = null
  const protectedPage = (content, roles = []) => {
    if (!user) return <Login onBack={goHome} onSwitch={() => navigate('/signup')} onForgotPassword={openForgotPassword} />
    if (!user.email_verified_at) return <VerifyEmail />
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
    Page = protectedPage(<ConnectedLms type="quizzes" id={decodeURIComponent(activityMatch[1])} />)
  } else if (path === '/activities') {
    Page = protectedPage(<ConnectedLms type="quizzes" />)
  } else if (courseMatch) {
    Page = protectedPage(<ConnectedLms type="courses" id={decodeURIComponent(courseMatch[1])} />)
  } else if (path === '/courses') {
    Page = protectedPage(<ConnectedLms type="courses" />)
  } else if (workbookMatch) {
    Page = protectedPage(<ConnectedLms type="workbooks" id={decodeURIComponent(workbookMatch[1])} />)
  } else if (path === '/workbooks') {
    Page = protectedPage(<ConnectedLms type="workbooks" />)
  } else if (bundleMatch) {
    Page = protectedPage(<ConnectedLms type="bundles" id={decodeURIComponent(bundleMatch[1])} />)
  } else if (path === '/worksheet-bundles') {
    Page = protectedPage(<ConnectedLms type="bundles" />)
  } else if (path === '/search') {
    Page = protectedPage(<GlobalSearch />)
  } else if (path === '/messages') {
    Page = protectedPage(<ConnectedLms type="messages" />)
  } else if (path === '/notifications') {
    Page = protectedPage(<ConnectedLms type="notifications" />)
  } else if (path === '/calendar') {
    Page = protectedPage(<ConnectedLms type="calendar" />)
  } else if (path === '/certificates') {
    Page = protectedPage(<ConnectedLms type="certificates" />)
  } else if (['/bookmarks','/wishlist','/favorites'].includes(path)) {
    Page = protectedPage(<ConnectedLms type="saved" savedKind={path === '/favorites' ? 'favorite' : path === '/wishlist' ? 'wishlist' : 'bookmark'} />)
  } else if (path === '/users') {
    Page = protectedPage(<ConnectedLms type="admin" />, ['admin'])
  } else if (path === '/classes') {
    Page = protectedPage(<ConnectedLms type="classes" />, ['admin','teacher'])
  } else if (path === '/subjects') {
    Page = protectedPage(<ConnectedLms type="subjects" />)
  } else if (path === '/billing') {
    Page = protectedPage(<ConnectedLms type="billing" />)
  } else if (path === '/pricing') {
    Page = <Pricing />
  } else if (path === '/help') {
    Page = <Help />
  } else if (path === '/about') {
    Page = <About />
  } else if (path === '/forgot-password') {
    Page = <ForgotPassword />
  } else if (path === '/reset-password') {
    Page = <ResetPassword />
  } else if (path === '/verify-email') {
    Page = <VerifyEmail />
  } else if (path === '/login' && !user) {
    Page = <Login onBack={goHome} onSwitch={() => navigate('/signup')} onForgotPassword={openForgotPassword} />
  } else if (path === '/signup' && !user) {
    Page = <Signup onBack={goHome} onSwitch={() => navigate('/login')} />
  } else {
    Page = <NotFound />
  }

  if (['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(path)) {
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
      {companionPageForPath(path) && (user || !['worksheets', 'worksheet', 'dashboard'].includes(companionPageForPath(path))) && <LearningCompanion page={companionPageForPath(path)} />}
      {companionPageForPath(path) ? <CharacterWorld page={companionPageForPath(path)}>{Page}</CharacterWorld> : Page}
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
