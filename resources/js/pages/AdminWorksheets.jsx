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
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [creatorFilter, setCreatorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
  const [creators, setCreators] = useState([])

  const load = async () => { setLoading(true); try { const params = new URLSearchParams({ page }); if(query)params.set('q',query);if(subjectFilter)params.set('subject',subjectFilter);if(statusFilter)params.set('status',statusFilter);if(creatorFilter)params.set('creator_id',creatorFilter);if(dateFrom)params.set('date_from',dateFrom); const { data } = await api.get(`/worksheets?${params}`); setItems(data.data || []); setMeta({current_page:data.current_page,last_page:data.last_page,total:data.total,from:data.from||0,to:data.to||0}) } catch (e) { setError(errorMessage(e)) } finally { setLoading(false) } }
  useEffect(() => { const timer=setTimeout(load,300);return()=>clearTimeout(timer) }, [page,query,subjectFilter,statusFilter,creatorFilter,dateFrom])
  useEffect(()=>{api.get('/admin/users?role=admin').then(({data})=>setCreators(data.data||[])).catch(()=>{})},[api])

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
  const download = async (item) => { try { const response=await api.get(`/worksheets/${item.id}/download`,{responseType:'blob'});const url=URL.createObjectURL(response.data);const a=document.createElement('a');a.href=url;a.download=item.original_filename;a.click();URL.revokeObjectURL(url) } catch(e){setError(errorMessage(e))} }

  return <main className="portal">
    <div className="portal-head"><div><span className="eyebrow">Admin panel</span><h1>Worksheet library</h1><p>Create and maintain the learning resources used across the LMS.</p></div></div>
    {error && <div className="portal-error">{error}</div>}{notice && <div className="portal-notice">{notice}</div>}
    <section className="worksheet-admin-filters"><label>Search<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Title, description or subject"/></label><label>Subject<select value={subjectFilter} onChange={e=>{setSubjectFilter(e.target.value);setPage(1)}}><option value="">All subjects</option>{SUBJECTS.map(x=><option key={x}>{x}</option>)}</select></label><label>Status<select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}}><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></label><label>Creator<select value={creatorFilter} onChange={e=>{setCreatorFilter(e.target.value);setPage(1)}}><option value="">All creators</option>{creators.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label>Uploaded after<input type="date" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1)}}/></label></section>
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
    <section className="portal-section"><div className="section-title"><div><h2>All uploaded worksheets</h2><p>{meta.total} resource{meta.total === 1 ? '' : 's'} in the library</p></div></div>{loading?<div className="portal-loading">Loading worksheets…</div>:items.length?items.map((item) => <article className="assignment-row" key={item.id}><div><span className={`status ${item.is_published ? 'status-checked' : 'status-assigned'}`}>{item.is_published ? 'Published' : 'Draft'}</span><h3>{item.title}</h3><p>{item.subject} · {item.grade_level} · {item.creator?.name || 'Admin'} · uploaded {new Date(item.created_at).toLocaleDateString()}{item.default_due_days ? ` · ${item.default_due_days} day default` : ''}</p></div><div className="portal-actions"><button className="btn btn-ghost" onClick={() => download(item)}>Download</button><button className="btn btn-ghost" onClick={() => edit(item)}>Edit</button><button className="btn btn-danger" onClick={() => remove(item.id)}>Delete</button></div></article>):<div className="empty-portal">No worksheets match these filters.</div>} {meta.last_page>1&&<nav className="worksheet-pager"><button disabled={page===1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {meta.current_page} of {meta.last_page}</span><button disabled={page===meta.last_page} onClick={()=>setPage(page+1)}>Next</button></nav>}</section>
  </main>
}
