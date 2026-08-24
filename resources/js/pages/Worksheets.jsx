import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useRouter } from '../router/Router'
import { errorMessage } from '../services/api'
import './pages.css'
import './Portal.css'

export default function Worksheets() {
  const { api } = useApp()
  const { navigate } = useRouter()
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/worksheets').then(({ data }) => setItems(data.data || []))
      .catch((e) => setError(errorMessage(e))).finally(() => setLoading(false))
  }, [])

  const visible = items.filter((item) => `${item.title} ${item.subject} ${item.grade_level}`.toLowerCase().includes(query.toLowerCase()))
  return <main className="portal worksheet-world"><div className="catalogue-head" data-companion-section="worksheet-library"><div><span className="eyebrow">Learning library</span><h1>Pick your next worksheet</h1><p>Find a topic and start learning.</p></div></div>
    <label className="search-shell" data-companion-section="worksheet-search"><span aria-hidden="true">⌕</span><input className="portal-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search worksheets" /></label>
    {loading && <p>Loading worksheets...</p>}{error && <div className="portal-error">{error}</div>}
    <section className="worksheet-grid">{visible.map((item, index) => <article className={`worksheet-tile tone-${index % 4}`} key={item.id} role="button" tabIndex="0" onClick={() => navigate(`/worksheets/${item.id}`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/worksheets/${item.id}`)}><span className="worksheet-glyph" aria-hidden="true">{['∑','Aa','⌘','◎'][index % 4]}</span><div><span className="worksheet-subject">{item.subject}</span><strong>{item.title}</strong><small>{item.grade_level}</small></div><span className="tile-arrow" aria-hidden="true">→</span></article>)}</section>
    {!loading && !visible.length && <p>No worksheets match your access and search.</p>}
  </main>
}
