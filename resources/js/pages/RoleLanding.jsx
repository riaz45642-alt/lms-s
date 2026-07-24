import { useRouter } from '../router/Router'
import { roleLandingData } from '../data/roleLandingData'
import { PageHero } from '../components/ui/UI'
import './pages.css'

const ROLE_SWITCH = [
  { key: 'parent', to: '/parent', label: 'Parent' },
  { key: 'educator', to: '/educator', label: 'Educator' },
  { key: 'student', to: '/student', label: 'Student' },
]

export default function RoleLanding({ role }) {
  const { navigate } = useRouter()
  const data = roleLandingData[role]

  return (
    <>
      <PageHero eyebrow={data.eyebrow} title={data.title} subtitle={data.subtitle}>
        <div className="role-switch-row" style={{ marginTop: 20 }}>
          {ROLE_SWITCH.map((r) => (
            <button
              key={r.key}
              className={`filter-chip${r.key === role ? ' active' : ''}`}
              onClick={() => navigate(r.to)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </PageHero>
      <div className="page-section tight">
        <div className="wrap">
          <div className="role-stats">
            {data.stats.map((s) => (
              <div className="role-stat" key={s.label}>
                <div className="rs-em">{s.em}</div>
                <div className="rs-value">{s.value}</div>
                <div className="rs-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="sec-head related-heading"><h2>Why {role === 'educator' ? 'educators' : role + 's'} choose EduSphere</h2></div>
          <div className="feature-grid">
            {data.features.map((f) => (
              <div className="feature-item" key={f.title}>
                <div className="f-em">{f.em}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="role-cta-row">
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>{data.ctaLabel}</button>
            <button className="btn btn-ghost" onClick={() => navigate('/pricing')}>View pricing</button>
          </div>
        </div>
      </div>
    </>
  )
}
