import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import './Portal.css'

export default function AccountProfile() {
  const { user, updateProfile } = useApp()
  const [form, setForm] = useState({ name: '', phone: '', specialization: '', grade_level: '', date_of_birth: '' })
  const [message, setMessage] = useState('')
  useEffect(() => setForm({
    name: user?.name || '', phone: user?.parent_profile?.phone || '',
    specialization: user?.teacher_profile?.specialization || '', grade_level: user?.student_profile?.grade_level || '',
    date_of_birth: user?.student_profile?.date_of_birth?.slice(0, 10) || '',
  }), [user])

  const submit = async (event) => {
    event.preventDefault(); setMessage('Saving...')
    try { await updateProfile(Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ''))); setMessage('Profile saved.') }
    catch (requestError) { setMessage(errorMessage(requestError)) }
  }

  return <main className="portal narrow"><span className="eyebrow">Account</span><h1>Your profile</h1>
    <form className="profile-form" onSubmit={submit}>
      <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
      {user?.role === 'parent' && <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>}
      {user?.role === 'teacher' && <label>Specialization<input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></label>}
      {user?.role === 'student' && <><label>Grade level<input value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} /></label><label>Date of birth<input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></label></>}
      <button className="btn btn-primary">Save profile</button>{message && <p>{message}</p>}
    </form>
  </main>
}
