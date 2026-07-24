import { useEffect, useState } from 'react'
import { useRouter } from '../router/Router'
import { assignmentsData } from '../data/lmsData'
import { PageHero, EmptyState, TableSkeleton, StatusChip } from '../components/ui/UI'
import './pages.css'
import './lms.css'

const FILTERS = ['All', 'pending', 'submitted', 'graded', 'late']

export default function Assignments() {
  const { navigate } = useRouter()
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t) }, [])

  const list = filter === 'All' ? assignmentsData : assignmentsData.filter((a) => a.status === filter)

  return (
    <>
      <PageHero eyebrow="Stay on track" title="Assignments" subtitle="Track every assignment, due date and grade in one place." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="filters-bar">
            <div className="filter-group">
              {FILTERS.map((f) => (
                <button key={f} className={`filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f === 'All' ? 'All' : f[0].toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
          </div>

          {loading ? <TableSkeleton rows={6} /> : list.length === 0 ? (
            <EmptyState icon="🗒️" title="No assignments here" message="Nothing matches this filter yet." />
          ) : (
            <div className="assign-table">
              {list.map((a) => (
                <div className="assign-row" key={a.id}>
                  <div>
                    <div className="a-title">{a.title}</div>
                    <div className="a-sub">{a.subject}</div>
                  </div>
                  <div><span className="assign-meta-label">Due:</span>{a.due}</div>
                  <div><span className="assign-meta-label">Status:</span><StatusChip status={a.status} /></div>
                  <div><span className="assign-meta-label">Marks:</span>{a.marks !== null ? `${a.marks}/${a.total}` : '—'}</div>
                  <button className="btn btn-ghost" onClick={() => navigate(`/assignments/${a.id}`)}>Open</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
