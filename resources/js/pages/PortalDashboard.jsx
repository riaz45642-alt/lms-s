import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import { Link } from '../router/Router'
import './Portal.css'
import { emitCompanionReaction } from '../components/characters/companionEvents'

const statusLabel = (assignment) => {
  if (assignment.status === 'assigned' && assignment.due_at && new Date(assignment.due_at) < new Date()) return 'overdue'
  return assignment.status
}

const countIcon = (name) => ({
  assignments: '↗', submissions: '✓', students: '◎', worksheets: '□',
  reports: '✦', teachers: '△', parents: '○', users: '◇',
}[name] || '✦')

export default function PortalDashboard() {
  const { user, api } = useApp()
  const [dashboard, setDashboard] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [reports, setReports] = useState([])
  const [students, setStudents] = useState([])
  const [worksheets, setWorksheets] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('all')
  const [progress, setProgress] = useState(null)
  const [assignmentForm, setAssignmentForm] = useState({ student_id: '', worksheet_id: '', due_at: '', instructions: '', allow_resubmission: false, allow_late_submission: false })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [dash, assignmentList, reportList] = await Promise.all([api.get('/dashboard'), api.get('/assignments'), api.get('/performance-reports')])
      setDashboard(dash.data); setAssignments(assignmentList.data.data || []); setReports(reportList.data.data || [])
      if (['admin', 'parent', 'teacher'].includes(user.role)) {
        const { data } = await api.get('/students'); setStudents(data || [])
      }
      if (['admin', 'parent'].includes(user.role)) {
        const { data } = await api.get('/worksheets'); setWorksheets(data.data || [])
      }
    } catch (requestError) { setError(errorMessage(requestError)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (selectedStudent === 'all') { setProgress(null); return }
    api.get(`/students/${selectedStudent}/progress`).then(({ data }) => setProgress(data)).catch((e) => setError(errorMessage(e)))
  }, [selectedStudent])

  const visibleAssignments = useMemo(() => selectedStudent === 'all' ? assignments : assignments.filter((item) => String(item.student_id) === String(selectedStudent)), [assignments, selectedStudent])
  const portalLinks = [
    ['/courses','Courses'], ['/workbooks','Workbooks'], ['/activities','Activities'], ['/worksheet-bundles','Bundles'],
    ['/search','Search'], ['/messages','Messages'], ['/notifications','Notifications'], ['/calendar','Calendar'],
    ['/certificates','Certificates'], ['/bookmarks','Saved'], ['/billing','Plans'],
    ...(['admin','teacher'].includes(user.role) ? [['/classes','Classes']] : []),
    ...(user.role === 'admin' ? [['/users','People & roles'],['/subjects','Subjects']] : []),
  ]

  const download = async (url, filename) => {
    try {
      const response = await api.get(url, { responseType: 'blob' })
      const href = URL.createObjectURL(response.data); const anchor = document.createElement('a')
      anchor.href = href; anchor.download = filename; anchor.click(); URL.revokeObjectURL(href)
    } catch (requestError) { setError(errorMessage(requestError)) }
  }

  const submitWork = async (assignment, file) => {
    if (!file) return
    const body = new FormData(); body.append('file', file)
    try { await api.post(`/assignments/${assignment.id}/submission`, body); setNotice('Completed worksheet submitted successfully.'); emitCompanionReaction('celebration', 'Your work is submitted—great job!', 1450); await load() }
    catch (requestError) { setError(errorMessage(requestError)) }
  }

  const review = async (assignment, event) => {
    event.preventDefault(); const submissionId = assignment.submission?.id
    const body = Object.fromEntries(new FormData(event.currentTarget)); body.status = 'checked'
    try { await api.post(`/submissions/${submissionId}/review`, body); setNotice('Final evaluation saved.'); emitCompanionReaction('success', 'Review saved—nicely done!', 1200); await load() }
    catch (requestError) { setError(errorMessage(requestError)) }
  }

  const createAssignment = async (event) => {
    event.preventDefault(); const payload = { ...assignmentForm }
    if (!payload.due_at) delete payload.due_at
    payload.allow_resubmission = Boolean(payload.allow_resubmission); payload.allow_late_submission = Boolean(payload.allow_late_submission)
    try {
      await api.post('/assignments', payload); setNotice('Worksheet assigned successfully.')
      setAssignmentForm({ student_id: '', worksheet_id: '', due_at: '', instructions: '', allow_resubmission: false, allow_late_submission: false }); await load()
    } catch (requestError) { setError(errorMessage(requestError)) }
  }

  if (loading) return <main className="portal"><div className="portal-loading">Loading your secure dashboard...</div></main>
  const role = dashboard?.role

  return <main className="portal">
    <nav className="portal-shortcuts" aria-label="Learning tools">{portalLinks.map(([to,label])=><Link key={to} to={to}>{label}</Link>)}</nav>
    <section className="portal-hero" data-companion-section="dashboard-overview">
      <div className="portal-hero-copy"><span className="eyebrow">{role} workspace</span><h1>{role === 'teacher' ? 'Guide every learner forward' : role === 'parent' ? 'See their learning grow' : role === 'student' ? 'Ready for your next win?' : 'Keep learning on track'}</h1><p>Welcome back, {user.name}. {role === 'student' ? 'Pick up where you left off.' : 'Everything important, in one clear view.'}</p><div className="portal-actions"><Link className="btn btn-ghost" to="/profile">My profile</Link>{role === 'admin' && <Link className="btn btn-primary" to="/admin/worksheets">Manage worksheets</Link>}</div></div>
      <div className="portal-hero-art" aria-hidden="true" />
    </section>
    {error && <div className="portal-error" role="alert">{error}<button onClick={() => setError('')}>×</button></div>}
    {notice && <div className="portal-notice" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    <section className="portal-stats">{Object.entries(dashboard?.counts || {}).map(([name, value]) => <article key={name}><i aria-hidden="true">{countIcon(name)}</i><div><strong>{value}</strong><span>{name.replaceAll('_', ' ')}</span></div></article>)}</section>

    {role === 'admin' && <section className="portal-section admin-callout"><div><h2>Worksheet administration</h2><p>Upload, edit, publish, replace, and remove learning resources in the dedicated management panel.</p></div><Link className="btn btn-primary" to="/admin/worksheets">Open Admin Panel</Link></section>}

    {role === 'parent' && <section className="portal-section"><h2>Assign a worksheet to a child</h2><form className="assignment-form" onSubmit={createAssignment}>
      <label>Child<select value={assignmentForm.student_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, student_id: e.target.value })} required><option value="">Choose a child</option>{students.map((student) => <option key={student.id} value={student.id}>{student.user?.name}</option>)}</select></label>
      <label>Worksheet<select value={assignmentForm.worksheet_id} onChange={(e) => setAssignmentForm({ ...assignmentForm, worksheet_id: e.target.value })} required><option value="">Choose a worksheet</option>{worksheets.map((worksheet) => <option key={worksheet.id} value={worksheet.id}>{worksheet.title} — {worksheet.grade_level}</option>)}</select></label>
      <label>Due date<input type="datetime-local" value={assignmentForm.due_at} onChange={(e) => setAssignmentForm({ ...assignmentForm, due_at: e.target.value })} /></label>
      <label className="wide">Instructions<textarea value={assignmentForm.instructions} onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })} /></label>
      <label className="check"><input type="checkbox" checked={assignmentForm.allow_resubmission} onChange={(e) => setAssignmentForm({ ...assignmentForm, allow_resubmission: e.target.checked })} /> Allow another attempt</label>
      <label className="check"><input type="checkbox" checked={assignmentForm.allow_late_submission} onChange={(e) => setAssignmentForm({ ...assignmentForm, allow_late_submission: e.target.checked })} /> Allow late submission</label>
      <button className="btn btn-primary">Assign worksheet</button>
    </form></section>}

    {['teacher', 'parent'].includes(role) && <section className="student-switch"><label>{role === 'teacher' ? 'Review a student' : 'Filter by child'}<select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}><option value="all">All students</option>{students.map((student) => <option value={student.id} key={student.id}>{student.user?.name}</option>)}</select></label>{progress && <div className="progress-summary"><strong>{progress.summary.average_progress}%</strong><span>average progress</span><span>{progress.summary.checked}/{progress.summary.assignments} checked</span></div>}</section>}

    {role !== 'admin' && <section className="portal-section"><div className="section-title"><div><h2>{role === 'teacher' ? 'Student submissions to review' : 'Assigned worksheets'}</h2><p>{role === 'teacher' ? 'Only work from students linked to your teacher profile appears here.' : 'Download work, submit answers, and follow evaluation status.'}</p></div></div>
      {!visibleAssignments.length && <div className="empty-portal">No assignments are available.</div>}
      {visibleAssignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} role={role} onDownload={download} onSubmit={submitWork} onReview={review} />)}
    </section>}

    {role !== 'admin' && <section className="portal-section"><h2>Performance reports</h2>{reports.length ? reports.map((report) => <article className="report-row" key={report.id}><span className="grade-badge">{report.overall_grade}</span><div><strong>{report.progress}% progress</strong><p>{report.teacher_comment || 'No teacher feedback provided.'}</p></div></article>) : <div className="empty-portal">No performance reports yet.</div>}</section>}
  </main>
}

function AssignmentCard({ assignment, role, onDownload, onSubmit, onReview }) {
  const latest = assignment.submission
  const attempts = assignment.submissions || []
  const overdue = assignment.due_at && new Date(assignment.due_at) < new Date()
  const canSubmit = ['student', 'parent'].includes(role) && (!latest || assignment.allow_resubmission) && (!overdue || assignment.allow_late_submission)

  return <article className="assignment-card">
    <div className="assignment-main"><div><span className={`status status-${statusLabel(assignment)}`}>{statusLabel(assignment)}</span><h3>{assignment.worksheet?.title}</h3><p className="muted">{assignment.student?.user?.name} · {assignment.worksheet?.subject} · {assignment.worksheet?.grade_level}</p>{assignment.instructions && <p>{assignment.instructions}</p>}<p className="deadline">{assignment.due_at ? `Due ${new Date(assignment.due_at).toLocaleString()}` : 'No deadline'}{assignment.allow_resubmission ? ' · Multiple attempts allowed' : ''}</p></div><button className="btn btn-ghost" onClick={() => onDownload(`/worksheets/${assignment.worksheet.id}/download`, assignment.worksheet.original_filename)}>Download worksheet</button></div>
    {canSubmit && <label className="upload-box"><span>{latest ? 'Upload another attempt' : 'Upload completed worksheet'}</span><input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => onSubmit(assignment, e.target.files[0])} /></label>}
    {['student', 'parent'].includes(role) && !canSubmit && !latest && overdue && <p className="blocked-note">The deadline has passed. Late submissions are not enabled.</p>}
    {role === 'teacher' && latest && assignment.status !== 'checked' && <div className="review-panel"><div className="submission-link"><strong>Attempt {latest.attempt_number}</strong><button className="link-button" onClick={() => onDownload(`/submissions/${latest.id}/download`, latest.original_filename)}>Open submitted file</button></div><form className="review-form" onSubmit={(event) => onReview(assignment, event)}><label>Marks<input name="obtained_marks" type="number" min="0" step="0.01" required /></label><label>Total marks<input name="total_marks" type="number" min="0.01" step="0.01" defaultValue={assignment.worksheet.default_total_marks || ''} required /></label><label className="wide">Remarks<textarea name="remarks" placeholder="Feedback visible to the student and parent" /></label><label className="wide">Progress comment<textarea name="teacher_comment" placeholder="Overall progress comment" /></label><button className="btn btn-primary">Submit final evaluation</button></form></div>}
    {!!attempts.length && <details className="attempt-history" open={role === 'teacher'}><summary>Submission history ({attempts.length})</summary>{attempts.map((attempt) => <div className="attempt-row" key={attempt.id}><div><strong>Attempt {attempt.attempt_number}</strong><span>{new Date(attempt.submitted_at).toLocaleString()} · uploaded by {attempt.uploader?.name}</span></div><button className="link-button" onClick={() => onDownload(`/submissions/${attempt.id}/download`, attempt.original_filename)}>Download</button>{attempt.review && <div className="attempt-result"><strong>{attempt.review.obtained_marks}/{attempt.review.total_marks} ({attempt.review.percentage}%)</strong><span>{attempt.review.remarks || 'No remarks'}</span></div>}</div>)}</details>}
  </article>
}
