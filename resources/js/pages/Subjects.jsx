import { useRouter, Link } from '../router/Router'
import { subjectsData } from '../data/appData'
import { PageHero, EmptyState } from '../components/ui/UI'
import './pages.css'

export default function Subjects({ subjectKey }) {
  const { navigate } = useRouter()
  const active = subjectKey ? subjectsData.find((s) => s.key === decodeURIComponent(subjectKey)) : null

  if (active) {
    return (
      <div className="page-section">
        <div className="wrap">
          <div className="breadcrumb"><Link to="/subjects">Subjects</Link> / {active.key}</div>
          <div className="detail-layout">
            <div className="detail-preview">
              <div className="preview-surface" style={{ background: active.color }}>{active.em}</div>
            </div>
            <div className="detail-info">
              <h1>{active.key}</h1>
              <p className="desc">{active.desc}</p>
              <div className="detail-cta">
                <button className="btn btn-primary" onClick={() => navigate(`/worksheets?subject=${active.key}`)}>Browse worksheets</button>
                <button className="btn btn-ghost" onClick={() => navigate('/subjects')}>All subjects</button>
              </div>
            </div>
          </div>

          <div className="sec-head related-heading"><h2>Chapters</h2></div>
          <ul className="chapter-list" style={{ maxWidth: 620, margin: '0 auto' }}>
            {active.chapters.map((c, i) => (
              <li key={c}><span className="num">{String(i + 1).padStart(2, '0')}</span>{c}</li>
            ))}
          </ul>

          <div className="sec-head related-heading"><h2>Learning resources</h2></div>
          <div className="grid-cards">
            {['Printable worksheets', 'Video walkthroughs', 'Practice quizzes', 'Progress tracker'].map((r) => (
              <div className="stat-card" key={r}>
                <div className="stat-em">📘</div>
                <div className="stat-label" style={{ fontSize: 14, color: 'var(--ink)' }}>{r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHero eyebrow="Curriculum" title="Subjects" subtitle="Explore every subject we cover, complete with chapters and curated learning resources." />
      <div className="page-section tight">
        <div className="wrap">
          {subjectsData.length === 0 ? (
            <EmptyState title="No subjects available" message="Check back soon." />
          ) : (
            <div className="grid-cards">
              {subjectsData.map((s) => (
                <div className="subject-card" key={s.key} onClick={() => navigate(`/subjects/${s.key}`)}>
                  <div className="sc-em">{s.em}</div>
                  <h3>{s.key}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
