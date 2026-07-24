import { useApp } from '../context/AppContext'
import { useRouter } from '../router/Router'
import { dashboardStats, recentActivity, continueLearning } from '../data/appData'
import { assignmentsData, weeklyActivity, quizPerformance, calendarEvents } from '../data/lmsData'
import { StatCard, BarChart, StatusChip } from '../components/ui/UI'
import './pages.css'
import './lms.css'

const QUICK_ACTIONS = [
  { em: '📄', label: 'Browse worksheets', to: '/worksheets' },
  { em: '📚', label: 'Explore subjects', to: '/subjects' },
  { em: '🗓️', label: 'View events', to: '/events' },
  { em: '🔍', label: 'Search everything', to: '/search' },
]

const EXTRA_STATS = [
  { label: 'Total courses', value: '20', em: '📚' },
  { label: 'Completed courses', value: '5', em: '✅' },
  { label: 'Pending assignments', value: String(assignmentsData.filter((a) => a.status === 'pending').length), em: '🗒️' },
  { label: 'Avg. quiz score', value: '81%', em: '🧠' },
]

const ROLE_LABEL = { student: 'Student', teacher: 'Teacher', admin: 'Administrator' }

export default function Dashboard() {
  const { user, setRole } = useApp()
  const { navigate } = useRouter()
  const stats = dashboardStats[user.role] || dashboardStats.student

  return (
    <div className="page-section">
      <div className="wrap">
        <div className="tab-row">
          {Object.keys(ROLE_LABEL).map((r) => (
            <button key={r} className={`tab-btn${user.role === r ? ' active' : ''}`} onClick={() => setRole(r)}>
              {ROLE_LABEL[r]} view
            </button>
          ))}
        </div>

        <div className="welcome-banner">
          <div>
            <h2>Welcome back, {user.name.split(' ')[0]} 👋</h2>
            <p>Here's what's happening in your {ROLE_LABEL[user.role].toLowerCase()} dashboard today.</p>
          </div>
          <div className="welcome-em">{user.avatar}</div>
        </div>

        <div className="stats-grid">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
        <div className="stats-grid">
          {EXTRA_STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="dash-columns">
          <div>
            <div className="dash-card">
              <h3>Continue learning</h3>
              {continueLearning.map((c) => (
                <div className="progress-item" key={c.title}>
                  <div className="pi-top"><span>{c.title}</span><span>{c.progress}%</span></div>
                  <div className="pi-sub">{c.subject}</div>
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="dash-card">
              <h3>Weekly activity</h3>
              <BarChart data={weeklyActivity} valueKey="hours" labelKey="day" suffix="h" />
            </div>

            <div className="dash-card">
              <h3>Quiz performance</h3>
              <BarChart data={quizPerformance} valueKey="score" labelKey="label" color="#1f9d57" suffix="%" max={100} />
            </div>

            <div className="dash-card">
              <h3>Recent activity</h3>
              {recentActivity.map((a) => (
                <div className="activity-item" key={a.text}>
                  <span className="activity-em">{a.em}</span>
                  <span className="activity-text">{a.text}</span>
                  <span className="activity-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="dash-card">
              <h3>Quick actions</h3>
              <div className="quick-actions">
                {QUICK_ACTIONS.map((qa) => (
                  <button key={qa.label} className="qa-btn" onClick={() => navigate(qa.to)}>
                    <span className="qa-em">{qa.em}</span>
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="dash-card">
              <h3>Pending assignments</h3>
              {assignmentsData.filter((a) => a.status === 'pending').slice(0, 3).map((a) => (
                <div className="activity-item" key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/assignments/${a.id}`)}>
                  <span className="activity-em">🗒️</span>
                  <span className="activity-text">{a.title}</span>
                  <StatusChip status={a.status} />
                </div>
              ))}
              <button className="btn btn-ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => navigate('/assignments')}>View all assignments</button>
            </div>

            <div className="dash-card">
              <h3>Upcoming deadlines</h3>
              {calendarEvents.filter((e) => e.type === 'deadline' || e.type === 'exam').slice(0, 4).map((e) => (
                <div className="activity-item" key={e.id}>
                  <span className="activity-em">{e.type === 'exam' ? '📝' : '📌'}</span>
                  <span className="activity-text">{e.title}</span>
                  <span className="activity-time">{e.date.slice(5)}</span>
                </div>
              ))}
              <button className="btn btn-ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => navigate('/calendar')}>Open calendar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
