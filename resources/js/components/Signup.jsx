import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import { isAuth0Configured } from '../services/auth0Config'
import GoogleButton from './GoogleButton'
import './Auth.css'

export default function Signup({ onBack, onSwitch }) {
  const { register } = useApp()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'parent', parent_id: '', teacher_id: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.parent_id) delete payload.parent_id
      if (!payload.teacher_id) delete payload.teacher_id
      const data = await register(payload)
      window.history.replaceState({}, '', data.portal_path || '/dashboard')
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally { setLoading(false) }
  }

  const roles = [{ value: 'parent', label: 'Parent' }, { value: 'teacher', label: 'Teacher' }, { value: 'student', label: 'Student' }]

  return (
    <section className="auth">
      <span className="planet" style={{ top: '14%', left: '8%' }}>🚀</span>
      <span className="planet" style={{ bottom: '18%', right: '10%' }}>⭐</span>

      <div className="auth-card">
        <button className="back-link" onClick={onBack}>← Back to home</button>

        <a className="logo" href="#" onClick={(e) => { e.preventDefault(); onBack() }}>
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="gB" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0" stopColor="#1f86e0" /><stop offset="1" stopColor="#142d6f" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="22" r="16" fill="none" stroke="url(#gB)" strokeWidth="2.2" />
            <ellipse cx="24" cy="22" rx="7" ry="16" fill="none" stroke="url(#gB)" strokeWidth="1.6" />
            <line x1="8" y1="22" x2="40" y2="22" stroke="url(#gB)" strokeWidth="1.6" />
            <path d="M24 16c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z" fill="#142d6f" />
            <path d="M16 30h16l-8 4z" fill="#1f86e0" />
            <path d="M38 10l1.6 3.4 3.6.4-2.7 2.5.8 3.6L38 18l-3.3 1.9.8-3.6L32.8 13.8l3.6-.4z" fill="#f6b81e" />
          </svg>
          <span>Edu<span className="blue">Sphere</span></span>
        </a>

        <div className="eyebrow">Get started</div>
        <h1>Create your account</h1>
        <p className="sub">Join thousands of parents, tutors and schools using EduSphere.</p>

        <div className="role-tabs">
          {roles.map((r) => (
            <button
              type="button"
              key={r.value}
              className={`role-tab${form.role === r.value ? ' active' : ''}`}
              onClick={() => setForm({ ...form, role: r.value })}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input type={showPass ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required />
          </label>

          {form.role === 'student' && <>
            <label className="field"><span>Parent profile ID (optional)</span><input type="number" name="parent_id" value={form.parent_id} onChange={handleChange} min="1" /></label>
            <label className="field"><span>Teacher profile ID (optional)</span><input type="number" name="teacher_id" value={form.teacher_id} onChange={handleChange} min="1" /></label>
          </>}

          <label className="checkbox terms">
            <input type="checkbox" required />
            I agree to the <a className="link" href="#">Terms</a> &amp; <a className="link" href="#">Privacy Policy</a>
          </label>

          <button type="submit" className="btn btn-gold auth-submit" disabled={loading}>{loading ? 'Creating account...' : `Sign up as ${form.role}`}</button>
        </form>

        {isAuth0Configured && (
          <>
            <div className="divider"><span>or continue with</span></div>

            <div className="social-row">
              <GoogleButton label="Sign up with Google" />
            </div>
          </>
        )}

        <p className="switch-line">
          Already have an account? <button type="button" className="link link-btn" onClick={onSwitch}>Log in</button>
        </p>
      </div>
    </section>
  )
}
