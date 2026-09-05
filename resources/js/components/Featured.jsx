import { useEffect, useMemo, useState } from 'react'
import api, { errorMessage } from '../services/api'
import { useRouter } from '../router/Router'
import './Featured.css'

export default function Featured() {
  const { navigate } = useRouter()
  const [items, setItems] = useState([])
  const [curYear, setCurYear] = useState('All')
  const [curSubj, setCurSubj] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/catalog/home').then(({ data }) => { if (active) setItems(data.worksheets || []) })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const years = useMemo(() => ['All', ...new Set(items.map((item) => item.grade_level).filter(Boolean))], [items])
  const subjects = useMemo(() => ['All', ...new Set(items.map((item) => item.subject).filter(Boolean))], [items])
  const list = items.filter((item) => (curYear === 'All' || item.grade_level === curYear) && (curSubj === 'All' || item.subject === curSubj))

  return (
    <section className="featured" id="featured">
      <div className="wrap">
        <div className="sec-head">
          <h2>Featured worksheets</h2>
          <p>Easily download, print, score and track progress with our curated selection.</p>
        </div>
        <button className="btn btn-primary free-cta" onClick={() => navigate('/worksheets')}>Browse worksheets</button>

        <div className="year-tabs">
          {years.map((y) => (
            <button
              key={y}
              className={`year-tab${curYear === y ? ' active' : ''}`}
              onClick={() => setCurYear(y)}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="feat-layout">
          <div className="subj-list">
            {subjects.map((s) => (
              <button
                key={s}
                className={`subj${curSubj === s ? ' active' : ''}`}
                onClick={() => setCurSubj(s)}
              >
                {s} <span className="chev">›</span>
              </button>
            ))}
          </div>

          <div className="cards">
            {loading && <p role="status">Loading featured worksheets...</p>}
            {error && <p role="alert">{error}</p>}
            {!loading && !error && !list.length && <p>No published worksheets are available for this selection yet.</p>}
            {list.map((item) => (
              <button className="wcard" key={item.id} onClick={() => navigate(`/worksheets/${item.id}`)}>
                <div className="wthumb" style={{ background: '#F1ECFE' }}>
                  <span className="wbrand">EduSphere</span>
                  <span className="badge free">Available</span>
                  <span style={{ fontSize: '42px' }}>📄</span>
                </div>
                <div className="wbody">
                  <h4>{item.title}</h4>
                  <div className="wmeta">
                    <span className="lvl">{item.grade_level} · {item.subject}</span>
                    <span className="pdf"><i>PDF</i></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
