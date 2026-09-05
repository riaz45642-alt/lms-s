import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useRouter } from '../router/Router'
import { errorMessage } from '../services/api'
import './AcademicManagement.css'

const currentAcademicYear = () => {
  const year = new Date().getFullYear()
  return `${year}/${year + 1}`
}

function Dialog({ title, onClose, children }) {
  useEffect(() => {
    const escape = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [onClose])
  return <div className="academic-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="academic-dialog" role="dialog" aria-modal="true" aria-labelledby="academic-dialog-title">
      <header><h2 id="academic-dialog-title">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog">×</button></header>
      {children}
    </section>
  </div>
}

function Notice({ type, children, onClose }) {
  return <div className={`academic-notice ${type}`} role={type === 'error' ? 'alert' : 'status'}><span>{children}</span><button type="button" onClick={onClose} aria-label="Dismiss message">×</button></div>
}

function LoadingCards() {
  return <div className="academic-skeleton" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div key={index}><span/><span/><span/></div>)}</div>
}

export default function AcademicManagement({ section }) {
  const { api, user } = useApp()
  const { navigate } = useRouter()
  const isAdmin = user?.role === 'admin'
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [details, setDetails] = useState(null)
  const [assignClass, setAssignClass] = useState(null)

  useEffect(() => { setPage(1); setQuery(''); setDetails(null); setCreateOpen(false); setAssignClass(null) }, [section])
  useEffect(() => {
    let active = true
    setLoading(true); setError('')
    api.get(section === 'classes' ? `/classes?page=${page}` : '/subjects')
      .then(({ data }) => {
        if (!active) return
        if (section === 'classes') {
          setItems(data.data || [])
          setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total, from: data.from || 0, to: data.to || 0 })
        } else {
          setItems(Array.isArray(data) ? data : [])
          setMeta({ current_page: 1, last_page: 1, total: data.length || 0, from: data.length ? 1 : 0, to: data.length || 0 })
        }
      })
      .catch((requestError) => active && setError(errorMessage(requestError)))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [api, page, refresh, section])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => [item.name, item.code, item.grade_level, item.academic_year, item.description, item.homeroom_teacher?.user?.name].some((value) => String(value || '').toLowerCase().includes(term)))
  }, [items, query])
  const changed = (message) => { setSuccess(message); setCreateOpen(false); setAssignClass(null); setRefresh((value) => value + 1) }

  return <main className="academic-management">
    <section className="academic-hero">
      <div><span className="academic-eyebrow">Academic administration</span><h1>{section === 'classes' ? 'Classes' : 'Subjects'}</h1><p>{section === 'classes' ? 'Organize learners into clear class groups and keep each roster easy to review.' : 'Maintain the subject catalogue used across the EduSphere learning experience.'}</p></div>
      <div className="academic-hero-mark" aria-hidden="true">{section === 'classes' ? '🏫' : '📚'}</div>
    </section>

    <nav className="academic-tabs" aria-label="Academic management sections"><button className={section === 'classes' ? 'active' : ''} onClick={() => navigate('/classes')}>Classes</button><button className={section === 'subjects' ? 'active' : ''} onClick={() => navigate('/subjects')}>Subjects</button></nav>
    {success && <Notice type="success" onClose={() => setSuccess('')}>{success}</Notice>}
    {error && <Notice type="error" onClose={() => setError('')}>{error}</Notice>}

    <section className="academic-toolbar">
      <label><span aria-hidden="true">⌕</span><span className="sr-only">Search {section}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${section}…`}/></label>
      <div className="academic-count"><strong>{section === 'classes' ? meta.total : visible.length}</strong><span>{section === 'classes' ? 'classes' : 'subjects'}</span></div>
      {isAdmin && <button className="academic-primary" type="button" onClick={() => setCreateOpen(true)}>＋ Add {section === 'classes' ? 'class' : 'subject'}</button>}
    </section>

    {loading ? <LoadingCards/> : visible.length ? <section className="academic-grid">
      {section === 'classes' ? visible.map((item) => <ClassCard key={item.id} item={item} isAdmin={isAdmin} onView={() => setDetails(item)} onAssign={() => setAssignClass(item)}/>) : visible.map((item, index) => <SubjectCard key={item.id} item={item} index={index} onView={() => setDetails(item)}/>)}
    </section> : <section className="academic-empty"><span>{section === 'classes' ? '🏫' : '📖'}</span><h2>No {section} found</h2><p>{query ? 'Try a different search term.' : `Create the first ${section === 'classes' ? 'class' : 'subject'} to get started.`}</p>{query && <button onClick={() => setQuery('')}>Clear search</button>}</section>}

    {section === 'classes' && !loading && meta.last_page > 1 && <nav className="academic-pagination" aria-label="Classes pagination"><p>Showing {meta.from}–{meta.to} of {meta.total}</p><div><button disabled={meta.current_page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {meta.current_page} of {meta.last_page}</span><button disabled={meta.current_page === meta.last_page} onClick={() => setPage((value) => value + 1)}>Next</button></div></nav>}

    {createOpen && (section === 'classes' ? <ClassForm api={api} onClose={() => setCreateOpen(false)} onCreated={() => changed('Class created successfully.')}/> : <SubjectForm api={api} onClose={() => setCreateOpen(false)} onCreated={() => changed('Subject created successfully.')}/>)}
    {details && <DetailsDialog section={section} item={details} onClose={() => setDetails(null)} isAdmin={isAdmin} onAssign={() => { setAssignClass(details); setDetails(null) }}/>} 
    {assignClass && <AssignStudentDialog api={api} classItem={assignClass} onClose={() => setAssignClass(null)} onAssigned={() => changed('Student assigned to the class successfully.')}/>} 
  </main>
}

function ClassCard({ item, isAdmin, onView, onAssign }) {
  return <article className="academic-card class-card"><div className="academic-card-icon" aria-hidden="true">{item.code?.slice(0, 2).toUpperCase() || 'CL'}</div><div className="academic-card-body"><div className="academic-card-top"><span>{item.grade_level}</span><span className={`academic-state ${item.is_active === false ? 'inactive' : ''}`}>{item.is_active === false ? 'Inactive' : 'Active'}</span></div><h2>{item.name}</h2><p className="academic-code">{item.code} · {item.academic_year}</p><dl><div><dt>Students</dt><dd>{item.students?.length || 0}</dd></div><div><dt>Subjects</dt><dd>{item.subjects?.length || 0}</dd></div></dl><p className="academic-teacher">Homeroom: <strong>{item.homeroom_teacher?.user?.name || 'Not assigned'}</strong></p><footer><button onClick={onView}>View details</button>{isAdmin && <button className="secondary" onClick={onAssign}>Assign student</button>}</footer></div></article>
}

function SubjectCard({ item, index, onView }) {
  const icons = ['∑', 'Aa', '⚗', '◎', '⌛', '✦']
  return <article className="academic-card subject-card"><div className="subject-symbol" aria-hidden="true">{icons[index % icons.length]}</div><div className="academic-card-body"><div className="academic-card-top"><span>{item.code}</span><span className={`academic-state ${item.is_active === false ? 'inactive' : ''}`}>{item.is_active === false ? 'Inactive' : 'Active'}</span></div><h2>{item.name}</h2><p>{item.description || 'No description has been added for this subject yet.'}</p><footer><button onClick={onView}>View details</button></footer></div></article>
}

function ClassForm({ api, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', code: '', grade_level: '', academic_year: currentAcademicYear(), homeroom_teacher_id: '' })
  const [teachers, setTeachers] = useState([]), [busy, setBusy] = useState(false), [error, setError] = useState('')
  useEffect(() => { let active = true; api.get('/admin/users?role=teacher').then(({ data }) => active && setTeachers(data.data || [])).catch(() => {}); return () => { active = false } }, [api])
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { const payload = { ...form }; if (!payload.homeroom_teacher_id) delete payload.homeroom_teacher_id; await api.post('/classes', payload); onCreated() } catch (requestError) { setError(errorMessage(requestError)) } finally { setBusy(false) } }
  return <Dialog title="Add a new class" onClose={onClose}><form className="academic-form" onSubmit={submit}>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-grid"><label>Class name<input required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Year 4 Explorers"/></label><label>Class code<input required maxLength="50" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="e.g. Y4-EXP"/></label><label>Grade level<input required maxLength="50" value={form.grade_level} onChange={(event) => setForm({ ...form, grade_level: event.target.value })} placeholder="e.g. Year 4"/></label><label>Academic year<input required maxLength="20" value={form.academic_year} onChange={(event) => setForm({ ...form, academic_year: event.target.value })}/></label><label className="wide">Homeroom teacher <span>(optional)</span><select value={form.homeroom_teacher_id} onChange={(event) => setForm({ ...form, homeroom_teacher_id: event.target.value })}><option value="">Not assigned</option>{teachers.map((teacher) => teacher.teacher_profile && <option key={teacher.id} value={teacher.teacher_profile.id}>{teacher.name}</option>)}</select></label></div><div className="form-actions"><button type="button" onClick={onClose}>Cancel</button><button className="save" disabled={busy}>{busy ? 'Creating…' : 'Create class'}</button></div></form></Dialog>
}

function SubjectForm({ api, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', code: '', description: '' }), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { await api.post('/subjects', form); onCreated() } catch (requestError) { setError(errorMessage(requestError)) } finally { setBusy(false) } }
  return <Dialog title="Add a new subject" onClose={onClose}><form className="academic-form" onSubmit={submit}>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-grid"><label>Subject name<input required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Mathematics"/></label><label>Subject code<input required maxLength="50" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="e.g. MATH"/></label><label className="wide">Description <span>(optional)</span><textarea maxLength="2000" rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What learners study in this subject…"/></label></div><div className="form-actions"><button type="button" onClick={onClose}>Cancel</button><button className="save" disabled={busy}>{busy ? 'Creating…' : 'Create subject'}</button></div></form></Dialog>
}

function DetailsDialog({ section, item, onClose, isAdmin, onAssign }) {
  return <Dialog title={`${section === 'classes' ? 'Class' : 'Subject'} details`} onClose={onClose}><div className="academic-details"><span className="details-badge">{item.code}</span><h3>{item.name}</h3>{section === 'classes' ? <><dl><div><dt>Grade level</dt><dd>{item.grade_level}</dd></div><div><dt>Academic year</dt><dd>{item.academic_year}</dd></div><div><dt>Homeroom teacher</dt><dd>{item.homeroom_teacher?.user?.name || 'Not assigned'}</dd></div><div><dt>Status</dt><dd>{item.is_active === false ? 'Inactive' : 'Active'}</dd></div></dl><section><div className="details-section-title"><h4>Class roster</h4>{isAdmin && <button onClick={onAssign}>＋ Assign student</button>}</div>{item.students?.length ? <ul className="roster-list">{item.students.map((student) => <li key={student.id}><span>{student.user?.name?.charAt(0) || 'S'}</span><strong>{student.user?.name || `Student ${student.id}`}</strong></li>)}</ul> : <p className="details-empty">No students assigned yet.</p>}</section><section><h4>Subjects</h4>{item.subjects?.length ? <div className="subject-chips">{item.subjects.map((subject) => <span key={subject.id}>{subject.name}</span>)}</div> : <p className="details-empty">No subjects linked yet.</p>}</section></> : <><p className="subject-description">{item.description || 'No description has been added.'}</p><dl><div><dt>Subject code</dt><dd>{item.code}</dd></div><div><dt>Status</dt><dd>{item.is_active === false ? 'Inactive' : 'Active'}</dd></div></dl></>}</div></Dialog>
}

function AssignStudentDialog({ api, classItem, onClose, onAssigned }) {
  const [students, setStudents] = useState([]), [studentId, setStudentId] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState('')
  useEffect(() => { let active = true; api.get('/students').then(({ data }) => active && setStudents(data)).catch((requestError) => active && setError(errorMessage(requestError))).finally(() => active && setLoading(false)); return () => { active = false } }, [api])
  const available = students.filter((student) => student.class_id !== classItem.id)
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { await api.post(`/classes/${classItem.id}/students`, { student_id: Number(studentId) }); onAssigned() } catch (requestError) { setError(errorMessage(requestError)) } finally { setBusy(false) } }
  return <Dialog title={`Assign student to ${classItem.name}`} onClose={onClose}><form className="academic-form" onSubmit={submit}>{error && <p className="form-error" role="alert">{error}</p>}{loading ? <p role="status">Loading students…</p> : available.length ? <label>Select student<select required value={studentId} onChange={(event) => setStudentId(event.target.value)}><option value="">Choose a student</option>{available.map((student) => <option value={student.id} key={student.id}>{student.user?.name} — {student.grade_level || 'Grade not set'}{student.class_id ? ' (move from another class)' : ''}</option>)}</select><small>Assigning a student who already has a class will move them to this class.</small></label> : <p>No other students are available to assign.</p>}<div className="form-actions"><button type="button" onClick={onClose}>Cancel</button><button className="save" disabled={busy || loading || !studentId}>{busy ? 'Assigning…' : 'Assign student'}</button></div></form></Dialog>
}
