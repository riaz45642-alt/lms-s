import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '../router/Router'
import { useApp } from '../context/AppContext'
import { years, subjects, ALL_WORKSHEETS } from '../data/worksheetsData'
import { PageHero, CardSkeleton, EmptyState, Pagination, FavoriteButton } from '../components/ui/UI'
import './pages.css'

const PAGE_SIZE = 8

export default function Worksheets() {
  const { navigate } = useRouter()
  const { favorites, toggleFavorite } = useApp()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All')
  const [year, setYear] = useState('All')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [query, subject, year, category])

  const filtered = useMemo(() => {
    return ALL_WORKSHEETS.filter((w) => {
      if (query && !w.title.toLowerCase().includes(query.toLowerCase())) return false
      if (subject !== 'All' && w.subject !== subject) return false
      if (year !== 'All' && w.year !== year) return false
      if (category === 'Free' && w.badge !== 'free') return false
      if (category === 'Premium' && w.badge !== 'prem') return false
      return true
    })
  }, [query, subject, year, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [query, subject, year, category])

  const resetFilters = () => { setQuery(''); setSubject('All'); setYear('All'); setCategory('All') }

  return (
    <>
      <PageHero eyebrow="Resource library" title="Worksheets" subtitle="Search, filter and download curriculum-aligned worksheets for every subject and grade." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="filters-bar">
            <div className="search-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
              <input placeholder="Search worksheets…" value={query} onChange={(e) => setQuery(e.target.value)} />
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
              {['All', ...subjects].map((s) => (
                <button key={s} className={`filter-chip${subject === s ? ' active' : ''}`} onClick={() => setSubject(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="filters-bar">
            <div className="filter-group">
              {['All', ...years].map((y) => (
                <button key={y} className={`filter-chip${year === y ? ' active' : ''}`} onClick={() => setYear(y)}>{y}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid-cards">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState icon="🔍" title="No worksheets found" message="Try adjusting your filters or search term." actionLabel="Clear filters" onAction={resetFilters} />
          ) : (
            <>
              <div className="grid-cards">
                {pageItems.map((w) => (
                  <div className="wcard" key={w.id}>
                    <div className="wthumb" style={{ background: w.badge === 'free' ? '#eef6fe' : '#fff7e6', cursor: 'pointer' }} onClick={() => navigate(`/worksheets/${w.id}`)}>
                      <span className="wbrand">EduSphere</span>
                      <span className={`badge ${w.badge === 'free' ? 'free' : 'prem'}`}>{w.badge === 'free' ? 'Free' : 'Premium'}</span>
                      <span style={{ fontSize: '42px' }}>{w.em}</span>
                    </div>
                    <div className="wbody">
                      <h4 style={{ cursor: 'pointer' }} onClick={() => navigate(`/worksheets/${w.id}`)}>{w.title}</h4>
                      <div className="wmeta">
                        <span className="lvl">{w.year} · {w.subject}</span>
                      </div>
                      <div className="wcard-actions">
                        <button className="btn btn-ghost" onClick={() => navigate(`/worksheets/${w.id}`)}>Preview</button>
                        <button className="btn btn-primary" onClick={() => navigate(`/worksheets/${w.id}`)}>Download</button>
                        <FavoriteButton active={favorites.includes(w.title)} onClick={() => toggleFavorite(w.title)} />
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
