import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PageHero } from '../components/ui/UI'
import './pages.css'
import './lms.css'

const NAV = [
  { key: 'profile', label: 'Profile settings' },
  { key: 'notifications', label: 'Notification preferences' },
  { key: 'theme', label: 'Theme' },
  { key: 'language', label: 'Language' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'account', label: 'Account' },
]

function Toggle({ on, onClick }) {
  return <div className={`toggle-switch${on ? ' on' : ''}`} onClick={onClick} role="switch" aria-checked={on}><div className="knob" /></div>
}

export default function Settings() {
  const { user } = useApp()
  const [tab, setTab] = useState('profile')
  const [notif, setNotif] = useState({ email: true, push: true, digest: false, sms: false })
  const [theme, setTheme] = useState('light')
  const [lang, setLang] = useState('English')
  const [privacy, setPrivacy] = useState({ profilePublic: true, showProgress: false })
  const [saved, setSaved] = useState(false)
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <>
      <PageHero eyebrow="Personalize EduSphere" title="Settings" subtitle="Manage your profile, notifications, appearance and account preferences." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="settings-layout">
            <div className="settings-nav">
              {NAV.map((n) => (
                <button key={n.key} className={tab === n.key ? 'active' : ''} onClick={() => setTab(n.key)}>{n.label}</button>
              ))}
            </div>

            <div className="profile-panel">
              {tab === 'profile' && (
                <>
                  <h3>Profile settings</h3>
                  <div className="form-grid">
                    <div className="form-field"><label>Display name</label><input defaultValue={user.name} /></div>
                    <div className="form-field"><label>Email</label><input defaultValue={user.email} /></div>
                  </div>
                  <button className="btn btn-primary" onClick={flash}>Save changes</button>
                </>
              )}

              {tab === 'notifications' && (
                <>
                  <h3>Notification preferences</h3>
                  {[
                    ['email', 'Email notifications', 'Get updates about assignments and grades by email'],
                    ['push', 'Push notifications', 'Receive alerts on your device'],
                    ['digest', 'Weekly digest', 'A summary of your activity every week'],
                    ['sms', 'SMS alerts', 'Text messages for urgent deadlines'],
                  ].map(([key, label, desc]) => (
                    <div className="setting-row" key={key}>
                      <div><h4>{label}</h4><p>{desc}</p></div>
                      <Toggle on={notif[key]} onClick={() => setNotif((n) => ({ ...n, [key]: !n[key] }))} />
                    </div>
                  ))}
                </>
              )}

              {tab === 'theme' && (
                <>
                  <h3>Theme</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 16 }}>Choose how EduSphere looks for you.</p>
                  <div className="theme-options">
                    {['light', 'dark', 'system'].map((t) => (
                      <div key={t} className={`theme-opt${theme === t ? ' active' : ''}`} onClick={() => setTheme(t)}>{t[0].toUpperCase() + t.slice(1)}</div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'language' && (
                <>
                  <h3>Language</h3>
                  <div className="lang-options">
                    {['English', 'Spanish', 'French', 'Urdu', 'Arabic'].map((l) => (
                      <div key={l} className={`theme-opt${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}>{l}</div>
                    ))}
                  </div>
                </>
              )}

              {tab === 'privacy' && (
                <>
                  <h3>Privacy settings</h3>
                  <div className="setting-row">
                    <div><h4>Public profile</h4><p>Allow classmates to view your profile</p></div>
                    <Toggle on={privacy.profilePublic} onClick={() => setPrivacy((p) => ({ ...p, profilePublic: !p.profilePublic }))} />
                  </div>
                  <div className="setting-row">
                    <div><h4>Show learning progress</h4><p>Let others see your course progress and achievements</p></div>
                    <Toggle on={privacy.showProgress} onClick={() => setPrivacy((p) => ({ ...p, showProgress: !p.showProgress }))} />
                  </div>
                </>
              )}

              {tab === 'account' && (
                <>
                  <h3>Account settings</h3>
                  <div className="form-field"><label>Role</label><input defaultValue={user.role} disabled /></div>
                  <div className="form-field"><label>Joined</label><input defaultValue={user.joined} disabled /></div>
                  <div className="form-actions">
                    <button className="btn btn-ghost">Download my data</button>
                    <button className="btn btn-ghost" style={{ color: '#c53b3b', borderColor: '#f6c8c8' }}>Delete account</button>
                  </div>
                </>
              )}

              {saved && <div className="save-toast" style={{ marginTop: 18 }}>✓ Settings saved</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
