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
import { RouterProvider, useRouter } from './router/Router'
import { AppProvider } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Worksheets from './pages/Worksheets'
import WorksheetDetails from './pages/WorksheetDetails'
import Subjects from './pages/Subjects'
import EventsPage from './pages/EventsPage'
import SearchPage from './pages/Search'
import Notifications from './pages/Notifications'
import Contact from './pages/Contact'
import About from './pages/About'
import ForgotPassword from './pages/ForgotPassword'
import Workbooks from './pages/Workbooks'
import WorkbookDetails from './pages/WorkbookDetails'
import Courses from './pages/Courses'
import CourseDetails from './pages/CourseDetails'
import Pricing from './pages/Pricing'
import Help from './pages/Help'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Activities from './pages/Activities'
import ActivityDetails from './pages/ActivityDetails'
import OurServices from './pages/OurServices'
import Parent from './pages/Parent'
import Educator from './pages/Educator'
import Student from './pages/Student'
import { NotFound, EmptyStatePage } from './pages/NotFound'
import Learning from './pages/Learning'
import Quiz from './pages/Quiz'
import Assignments from './pages/Assignments'
import AssignmentDetails from './pages/AssignmentDetails'
import Certificates from './pages/Certificates'
import CalendarPage from './pages/Calendar'
import ProgressAnalytics from './pages/ProgressAnalytics'
import SettingsPage from './pages/Settings'
import Wishlist from './pages/Wishlist'
import Bookmarks from './pages/Bookmarks'
import Discussions from './pages/Discussions'
import './App.css'

const HOME_SECTIONS = [Intro, Featured, WaveBand, Popular, Events, LearnMore, Testimonials, Newsletter, Faq]

function HomePage() {
  return (
    <>
      <Hero />
      {HOME_SECTIONS.map((Comp, i) => <Comp key={i} />)}
    </>
  )
}

function AppShell() {
  const [authView, setAuthView] = useState(null)
  const { path, params, navigate } = useRouter()

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
  const subjectMatch = path.match(/^\/subjects\/([^/]+)$/)
  const eventMatch = path.match(/^\/events\/([^/]+)$/)
  const workbookMatch = path.match(/^\/workbooks\/([^/]+)$/)
  const courseMatch = path.match(/^\/courses\/([^/]+)$/)
  const activityMatch = path.match(/^\/activities\/([^/]+)$/)
  const learningMatch = path.match(/^\/learning\/([^/]+)$/)
  const quizMatch = path.match(/^\/quiz\/([^/]+)$/)
  const assignmentMatch = path.match(/^\/assignments\/([^/]+)$/)

  let Page = null
  if (path === '/') {
    Page = <HomePage />
  } else if (path === '/dashboard') {
    Page = <Dashboard />
  } else if (path === '/profile') {
    Page = <Profile />
  } else if (learningMatch) {
    Page = <Learning courseId={decodeURIComponent(learningMatch[1])} />
  } else if (quizMatch) {
    Page = <Quiz quizId={decodeURIComponent(quizMatch[1])} />
  } else if (assignmentMatch) {
    Page = <AssignmentDetails assignmentId={decodeURIComponent(assignmentMatch[1])} />
  } else if (path === '/assignments') {
    Page = <Assignments />
  } else if (path === '/certificates') {
    Page = <Certificates />
  } else if (path === '/calendar') {
    Page = <CalendarPage />
  } else if (path === '/progress') {
    Page = <ProgressAnalytics />
  } else if (path === '/settings') {
    Page = <SettingsPage />
  } else if (path === '/wishlist') {
    Page = <Wishlist />
  } else if (path === '/bookmarks') {
    Page = <Bookmarks />
  } else if (path === '/discussions') {
    Page = <Discussions />
  } else if (worksheetMatch) {
    Page = <WorksheetDetails worksheetId={decodeURIComponent(worksheetMatch[1])} />
  } else if (path === '/worksheets') {
    Page = <Worksheets />
  } else if (subjectMatch) {
    Page = <Subjects subjectKey={decodeURIComponent(subjectMatch[1])} />
  } else if (path === '/subjects') {
    Page = <Subjects />
  } else if (eventMatch) {
    Page = <EventsPage eventId={decodeURIComponent(eventMatch[1])} />
  } else if (path === '/events') {
    Page = <EventsPage />
  } else if (path === '/search') {
    Page = <SearchPage initialQuery={params.q || ''} />
  } else if (path === '/notifications') {
    Page = <Notifications />
  } else if (workbookMatch) {
    Page = <WorkbookDetails workbookId={decodeURIComponent(workbookMatch[1])} />
  } else if (path === '/workbooks') {
    Page = <Workbooks />
  } else if (courseMatch) {
    Page = <CourseDetails courseId={decodeURIComponent(courseMatch[1])} />
  } else if (path === '/courses') {
    Page = <Courses />
  } else if (activityMatch) {
    Page = <ActivityDetails activityId={decodeURIComponent(activityMatch[1])} />
  } else if (path === '/activities') {
    Page = <Activities />
  } else if (path === '/pricing') {
    Page = <Pricing />
  } else if (path === '/help') {
    Page = <Help />
  } else if (path === '/privacy') {
    Page = <Privacy />
  } else if (path === '/terms') {
    Page = <Terms />
  } else if (path === '/our-services') {
    Page = <OurServices />
  } else if (path === '/parent') {
    Page = <Parent />
  } else if (path === '/educator') {
    Page = <Educator />
  } else if (path === '/student') {
    Page = <Student />
  } else if (path === '/contact') {
    Page = <Contact />
  } else if (path === '/about') {
    Page = <About />
  } else if (path === '/forgot-password') {
    Page = <ForgotPassword mode="forgot" />
  } else if (path === '/reset-password') {
    Page = <ForgotPassword mode="reset" />
  } else if (path === '/empty') {
    Page = <EmptyStatePage />
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
