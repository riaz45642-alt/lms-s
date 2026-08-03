import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import './Portal.css'

const empty = { title: '', subject: '', grade_level: '', description: '', default_total_marks: '', is_published: true }

export default function AdminWorksheets() {
  const { api } = useApp()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [file, setFile] = useState(null)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = async () => { try { const { data } = await api.get('/worksheets'); setItems(data.data || []) } catch (e) { setError(errorMessage(e)) } }
  useEffect(() => { load() }, [])

  const submit = async (event) => {
    event.preventDefault(); setError('')
    const body = new FormData()
    Object.entries(form).forEach(([key, value]) => body.append(key, value === true ? '1' : value === false ? '0' : value))
    if (file) body.append('file', file)
    try {
      if (editing) { body.append('_method', 'PATCH'); await api.post(`/worksheets/${editing}`, body) }
      else await api.post('/worksheets', body)
      setForm(empty); setFile(null); setEditing(null); await load()
    } catch (e) { setError(errorMessage(e)) }
  }

  const edit = (worksheet) => { setEditing(worksheet.id); setForm({ title: worksheet.title, subject: worksheet.subject, grade_level: worksheet.grade_level, description: worksheet.description || '', default_total_marks: worksheet.default_total_marks || '', is_published: worksheet.is_published }); window.scrollTo(0, 0) }
  const remove = async (id) => { if (!confirm('Delete this worksheet?')) return; try { await api.delete(`/worksheets/${id}`); await load() } catch (e) { setError(errorMessage(e)) } }

  return <main className="portal"><span className="eyebrow">Admin only</span><h1>Worksheet management</h1>{error && <div className="portal-error">{error}</div>}
    <form className="worksheet-form" onSubmit={submit}>
      <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
      <input placeholder="Grade level" value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} required />
      <input type="number" step="0.01" min="0.01" placeholder="Total marks" value={form.default_total_marks} onChange={(e) => setForm({ ...form, default_total_marks: e.target.value })} />
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <label><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Published</label>
      <label>{editing ? 'Replacement file (optional)' : 'Worksheet file'}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files[0])} required={!editing} /></label>
      <button className="btn btn-primary">{editing ? 'Update worksheet' : 'Create worksheet'}</button>
    </form>
    <section className="portal-section"><h2>Worksheets</h2>{items.map((item) => <article className="assignment-row" key={item.id}><div><h3>{item.title}</h3><p>{item.subject} · {item.grade_level} · {item.is_published ? 'Published' : 'Draft'}</p></div><div className="portal-actions"><button className="btn btn-ghost" onClick={() => edit(item)}>Edit</button><button className="btn btn-ghost" onClick={() => remove(item.id)}>Delete</button></div></article>)}</section>
  </main>
}
