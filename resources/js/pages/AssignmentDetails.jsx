import { useState } from 'react'
import { useRouter, Link } from '../router/Router'
import { assignmentsData } from '../data/lmsData'
import { EmptyState, StatusChip } from '../components/ui/UI'
import './pages.css'
import './lms.css'

export default function AssignmentDetails({ assignmentId }) {
  const { navigate } = useRouter()
  const assignment = assignmentsData.find((a) => a.id === assignmentId)
  const [uploaded, setUploaded] = useState(false)

  if (!assignment) {
    return <div className="page-section"><div className="wrap"><EmptyState icon="🗒️" title="Assignment not found" actionLabel="Back to assignments" onAction={() => navigate('/assignments')} /></div></div>
  }

  return (
    <div className="page-section">
      <div className="wrap">
        <div className="breadcrumb"><Link to="/assignments">Assignments</Link> / {assignment.title}</div>

        <div className="detail-layout">
          <div className="detail-info" style={{ gridColumn: '1 / -1', maxWidth: 720 }}>
            <StatusChip status={uploaded ? 'submitted' : assignment.status} />
            <h1 style={{ marginTop: 12 }}>{assignment.title}</h1>
            <div className="meta-row">
              <span className="meta-pill">{assignment.subject}</span>
              <span className="meta-pill">Due {assignment.due}</span>
              <span className="meta-pill">{assignment.total} marks</span>
            </div>
            <p className="desc">{assignment.instructions}</p>

            {assignment.attachments.length > 0 && (
              <>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Attachments</h3>
                {assignment.attachments.map((f) => (
                  <div key={f} className="resource-item">
                    <span className="res-em">📎</span>
                    <span className="name">{f}</span>
                    <button className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>Download</button>
                  </div>
                ))}
              </>
            )}

            <h3 style={{ fontSize: 16, margin: '24px 0 12px' }}>Your submission</h3>
            {uploaded ? (
              <div className="save-toast">✓ Assignment submitted — awaiting grading</div>
            ) : assignment.marks !== null ? (
              <div className="dash-card">
                <p style={{ fontWeight: 700 }}>Marks: {assignment.marks}/{assignment.total}</p>
              </div>
            ) : (
              <div className="dash-card" style={{ textAlign: 'center', border: '1.5px dashed var(--line)', boxShadow: 'none' }}>
                <p style={{ color: 'var(--muted)', marginBottom: 14 }}>Drag & drop a file here, or click to choose one (UI only — no upload occurs)</p>
                <button className="btn btn-primary" onClick={() => setUploaded(true)}>Upload assignment</button>
              </div>
            )}

            <div className="detail-cta" style={{ marginTop: 22 }}>
              <button className="btn btn-ghost" onClick={() => navigate('/assignments')}>Back to assignments</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
