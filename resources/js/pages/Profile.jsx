import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { subjectProgress, achievementsData, certificatesData } from '../data/lmsData'
import { StatCard } from '../components/ui/UI'
import './pages.css'
import './lms.css'

const AVATARS = ['👩‍🎓', '👨‍🎓', '👩‍🏫', '👨‍🏫', '🧑‍💻', '👩‍💼']
const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'info', label: 'Personal information' },
  { key: 'password', label: 'Change password' },
  { key: 'avatar', label: 'Profile picture' },
]

export default function Profile() {
  const { user, updateUser } = useApp()
  const [tab, setTab] = useState('info')
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: '', bio: '' })
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [saved, setSaved] = useState(false)

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  const handleInfoSave = (e) => {
    e.preventDefault()
    updateUser({ name: form.name, email: form.email })
    flashSaved()
  }

  const handlePwSave = (e) => {
    e.preventDefault()
    setPwForm({ current: '', next: '', confirm: '' })
    flashSaved()
  }

  return (
    <div className="page-section">
      <div className="wrap">
        <div className="profile-layout">
          <div className="profile-card">
            <div className="avatar-wrap">
              <div className="avatar-em">{user.avatar}</div>
              <button className="avatar-edit" onClick={() => setTab('avatar')} aria-label="Edit profile picture">✎</button>
            </div>
            <h3>{user.name}</h3>
            <span className="role-badge">{user.role}</span>
            <div className="p-email">{user.email}</div>
            <ul className="profile-nav">
              {TABS.map((t) => (
                <li key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</li>
              ))}
            </ul>
          </div>

          <div className="profile-panel">
            {tab === 'overview' && (
              <>
                <h3>Overview</h3>
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 26 }}>
                  <StatCard em="📚" label="Courses enrolled" value="20" />
                  <StatCard em="✅" label="Courses completed" value="5" />
                  <StatCard em="🏅" label="Certificates" value={String(certificatesData.length)} />
                  <StatCard em="🔥" label="Learning streak" value="6 days" />
                </div>

                <h4 style={{ fontSize: 15, marginBottom: 14 }}>Learning progress</h4>
                {subjectProgress.map((s) => (
                  <div className="progress-item" key={s.subject}>
                    <div className="pi-top"><span>{s.em} {s.subject}</span><span>{s.progress}%</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${s.progress}%` }} /></div>
                  </div>
                ))}

                <h4 style={{ fontSize: 15, margin: '24px 0 4px' }}>Achievements</h4>
                {achievementsData.map((a) => (
                  <div className="activity-item" key={a.title}>
                    <span className="activity-em">{a.em}</span>
                    <span className="activity-text">{a.title}</span>
                  </div>
                ))}
              </>
            )}

            {tab === 'info' && (
              <>
                <h3>Personal information</h3>
                <form onSubmit={handleInfoSave}>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Full name</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-field">
                      <label>Email address</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-field">
                      <label>Phone number</label>
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
                    </div>
                    <div className="form-field">
                      <label>Joined</label>
                      <input value={user.joined} disabled />
                    </div>
                  </div>
                  <div className="form-field">
                    <label>Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us a bit about yourself" />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Save changes</button>
                    <button type="button" className="btn btn-ghost">Cancel</button>
                  </div>
                  {saved && <div className="save-toast">✓ Changes saved</div>}
                </form>
              </>
            )}

            {tab === 'password' && (
              <>
                <h3>Change password</h3>
                <form onSubmit={handlePwSave}>
                  <div className="form-field">
                    <label>Current password</label>
                    <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} required />
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>New password</label>
                      <input type="password" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} required />
                    </div>
                    <div className="form-field">
                      <label>Confirm new password</label>
                      <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Update password</button>
                  </div>
                  {saved && <div className="save-toast">✓ Password updated</div>}
                </form>
              </>
            )}

            {tab === 'avatar' && (
              <>
                <h3>Profile picture</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 18 }}>Choose an avatar to represent you across EduSphere.</p>
                <div className="quick-actions" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      className="qa-btn"
                      style={{ alignItems: 'center', fontSize: 26, border: user.avatar === a ? '1.5px solid var(--blue)' : undefined }}
                      onClick={() => { updateUser({ avatar: a }); flashSaved() }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {saved && <div className="save-toast">✓ Profile picture updated</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
