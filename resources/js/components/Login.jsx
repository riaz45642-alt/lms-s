import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import './Auth.css'

export default function Login({ onBack, onSwitch }) {
  const { login } = useApp()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await login(form, remember)
      window.history.replaceState({}, '', data.portal_path || '/dashboard')
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally { setLoading(false) }
  }

  return (
    <section className="auth">
      <span className="planet" style={{ top: '14%', left: '8%' }}>⭐</span>
      <span className="planet" style={{ bottom: '18%', right: '10%' }}>🪐</span>

      <div className="auth-card">
        <button className="back-link" onClick={onBack}>← Back to home</button>

        <a className="logo" href="#" onClick={(e) => { e.preventDefault(); onBack() }}>
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="gA" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0" stopColor="#1f86e0" /><stop offset="1" stopColor="#142d6f" />
              </linearGradient>
            </defs>
            <circle cx="24" cy="22" r="16" fill="none" stroke="url(#gA)" strokeWidth="2.2" />
            <ellipse cx="24" cy="22" rx="7" ry="16" fill="none" stroke="url(#gA)" strokeWidth="1.6" />
            <line x1="8" y1="22" x2="40" y2="22" stroke="url(#gA)" strokeWidth="1.6" />
            <path d="M24 16c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z" fill="#142d6f" />
            <path d="M16 30h16l-8 4z" fill="#1f86e0" />
            <path d="M38 10l1.6 3.4 3.6.4-2.7 2.5.8 3.6L38 18l-3.3 1.9.8-3.6L32.8 13.8l3.6-.4z" fill="#f6b81e" />
          </svg>
          <span>Edu<span className="blue">Sphere</span></span>
        </a>

        <div className="eyebrow">Welcome back</div>
        <h1>Log in to your account</h1>
        <p className="sub">Access your worksheets, progress reports and saved resources.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}
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
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="row-between">
            <label className="checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
            </label>
            <a className="link" href="#">Forgot password?</a>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        </form>

        <div className="divider"><span>or continue with</span></div>

        <div className="social-row">
          <button className="btn btn-ghost social-btn">Google</button>
          
        </div>

        <p className="switch-line">
          Don't have an account? <button type="button" className="link link-btn" onClick={onSwitch}>Sign up</button>
        </p>
      </div>
    </section>
  )
}
