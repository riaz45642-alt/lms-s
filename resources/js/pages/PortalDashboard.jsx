import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import { Link } from '../router/Router'
import './Portal.css'

export default function PortalDashboard() {
  const { user, api } = useApp()
  const [dashboard, setDashboard] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [reports, setReports] = useState([])
  const [students, setStudents] = useState([])
  const [worksheets, setWorksheets] = useState([])
  const [assignmentForm, setAssignmentForm] = useState({ student_id: '', worksheet_id: '', due_at: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [dash, assignmentList, reportList] = await Promise.all([
        api.get('/dashboard'), api.get('/assignments'), api.get('/performance-reports'),
      ])
      setDashboard(dash.data)
      setAssignments(assignmentList.data.data || [])
      setReports(reportList.data.data || [])
      if (user.role === 'admin' || user.role === 'parent') {
        const [studentList, worksheetList] = await Promise.all([api.get('/students'), api.get('/worksheets')])
        setStudents(studentList.data || [])
        setWorksheets(worksheetList.data.data || [])
      }
    } catch (requestError) { setError(errorMessage(requestError)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submitWork = async (assignment, file) => {
    if (!file) return
    const body = new FormData(); body.append('file', file)
    try { await api.post(`/assignments/${assignment.id}/submission`, body); await load() }
    catch (requestError) { setError(errorMessage(requestError)) }
  }

  const review = async (assignment, event) => {
    event.preventDefault()
    const submissionId = assignment.submission?.id
    if (!submissionId) return
    const body = Object.fromEntries(new FormData(event.currentTarget))
    body.status = 'checked'
    try { await api.post(`/submissions/${submissionId}/review`, body); await load() }
    catch (requestError) { setError(errorMessage(requestError)) }
  }

  const createAssignment = async (event) => {
    event.preventDefault()
    const payload = { ...assignmentForm }
    if (!payload.due_at) delete payload.due_at
    try { await api.post('/assignments', payload); setAssignmentForm({ student_id: '', worksheet_id: '', due_at: '' }); await load() }
    catch (requestError) { setError(errorMessage(requestError)) }
  }

  if (loading) return <main className="portal"><p>Loading your dashboard...</p></main>

  return <main className="portal">
    <div className="portal-head">
      <div><span className="eyebrow">{dashboard?.role} portal</span><h1>Welcome, {user.name}</h1></div>
      <div className="portal-actions"><Link className="btn btn-ghost" to="/profile">Profile</Link>{dashboard?.role === 'admin' && <Link className="btn btn-primary" to="/admin/worksheets">Manage worksheets</Link>}</div>
    </div>
    {error && <div className="portal-error" role="alert">{error}</div>}
    <section className="portal-stats">{Object.entries(dashboard?.counts || {}).map(([name, value]) => <article key={name}><strong>{value}</strong><span>{name.replaceAll('_', ' ')}</span></article>)}</section>

    {(dashboard?.role === 'admin' || dashboard?.role === 'parent') && <section className="portal-section"><h2>Assign a worksheet</h2><form className="review-form" onSubmit={createAssignment}>
      <select value={assignmentForm.student_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, student_id: e.target.value })} required><option value="">Choose student</option>{students.map((student) => <option key={student.id} value={student.id}>{student.user?.name}</option>)}</select>
      <select value={assignmentForm.worksheet_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, worksheet_id: e.target.value })} required><option value="">Choose worksheet</option>{worksheets.map((worksheet) => <option key={worksheet.id} value={worksheet.id}>{worksheet.title}</option>)}</select>
      <input type="datetime-local" value={assignmentForm.due_at} onChange={(e) => setAssignmentForm({ ...assignmentForm, due_at: e.target.value })} />
      <button className="btn btn-primary">Assign</button>
    </form></section>}

    <section className="portal-section">
      <h2>Assigned worksheets</h2>
      {!assignments.length && <p>No assignments are available.</p>}
      {assignments.map((assignment) => <article className="assignment-row" key={assignment.id}>
        <div><h3>{assignment.worksheet?.title}</h3><p>{assignment.student?.user?.name} · {assignment.status}{assignment.due_at ? ` · due ${new Date(assignment.due_at).toLocaleDateString()}` : ''}</p></div>
        {(dashboard.role === 'student' || dashboard.role === 'parent') && assignment.status !== 'checked' && <label className="upload-control">Submit completed work<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => submitWork(assignment, e.target.files[0])} /></label>}
        {dashboard.role === 'teacher' && assignment.submission && assignment.status !== 'checked' && <form className="review-form" onSubmit={(e) => review(assignment, e)}>
          <input name="obtained_marks" type="number" min="0" step="0.01" placeholder="Marks" required />
          <input name="total_marks" type="number" min="0.01" step="0.01" placeholder="Total" required />
          <input name="remarks" placeholder="Remarks" />
          <button className="btn btn-primary">Submit evaluation</button>
        </form>}
        {assignment.submission?.review && <p className="evaluation"><strong>{assignment.submission.review.obtained_marks}/{assignment.submission.review.total_marks}</strong> — {assignment.submission.review.remarks || 'Reviewed'}</p>}
      </article>)}
    </section>

    <section className="portal-section"><h2>Performance reports</h2>{reports.length ? reports.map((report) => <article className="report-row" key={report.id}><strong>{report.overall_grade}</strong><span>{report.progress}% · {report.teacher_comment || 'No teacher comment'}</span></article>) : <p>No performance reports yet.</p>}</section>
  </main>
}
