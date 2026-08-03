import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import './Portal.css'

const SUBJECTS = ['Maths', 'English', 'Science', 'Geography', 'History', 'Art', 'Computing']
const GRADES = ['Early Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6']
const EMPTY = { title: '', subject: '', grade_level: '', description: '', instructions: '', default_total_marks: '', default_due_days: '', is_published: true }

export default function AdminWorksheets() {
  const { api } = useApp()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => { try { const { data } = await api.get('/worksheets'); setItems(data.data || []) } catch (e) { setError(errorMessage(e)) } }
  useEffect(() => { load() }, [])

  const submit = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setSaving(true)
    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => { if (value !== '') body.append(key, value === true ? '1' : value === false ? '0' : value) })
    if (file) body.append('file', file)
    try {
      if (editing) { body.append('_method', 'PATCH'); await api.post(`/worksheets/${editing}`, body) } else await api.post('/worksheets', body)
      setNotice(editing ? 'Worksheet updated.' : 'Worksheet uploaded.'); setForm(EMPTY); setFile(null); setEditing(null); await load()
    } catch (e) { setError(errorMessage(e)) } finally { setSaving(false) }
  }

  const edit = (worksheet) => {
    setEditing(worksheet.id)
    setForm({ title: worksheet.title, subject: worksheet.subject, grade_level: worksheet.grade_level, description: worksheet.description || '', instructions: worksheet.instructions || '', default_total_marks: worksheet.default_total_marks || '', default_due_days: worksheet.default_due_days || '', is_published: worksheet.is_published })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const remove = async (id) => { if (!confirm('Delete this worksheet? This cannot be undone.')) return; try { await api.delete(`/worksheets/${id}`); setNotice('Worksheet deleted.'); await load() } catch (e) { setError(errorMessage(e)) } }

  return <main className="portal">
    <div className="portal-head"><div><span className="eyebrow">Admin panel</span><h1>Worksheet library</h1><p>Create and maintain the learning resources used across the LMS.</p></div></div>
    {error && <div className="portal-error">{error}</div>}{notice && <div className="portal-notice">{notice}</div>}
    <form className="worksheet-form" onSubmit={submit}>
      <h2>{editing ? 'Edit worksheet' : 'Upload a new worksheet'}</h2>
      <label>Title<input placeholder="e.g. Fractions Practice" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
      <label>Subject<select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required><option value="">Select subject</option>{SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
      <label>Class / grade<select value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} required><option value="">Select grade</option>{GRADES.map((grade) => <option key={grade}>{grade}</option>)}</select></label>
      <label>Total marks<input type="number" step="0.01" min="0.01" placeholder="Optional" value={form.default_total_marks} onChange={(e) => setForm({ ...form, default_total_marks: e.target.value })} /></label>
      <label>Default due period (days)<input type="number" min="1" max="365" placeholder="Optional" value={form.default_due_days} onChange={(e) => setForm({ ...form, default_due_days: e.target.value })} /></label>
      <label className="wide">Description<textarea placeholder="What this worksheet covers" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className="wide">Instructions<textarea placeholder="Instructions shown to learners" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></label>
      <label className="check"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published and available for assignment</label>
      <label className="file-field">{editing ? 'Replacement file (optional)' : 'Worksheet file'}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files[0])} required={!editing} /><small>PDF, JPG, PNG or WebP · maximum 20 MB</small></label>
      <div className="form-actions"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update worksheet' : 'Upload worksheet'}</button>{editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(EMPTY); setFile(null) }}>Cancel</button>}</div>
    </form>
    <section className="portal-section"><div className="section-title"><div><h2>All uploaded worksheets</h2><p>{items.length} resource{items.length === 1 ? '' : 's'} in the library</p></div></div>{items.map((item) => <article className="assignment-row" key={item.id}><div><span className={`status ${item.is_published ? 'status-checked' : 'status-assigned'}`}>{item.is_published ? 'Published' : 'Draft'}</span><h3>{item.title}</h3><p>{item.subject} · {item.grade_level}{item.default_due_days ? ` · ${item.default_due_days} day default` : ''}</p></div><div className="portal-actions"><button className="btn btn-ghost" onClick={() => edit(item)}>Edit</button><button className="btn btn-danger" onClick={() => remove(item.id)}>Delete</button></div></article>)}</section>
  </main>
}
