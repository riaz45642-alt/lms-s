import { useState } from 'react'
import { useRouter } from '../router/Router'
import { bookmarkedLessons } from '../data/lmsData'
import { PageHero, EmptyState } from '../components/ui/UI'
import './pages.css'
import './lms.css'

export default function Bookmarks() {
  const { navigate } = useRouter()
  const [items, setItems] = useState(bookmarkedLessons)

  return (
    <>
      <PageHero eyebrow="Pick up where you left off" title="Bookmarked Lessons" subtitle="Lessons you've bookmarked to revisit later." />
      <div className="page-section tight">
        <div className="wrap">
          {items.length === 0 ? (
            <EmptyState icon="🔖" title="No bookmarks yet" message="Bookmark a lesson while learning and it'll appear here." actionLabel="Browse courses" onAction={() => navigate('/courses')} />
          ) : (
            <div className="assign-table">
              {items.map((b) => (
                <div className="assign-row" key={b.id} style={{ gridTemplateColumns: '2fr 1fr 1fr auto' }}>
                  <div>
                    <div className="a-title">{b.lesson}</div>
                    <div className="a-sub">{b.course}</div>
                  </div>
                  <div>
                    <div className="progress-bar" style={{ width: 100 }}><div className="progress-fill" style={{ width: `${b.progress}%` }} /></div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{b.progress}% complete</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => navigate('/courses')}>Resume</button>
                    <button className="btn btn-ghost" onClick={() => setItems((l) => l.filter((x) => x.id !== b.id))}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
