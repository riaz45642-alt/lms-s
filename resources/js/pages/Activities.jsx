import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '../router/Router'
import { useApp } from '../context/AppContext'
import { activitySubjects, ALL_ACTIVITIES } from '../data/activitiesData'
import { PageHero, CardSkeleton, EmptyState, Pagination, FavoriteButton } from '../components/ui/UI'
import './pages.css'

const PAGE_SIZE = 8

function ActivityKeyboardVisual() {
  const move = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    event.currentTarget.style.setProperty('--activity-rx', `${-y * 6}deg`)
    event.currentTarget.style.setProperty('--activity-ry', `${x * 9}deg`)
    event.currentTarget.style.setProperty('--activity-x', `${x * 12}px`)
    event.currentTarget.style.setProperty('--activity-y', `${y * 10}px`)
  }

  const reset = (event) => {
    event.currentTarget.style.setProperty('--activity-rx', '0deg')
    event.currentTarget.style.setProperty('--activity-ry', '0deg')
    event.currentTarget.style.setProperty('--activity-x', '0px')
    event.currentTarget.style.setProperty('--activity-y', '0px')
  }

  return (
    <div className="activity-keyboard-stage" onPointerMove={move} onPointerLeave={reset} aria-hidden="true">
      <span className="activity-orb activity-orb-one" />
      <span className="activity-orb activity-orb-two" />
      <span className="activity-spark spark-one">+</span>
      <span className="activity-spark spark-two">÷</span>
    </div>
  )
}

export default function Activities() {
  const { navigate } = useRouter()
  const { favorites, toggleFavorite } = useApp()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [query, subject, category])

  const filtered = useMemo(() => {
    return ALL_ACTIVITIES.filter((a) => {
      if (query && !a.title.toLowerCase().includes(query.toLowerCase())) return false
      if (subject !== 'All' && a.subject !== subject) return false
      if (category === 'Free' && a.badge !== 'free') return false
      if (category === 'Premium' && a.badge !== 'prem') return false
      return true
    })
  }, [query, subject, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [query, subject, category])

  const resetFilters = () => { setQuery(''); setSubject('All'); setCategory('All') }

  return (
    <>
      <div className="activity-world-hero"><div className="wrap activity-world-grid"><div><span className="eyebrow">Quick & playful</span><h1>Choose your next adventure</h1><p>Games, puzzles and quick challenges.</p></div><ActivityKeyboardVisual /></div></div>
      <div className="page-section tight activity-explorer" data-companion-section="activity-library">
        <div className="wrap">
          <div className="filters-toolbar">
            <div className="search-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
              <input placeholder="Search activities…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="toolbar-divider" />
            <div className="toolbar-selects">
              <div className={`select-pill${category !== 'All' ? ' is-active' : ''}`}>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {['All', 'Free', 'Premium'].map((c) => <option key={c} value={c}>{c === 'All' ? 'All access' : c}</option>)}
                </select>
              </div>
              <div className={`select-pill${subject !== 'All' ? ' is-active' : ''}`}>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="All">All subjects</option>
                  {activitySubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid-cards">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState icon="🧩" title="No activities found" message="Try adjusting your filters or search term." actionLabel="Clear filters" onAction={resetFilters} />
          ) : (
            <>
              <div className="grid-cards">
                {pageItems.map((a) => (
                  <div className="wcard" key={a.id}>
                    <div className="wthumb" style={{ background: a.badge === 'free' ? '#F1ECFE' : '#FFE9D8', cursor: 'pointer' }} onClick={() => navigate(`/activities/${a.id}`)}>
                      <span className="wbrand">EduSphere</span>
                      <span className={`badge ${a.badge === 'free' ? 'free' : 'prem'}`}>{a.badge === 'free' ? 'Free' : 'Premium'}</span>
                      <span style={{ fontSize: '42px' }}>{a.em}</span>
                    </div>
                    <div className="wbody">
                      <h4 style={{ cursor: 'pointer' }} onClick={() => navigate(`/activities/${a.id}`)}>{a.title}</h4>
                      <div className="wmeta">
                        <span className="lvl">{a.subject} · {a.minutes} min</span>
                      </div>
                      <div className="wcard-actions">
                        <button className="btn btn-ghost" onClick={() => navigate(`/activities/${a.id}`)}>Details</button>
                        <button className="btn btn-primary" onClick={() => navigate(`/activities/${a.id}`)}>Play now</button>
                        <FavoriteButton active={favorites.includes(a.title)} onClick={() => toggleFavorite(a.title)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
