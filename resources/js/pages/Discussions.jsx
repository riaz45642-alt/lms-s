import { useMemo, useState } from 'react'
import { discussionsData } from '../data/lmsData'
import { PageHero, EmptyState } from '../components/ui/UI'
import './pages.css'
import './lms.css'

export default function Discussions() {
  const [query, setQuery] = useState('')
  const [threads, setThreads] = useState(discussionsData)
  const [openReplies, setOpenReplies] = useState({})

  const filtered = useMemo(() => threads.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.subject.toLowerCase().includes(query.toLowerCase())), [threads, query])

  const like = (id) => setThreads((ts) => ts.map((t) => (t.id === id ? { ...t, likes: t.likes + 1 } : t)))

  return (
    <>
      <PageHero eyebrow="Ask & discuss" title="Discussions" subtitle="Ask questions, get help from teachers and classmates, and share what you know." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="filters-bar">
            <div className="search-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
              <input placeholder="Search discussions…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="💬" title="No discussions found" message="Try a different search term." />
          ) : filtered.map((t) => (
            <div className="discuss-item" key={t.id}>
              <div className="discuss-head">
                <div>
                  <h4>{t.title}</h4>
                  <div className="discuss-meta">
                    <span>{t.author}</span>
                    <span className={`role-badge-sm ${t.role}`}>{t.role}</span>
                    <span>· {t.time}</span>
                    <span className="meta-pill" style={{ padding: '3px 10px' }}>{t.subject}</span>
                  </div>
                </div>
              </div>
              <div className="discuss-actions">
                <button onClick={() => like(t.id)}>👍 {t.likes}</button>
                <button onClick={() => setOpenReplies((o) => ({ ...o, [t.id]: !o[t.id] }))}>💬 {t.replies.length} {t.replies.length === 1 ? 'reply' : 'replies'}</button>
              </div>
              {openReplies[t.id] && t.replies.map((r) => (
                <div className="reply-item" key={r.id}>
                  <div className="reply-avatar">🧑</div>
                  <div>
                    <div className="discuss-meta" style={{ marginTop: 0 }}>
                      <strong style={{ color: 'var(--ink)', fontSize: 13 }}>{r.author}</strong>
                      <span className={`role-badge-sm ${r.role}`}>{r.role}</span>
                      <span>· {r.time}</span>
                    </div>
                    <p style={{ fontSize: 13.5, marginTop: 4 }}>{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
