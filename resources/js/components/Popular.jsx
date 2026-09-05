import { useEffect, useState } from 'react'
import api, { errorMessage } from '../services/api'
import { useRouter } from '../router/Router'
import './Popular.css'

export default function Popular() {
  const { navigate } = useRouter()
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    api.get('/catalog/home').then(({ data }) => { if (active) setPacks(data.bundles || []) })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  return (
    <section className="popular" id="popular">
      <div className="wrap">
        <div className="sec-head">
          <h2>Popular worksheet packs</h2>
          <p>Connect your students and engage them with our most-downloaded worksheet collections.</p>
        </div>
        {loading && <p role="status">Loading worksheet packs...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && !packs.length && <p>No published worksheet packs are available yet.</p>}
        <div className="pgrid">
          {packs.map((pack, index) => (
            <button className="pcard" style={{ background: ['#6c4ee3', '#d46a35', '#27865e', '#3976bd'][index % 4] }} key={pack.id} onClick={() => navigate(`/worksheet-bundles/${pack.id}`)}>
              <span className="em">{['🧠', '📚', '🔬', '✏️'][index % 4]}</span>
              <span className="yr">{pack.grade_level || 'All levels'}</span>
              <h4>{pack.title}</h4>
              <small>{pack.subject || 'Mixed subjects'}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
