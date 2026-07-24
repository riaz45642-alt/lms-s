import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '../router/Router'
import { useApp } from '../context/AppContext'
import { courseLevels, courseSubjects, ALL_COURSES } from '../data/coursesData'
import { PageHero, CardSkeleton, EmptyState, Pagination, FavoriteButton } from '../components/ui/UI'
import './pages.css'

const PAGE_SIZE = 8

export default function Courses() {
  const { navigate } = useRouter()
  const { favorites, toggleFavorite } = useApp()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All')
  const [level, setLevel] = useState('All')
  const [category, setCategory] = useState('All')
  const [rating, setRating] = useState('All')
  const [duration, setDuration] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [query, subject, level, category, rating, duration])

  const filtered = useMemo(() => {
    return ALL_COURSES.filter((c) => {
      if (query && !c.title.toLowerCase().includes(query.toLowerCase())) return false
      if (subject !== 'All' && c.subject !== subject) return false
      if (level !== 'All' && c.level !== level) return false
      if (category === 'Free' && c.badge !== 'free') return false
      if (category === 'Premium' && c.badge !== 'prem') return false
      if (rating !== 'All' && Number(c.rating) < Number(rating)) return false
      const mins = parseInt(c.duration, 10)
      if (duration === 'Short' && mins > 90) return false
      if (duration === 'Medium' && (mins <= 90 || mins > 150)) return false
      if (duration === 'Long' && mins <= 150) return false
      return true
    })
  }, [query, subject, level, category, rating, duration])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [query, subject, level, category, rating, duration])

  const resetFilters = () => { setQuery(''); setSubject('All'); setLevel('All'); setCategory('All'); setRating('All'); setDuration('All') }

  return (
    <>
      <PageHero eyebrow="Learn interactively" title="Courses & Activities" subtitle="Self-paced interactive courses with videos, quizzes and instant feedback — a fun companion to our worksheets." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="filters-bar">
            <div className="search-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
              <input placeholder="Search courses…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="filters-bar">
            <div className="filter-group">
              {['All', 'Free', 'Premium'].map((c) => (
                <button key={c} className={`filter-chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="filters-bar">
            <div className="filter-group">
              {['All', ...courseSubjects].map((s) => (
                <button key={s} className={`filter-chip${subject === s ? ' active' : ''}`} onClick={() => setSubject(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="filters-bar">
            <div className="filter-group">
              {['All', ...courseLevels].map((l) => (
                <button key={l} className={`filter-chip${level === l ? ' active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="filters-bar">
            <div className="filter-group">
              {['All', '4.5', '4.0'].map((r) => (
                <button key={r} className={`filter-chip${rating === r ? ' active' : ''}`} onClick={() => setRating(r)}>{r === 'All' ? 'Any rating' : `${r}★ & up`}</button>
              ))}
            </div>
            <div className="filter-group">
              {['All', 'Short', 'Medium', 'Long'].map((d) => (
                <button key={d} className={`filter-chip${duration === d ? ' active' : ''}`} onClick={() => setDuration(d)}>{d === 'All' ? 'Any duration' : d}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid-cards">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState icon="🎮" title="No courses found" message="Try adjusting your filters or search term." actionLabel="Clear filters" onAction={resetFilters} />
          ) : (
            <>
              <div className="grid-cards">
                {pageItems.map((c) => (
                  <div className="wcard" key={c.id}>
                    <div className="wthumb" style={{ background: c.badge === 'free' ? '#eef6fe' : '#fff7e6', cursor: 'pointer' }} onClick={() => navigate(`/courses/${c.id}`)}>
                      <span className="wbrand">EduSphere</span>
                      <span className={`badge ${c.badge === 'free' ? 'free' : 'prem'}`}>{c.badge === 'free' ? 'Free' : 'Premium'}</span>
                      <span style={{ fontSize: '42px' }}>{c.em}</span>
                    </div>
                    <div className="wbody">
                      <h4 style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${c.id}`)}>{c.title}</h4>
                      <div className="wmeta">
                        <span className="lvl">{c.level} · {c.lessons} lessons · {c.duration}</span>
                      </div>
                      <div className="course-meta-row">
                        <span>👤 {c.instructor}</span>
                        <span>⭐ {c.rating}</span>
                        <span>👥 {c.students}</span>
                      </div>
                      {c.progress > 0 && (
                        <div className="progress-bar" style={{ marginBottom: 10 }}><div className="progress-fill" style={{ width: `${c.progress}%` }} /></div>
                      )}
                      <div className="wcard-actions">
                        <button className="btn btn-ghost" onClick={() => navigate(`/courses/${c.id}`)}>Details</button>
                        <button className="btn btn-primary" onClick={() => navigate(`/learning/${c.id}`)}>{c.progress > 0 ? 'Continue' : 'Start course'}</button>
                        <FavoriteButton active={favorites.includes(c.title)} onClick={() => toggleFavorite(c.title)} />
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
