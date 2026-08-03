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
  return <main className="portal"><span className="eyebrow">Real API catalogue</span><h1>Worksheets available to you</h1>
    <input className="portal-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your worksheets" />
    {loading && <p>Loading worksheets...</p>}{error && <div className="portal-error">{error}</div>}
    <section className="portal-stats">{visible.map((item) => <article key={item.id} role="button" tabIndex="0" onClick={() => navigate(`/worksheets/${item.id}`)} onKeyDown={(e) => e.key === 'Enter' && navigate(`/worksheets/${item.id}`)}><strong style={{fontSize:'1.1rem'}}>{item.title}</strong><span>{item.subject} · {item.grade_level}</span></article>)}</section>
    {!loading && !visible.length && <p>No worksheets match your access and search.</p>}
  </main>
}
