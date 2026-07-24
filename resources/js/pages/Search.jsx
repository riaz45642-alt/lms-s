import { useMemo, useState } from 'react'
import { useRouter } from '../router/Router'
import { ALL_WORKSHEETS } from '../data/worksheetsData'
import { subjectsData, eventsData } from '../data/appData'
import { EmptyState } from '../components/ui/UI'
import './pages.css'

export default function Search({ initialQuery = '' }) {
  const { navigate } = useRouter()
  const [query, setQuery] = useState(initialQuery)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return {
      worksheets: ALL_WORKSHEETS.filter((w) => w.title.toLowerCase().includes(q)).slice(0, 6),
      subjects: subjectsData.filter((s) => s.key.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)),
      events: eventsData.filter((e) => e.title.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q)),
    }
  }, [query])

  const totalCount = results ? results.worksheets.length + results.subjects.length + results.events.length : 0

  return (
    <div className="page-section search-hero">
      <div className="wrap">
        <div className="eyebrow">Global search</div>
        <h1 style={{ fontSize: 32, marginTop: 8 }}>Search EduSphere</h1>
        <p style={{ color: 'var(--muted)', marginTop: 8 }}>Find worksheets, subjects and events all in one place.</p>
        <div className="search-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
          <input autoFocus placeholder="Search worksheets, subjects, events…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div style={{ textAlign: 'left', marginTop: 34 }}>
          {!results && (
            <p className="search-results-count">Start typing to search across the whole library.</p>
          )}
          {results && totalCount === 0 && (
            <EmptyState icon="🔍" title="No results found" message={`We couldn't find anything matching "${query}".`} />
          )}
          {results && totalCount > 0 && (
            <>
              <p className="search-results-count">{totalCount} result{totalCount !== 1 ? 's' : ''} for "{query}"</p>

              {results.worksheets.length > 0 && (
                <div className="result-group">
                  <h3>Worksheets</h3>
                  <div className="grid-cards">
                    {results.worksheets.map((w) => (
                      <div className="wcard" key={w.id} onClick={() => navigate(`/worksheets/${w.id}`)} style={{ cursor: 'pointer' }}>
                        <div className="wthumb" style={{ background: w.badge === 'free' ? '#eef6fe' : '#fff7e6' }}>
                          <span style={{ fontSize: '42px' }}>{w.em}</span>
                        </div>
                        <div className="wbody"><h4>{w.title}</h4><div className="wmeta"><span className="lvl">{w.year} · {w.subject}</span></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.subjects.length > 0 && (
                <div className="result-group">
                  <h3>Subjects</h3>
                  <div className="grid-cards">
                    {results.subjects.map((s) => (
                      <div className="subject-card" key={s.key} onClick={() => navigate(`/subjects/${s.key}`)}>
                        <div className="sc-em">{s.em}</div><h3>{s.key}</h3><p>{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.events.length > 0 && (
                <div className="result-group">
                  <h3>Events</h3>
                  <div className="grid-cards">
                    {results.events.map((e) => (
                      <div className="event-card" key={e.id} onClick={() => navigate(`/events/${e.id}`)}>
                        <div className="ec-top"><span className="ec-em">{e.em}</span><span className="ec-date">{e.date}</span></div>
                        <div className="ec-body"><h4>{e.title}</h4><p>{e.desc}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
