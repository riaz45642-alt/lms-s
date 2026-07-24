import { useEffect, useMemo, useState } from 'react'
import { useRouter, Link } from '../router/Router'
import { ALL_COURSES } from '../data/coursesData'
import { buildLessons } from '../data/lmsData'
import { EmptyState, ListSkeleton } from '../components/ui/UI'
import './pages.css'
import './lms.css'

const TABS = [
  { key: 'notes', label: 'Notes' },
  { key: 'resources', label: 'Resources' },
  { key: 'about', label: 'About course' },
]

export default function Learning({ courseId }) {
  const { navigate } = useRouter()
  const course = ALL_COURSES.find((c) => c.id === courseId) || ALL_COURSES[0]
  const lessons = useMemo(() => buildLessons(course), [course])
  const [loading, setLoading] = useState(true)
  const [currentId, setCurrentId] = useState(lessons[0]?.id)
  const [done, setDone] = useState(() => new Set(lessons.filter((l) => l.completed).map((l) => l.id)))
  const [tab, setTab] = useState('notes')
  const [note, setNote] = useState('')

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [courseId])

  useEffect(() => { setCurrentId(lessons[0]?.id); setDone(new Set(lessons.filter((l) => l.completed).map((l) => l.id))) }, [course.id]) // eslint-disable-line

  if (!course) {
    return (
      <div className="page-section"><div className="wrap">
        <EmptyState icon="🎬" title="Course not found" actionLabel="Back to courses" onAction={() => navigate('/courses')} />
      </div></div>
    )
  }

  const idx = lessons.findIndex((l) => l.id === currentId)
  const current = lessons[idx] || lessons[0]
  const completedCount = done.size
  const progressPct = Math.round((completedCount / lessons.length) * 100)

  const goTo = (i) => { if (i >= 0 && i < lessons.length) setCurrentId(lessons[i].id) }
  const markComplete = () => setDone((d) => new Set(d).add(current.id))

  return (
    <div className="page-section">
      <div className="wrap">
        <div className="breadcrumb"><Link to="/courses">Courses</Link> / <Link to={`/courses/${course.id}`}>{course.title}</Link> / {current?.title}</div>

        <div className="player-layout">
          <div>
            <div className="video-surface">
              <span className="video-em">{course.em}</span>
              <button className="play-btn" aria-label="Play lesson">▶</button>
            </div>
            <div className="player-nav">
              <button className="btn btn-ghost" disabled={idx === 0} onClick={() => goTo(idx - 1)}>← Previous lesson</button>
              <span style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>Lesson {idx + 1} of {lessons.length}</span>
              <button className="btn btn-ghost" disabled={idx === lessons.length - 1} onClick={() => goTo(idx + 1)}>Next lesson →</button>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="pi-top" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                <span>Course progress</span><span>{progressPct}%</span>
              </div>
              <div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>

            <div className="lesson-tabs">
              {TABS.map((t) => (
                <button key={t.key} className={`lesson-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
              ))}
            </div>

            {loading ? <ListSkeleton rows={2} /> : (
              <div className="lesson-panel">
                {tab === 'notes' && (
                  <>
                    <h4 style={{ marginBottom: 12 }}>{current?.title}</h4>
                    <textarea
                      className="note-area" value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Jot down notes for this lesson…"
                      style={{ width: '100%', minHeight: 140, border: '1.5px solid var(--line)', borderRadius: 12, padding: 14, fontFamily: 'var(--font-b)', fontSize: 14, outline: 'none', background: 'var(--sky-soft)' }}
                    />
                  </>
                )}
                {tab === 'resources' && (
                  <>
                    {['Lesson slides.pdf', 'Practice worksheet.pdf', 'Answer key.pdf'].map((r) => (
                      <div key={r} className="resource-item">
                        <span className="res-em">📎</span>
                        <span className="name">{r}</span>
                        <button className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Download</button>
                      </div>
                    ))}
                  </>
                )}
                {tab === 'about' && <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{course.summary}</p>}
              </div>
            )}

            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <button className={`btn ${done.has(current?.id) ? 'btn-ghost' : 'btn-primary'}`} onClick={markComplete} disabled={done.has(current?.id)}>
                {done.has(current?.id) ? '✓ Lesson completed' : 'Mark lesson as completed'}
              </button>
            </div>
          </div>

          <div className="sidebar-course">
            <div className="sidebar-course-head">
              <h4>{course.title}</h4>
              <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{completedCount}/{lessons.length} lessons completed</span>
            </div>
            <div className="lesson-list">
              {lessons.map((l, i) => (
                <div key={l.id} className={`lesson-row${l.id === currentId ? ' current' : ''}`} onClick={() => goTo(i)}>
                  <span className={`lesson-check${done.has(l.id) ? ' done' : ''}`}>{done.has(l.id) ? '✓' : i + 1}</span>
                  <div>
                    <div className="lesson-row-title">{l.title}</div>
                    <div className="lesson-row-meta">{l.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
