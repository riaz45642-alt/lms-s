import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import './UserManagement.css'
import './UserManagementAdmin.css'

const ROLES = ['admin', 'teacher', 'parent', 'student']
const STATUSES = ['active', 'suspended', 'deleted']
const SUBSCRIPTION_STATUSES = ['active', 'pending', 'expired', 'cancelled', 'rejected']
const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)
const formatDate = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : 'Not available'

function Modal({ title, children, onClose, actions, busy = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape' && !busy) onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [busy, onClose])

  return <div className="user-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
      <header><h2 id="user-modal-title">{title}</h2><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose} disabled={busy}>×</button></header>
      <div className="user-modal-body">{children}</div>
      {actions && <footer>{actions}</footer>}
    </section>
  </div>
}

function UserSkeleton() {
  return <div className="users-skeleton" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div key={index}><span/><span/><span/></div>)}</div>
}

export default function UserManagement() {
  const { api, user: currentUser } = useApp()
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 })
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [subscriptionStatus, setSubscriptionStatus] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [editor, setEditor] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('q', search)
    if (role) params.set('role', role)
    if (status) params.set('status', status)
    if (subscriptionStatus) params.set('subscription_status', subscriptionStatus)
    params.set('sort', sort)
    setLoading(true); setError('')
    api.get(`/admin/users?${params}`, { signal: controller.signal })
      .then(({ data }) => {
        setUsers(data.data || [])
        setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total, from: data.from || 0, to: data.to || 0 })
      })
      .catch((requestError) => { if (requestError.code !== 'ERR_CANCELED') setError(errorMessage(requestError)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [api, page, refresh, role, search, sort, status, subscriptionStatus])

  const pages = useMemo(() => {
    const start = Math.max(1, Math.min(meta.current_page - 2, meta.last_page - 4))
    return Array.from({ length: Math.min(5, meta.last_page) }, (_, index) => start + index)
  }, [meta.current_page, meta.last_page])

  const resetFilters = () => { setSearchInput(''); setSearch(''); setRole(''); setStatus(''); setSubscriptionStatus(''); setSort('newest'); setPage(1) }
  const openDetails = async (member) => {
    setSelected(member); setError('')
    try { const { data } = await api.get(`/admin/users/${member.id}`); setSelected(data) } catch (requestError) { setError(errorMessage(requestError)) }
  }
  const requestRoleChange = (member, nextRole) => {
    if (nextRole === member.role) return
    setPendingAction({ type: 'role', member, nextRole })
  }
  const requestStatusChange = (member) => setPendingAction({ type: 'status', member, nextStatus: member.status === 'active' ? 'suspended' : 'active' })
  const performAction = async () => {
    if (!pendingAction) return
    const { type, member } = pendingAction
    const payload = type === 'role' ? { role: pendingAction.nextRole } : { status: pendingAction.nextStatus }
    setBusy(true); setError(''); setNotice('')
    try {
      if (type === 'delete') { await api.delete(`/admin/users/${member.id}`); setNotice(`${member.name} was deleted.`); setPendingAction(null); setRefresh((value) => value + 1); return }
      if (type === 'restore') { await api.post(`/admin/users/${member.id}/restore`); setNotice(`${member.name} was restored.`); setPendingAction(null); setRefresh((value) => value + 1); return }
      const { data } = await api.patch(`/admin/users/${member.id}`, payload)
      setUsers((items) => items.map((item) => item.id === data.id ? data : item))
      setSelected((item) => item?.id === data.id ? data : item)
      setNotice(type === 'role' ? `${data.name}'s role is now ${titleCase(data.role)}.` : `${data.name} has been ${data.status === 'active' ? 'reactivated' : 'suspended'}.`)
      setPendingAction(null)
      setRefresh((value) => value + 1)
    } catch (requestError) {
      setError(errorMessage(requestError))
      setPendingAction(null)
    } finally { setBusy(false) }
  }

  const hasFilters = Boolean(searchInput || role || status || subscriptionStatus || sort !== 'newest')
  return <main className="user-management">
    <section className="users-hero">
      <div><span className="users-eyebrow">Administration</span><h1>User &amp; Role Management</h1><p>Find accounts, review access, update roles, and keep the EduSphere community secure.</p><button className="add-user-button" onClick={() => setEditor({})}>＋ Add user</button></div>
      <div className="users-total" aria-label={`${meta.total} total users`}><strong>{meta.total}</strong><span>Total users</span></div>
    </section>

    {notice && <div className="users-alert success" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss success message">×</button></div>}
    {error && <div className="users-alert error" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error message">×</button></div>}

    <section className="users-toolbar" aria-label="User search and filters">
      <label className="users-search"><span aria-hidden="true">⌕</span><span className="sr-only">Search users by name or email</span><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name or email…"/></label>
      <label><span>Role</span><select value={role} onChange={(event) => { setRole(event.target.value); setPage(1) }}><option value="">All roles</option>{ROLES.map((item) => <option value={item} key={item}>{titleCase(item)}</option>)}</select></label>
      <label><span>Status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">All statuses</option>{STATUSES.map((item) => <option value={item} key={item}>{titleCase(item)}</option>)}</select></label>
      <label><span>Subscription</span><select value={subscriptionStatus} onChange={(event) => { setSubscriptionStatus(event.target.value); setPage(1) }}><option value="">All subscriptions</option>{SUBSCRIPTION_STATUSES.map((item) => <option value={item} key={item}>{titleCase(item)}</option>)}</select></label>
      <label><span>Sort</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name">Name</option><option value="email">Email</option></select></label>
      {hasFilters && <button className="clear-filters" type="button" onClick={resetFilters}>Clear filters</button>}
    </section>

    {loading ? <UserSkeleton/> : users.length ? <>
      <section className="users-table-wrap" aria-label="Users">
        <table className="users-table">
          <thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Subscription</th><th scope="col">Joined</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{users.map((member) => {
            const isSelf = member.id === currentUser?.id
            return <tr key={member.id}>
              <td data-label="User"><button className="user-identity" type="button" onClick={() => openDetails(member)}><span className="user-avatar" aria-hidden="true">{member.name?.charAt(0).toUpperCase()}</span><span><strong>#{member.id} · {member.name}</strong><small>{member.email}</small></span></button></td>
              <td data-label="Role">{member.deleted_at ? titleCase(member.role) : <select aria-label={`Role for ${member.name}`} value={member.role} disabled={isSelf} title={isSelf ? 'You cannot change your own admin role' : undefined} onChange={(event) => requestRoleChange(member, event.target.value)}>{ROLES.map((item) => <option value={item} key={item}>{titleCase(item)}</option>)}</select>}</td>
              <td data-label="Status"><span className={`status-pill ${member.deleted_at ? 'deleted' : member.status}`}>{member.deleted_at ? 'Deleted' : titleCase(member.status)}</span></td>
              <td data-label="Subscription">{member.current_subscription ? <span className={`status-pill ${member.current_subscription.status}`}>{titleCase(member.current_subscription.status)}</span> : <span className="muted">None</span>}</td>
              <td data-label="Joined">{formatDate(member.created_at)}</td>
              <td className="user-row-actions"><button type="button" className="view-user" onClick={() => openDetails(member)}>View</button>{member.deleted_at ? <button className="activate-user" onClick={() => setPendingAction({ type: 'restore', member })}>Restore</button> : <><button type="button" className="view-user" onClick={() => setEditor(member)}>Edit</button><button type="button" className={member.status === 'active' ? 'suspend-user' : 'activate-user'} disabled={isSelf && member.status === 'active'} title={isSelf ? 'You cannot suspend your own account' : undefined} onClick={() => requestStatusChange(member)}>{member.status === 'active' ? 'Suspend' : 'Reactivate'}</button><button type="button" className="suspend-user" disabled={isSelf} onClick={() => setPendingAction({ type: 'delete', member })}>Delete</button></>}</td>
            </tr>
          })}</tbody>
        </table>
      </section>
      <nav className="users-pagination" aria-label="User list pagination">
        <p>Showing <strong>{meta.from}–{meta.to}</strong> of <strong>{meta.total}</strong></p>
        <div><button type="button" onClick={() => setPage((value) => value - 1)} disabled={meta.current_page <= 1}>Previous</button>{pages.map((item) => <button type="button" key={item} className={item === meta.current_page ? 'active' : ''} aria-current={item === meta.current_page ? 'page' : undefined} onClick={() => setPage(item)}>{item}</button>)}<button type="button" onClick={() => setPage((value) => value + 1)} disabled={meta.current_page >= meta.last_page}>Next</button></div>
      </nav>
    </> : <section className="users-empty"><span aria-hidden="true">◎</span><h2>No users found</h2><p>Try changing your search or filters.</p>{hasFilters && <button type="button" onClick={resetFilters}>Clear filters</button>}</section>}

    {selected && <Modal title="User details" onClose={() => setSelected(null)}>
      <div className="details-heading"><span className="user-avatar large" aria-hidden="true">{selected.name?.charAt(0).toUpperCase()}</span><div><h3>{selected.name}</h3><p>{selected.email}</p></div></div>
      <dl className="user-details"><div><dt>User ID</dt><dd>#{selected.id}</dd></div><div><dt>Primary role</dt><dd>{titleCase(selected.role)}</dd></div><div><dt>Account status</dt><dd><span className={`status-pill ${selected.deleted_at?'deleted':selected.status}`}>{selected.deleted_at?'Deleted':titleCase(selected.status)}</span></dd></div><div><dt>Email verification</dt><dd>{selected.email_verified_at ? `Verified ${formatDate(selected.email_verified_at)}` : 'Not verified'}</dd></div><div><dt>Joined</dt><dd>{formatDate(selected.created_at)}</dd></div>{selected.parent_profile?.phone && <div><dt>Phone</dt><dd>{selected.parent_profile.phone}</dd></div>}{selected.teacher_profile?.specialization && <div><dt>Specialization</dt><dd>{selected.teacher_profile.specialization}</dd></div>}{selected.student_profile?.grade_level && <div><dt>Grade level</dt><dd>{selected.student_profile.grade_level}</dd></div>}{selected.student_profile?.date_of_birth && <div><dt>Date of birth</dt><dd>{formatDate(selected.student_profile.date_of_birth)}</dd></div>}{selected.student_profile?.school_class && <div className="wide"><dt>Class</dt><dd>{selected.student_profile.school_class.name} ({selected.student_profile.school_class.code})</dd></div>}<div className="wide"><dt>Assigned roles</dt><dd>{selected.roles?.length ? selected.roles.map((item) => titleCase(item.name || item.slug)).join(', ') : titleCase(selected.role)}</dd></div></dl>{selected.subscriptions&&<section className="user-detail-section"><h4>Subscription history</h4>{selected.subscriptions.length?selected.subscriptions.map(s=><p key={s.id}><strong>{s.plan_name}</strong> · {titleCase(s.status)} · {formatDate(s.starts_at)} to {formatDate(s.ends_at)}</p>):<p>No subscriptions.</p>}</section>}{selected.activity&&<section className="user-detail-section"><h4>Recent activity</h4>{selected.activity.length?selected.activity.slice(0,8).map(a=><p key={a.id}>{titleCase(a.action)} · {a.content_type} #{a.content_id}</p>):<p>No activity recorded.</p>}</section>}
    </Modal>}

    {editor && <UserEditor member={editor.id ? editor : null} api={api} busy={busy} setBusy={setBusy} onClose={() => setEditor(null)} onSaved={(message) => { setEditor(null); setNotice(message); setRefresh((value) => value + 1) }} onError={setError}/>} 

    {pendingAction && <Modal title={pendingAction.type === 'role' ? 'Confirm role change' : pendingAction.type === 'delete' ? 'Delete user' : pendingAction.type === 'restore' ? 'Restore user' : `Confirm ${pendingAction.nextStatus === 'active' ? 'reactivation' : 'suspension'}`} onClose={() => setPendingAction(null)} busy={busy} actions={<><button type="button" className="modal-cancel" onClick={() => setPendingAction(null)} disabled={busy}>Cancel</button><button type="button" className={pendingAction.type === 'delete' || pendingAction.nextStatus === 'suspended' ? 'modal-danger' : 'modal-confirm'} onClick={performAction} disabled={busy}>{busy ? 'Saving…' : 'Confirm'}</button></>}>
      {pendingAction.type === 'role' ? <p>Change <strong>{pendingAction.member.name}</strong> from <strong>{titleCase(pendingAction.member.role)}</strong> to <strong>{titleCase(pendingAction.nextRole)}</strong>? Their active sessions will be signed out.</p> : pendingAction.type === 'delete' ? <p>Delete <strong>{pendingAction.member.name}</strong>? Their login will stop immediately, but the account can be restored.</p> : pendingAction.type === 'restore' ? <p>Restore <strong>{pendingAction.member.name}</strong> and return the account to the active user list?</p> : <p>{pendingAction.nextStatus === 'suspended' ? <>Suspend <strong>{pendingAction.member.name}</strong>? They will be signed out and unable to log in until reactivated.</> : <>Reactivate <strong>{pendingAction.member.name}</strong> and allow them to sign in again?</>}</p>}
    </Modal>}
  </main>
}

function UserEditor({ member, api, busy, setBusy, onClose, onSaved, onError }) {
  const [form, setForm] = useState({ name: member?.name || '', email: member?.email || '', password: '', role: member?.role || 'student', status: member?.status || 'active', email_verified: Boolean(member?.email_verified_at), phone: member?.parent_profile?.phone || '', specialization: member?.teacher_profile?.specialization || '', grade_level: member?.student_profile?.grade_level || '', date_of_birth: member?.student_profile?.date_of_birth?.slice?.(0,10) || '' })
  const submit = async (event) => { event.preventDefault(); setBusy(true); onError(''); try { const payload = { ...form }; if (member && !payload.password) delete payload.password; await (member ? api.patch(`/admin/users/${member.id}`, payload) : api.post('/admin/users', payload)); onSaved(member ? 'User updated successfully.' : 'User created successfully.') } catch (requestError) { onError(errorMessage(requestError)) } finally { setBusy(false) } }
  return <Modal title={member ? 'Edit user' : 'Add user'} onClose={onClose} busy={busy}><form className="user-editor" onSubmit={submit}><label>Name<input required maxLength="255" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></label><label>Email<input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label><label>{member?'New password (optional)':'Temporary password'}<input required={!member} type="password" minLength="8" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/></label><div className="editor-two"><label>Role<select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>{ROLES.map(x=><option key={x}>{x}</option>)}</select></label><label>Status<select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>{['active','suspended'].map(x=><option key={x}>{x}</option>)}</select></label></div>{form.role==='parent'&&<label>Phone<input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></label>}{form.role==='teacher'&&<label>Specialization<input value={form.specialization} onChange={(e)=>setForm({...form,specialization:e.target.value})}/></label>}{form.role==='student'&&<div className="editor-two"><label>Grade level<input value={form.grade_level} onChange={(e)=>setForm({...form,grade_level:e.target.value})}/></label><label>Date of birth<input type="date" value={form.date_of_birth} onChange={(e)=>setForm({...form,date_of_birth:e.target.value})}/></label></div>}<label className="editor-check"><input type="checkbox" checked={form.email_verified} onChange={(e)=>setForm({...form,email_verified:e.target.checked})}/> Email verified</label><footer><button type="button" className="modal-cancel" onClick={onClose}>Cancel</button><button className="modal-confirm" disabled={busy}>{busy?'Saving…':member?'Save changes':'Create user'}</button></footer></form></Modal>
}
