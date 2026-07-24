import { useState } from 'react'
import { useRouter } from '../router/Router'
import '../components/Auth.css'
import './pages.css'

export default function ForgotPassword({ mode = 'forgot' }) {
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState({ next: '', confirm: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleForgot = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleReset = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => navigate('/'), 1600)
  }

  return (
    <section className="auth">
      <span className="planet" style={{ top: '14%', left: '8%' }}>⭐</span>
      <span className="planet" style={{ bottom: '18%', right: '10%' }}>🪐</span>

      <div className="auth-card">
        <button className="back-link" onClick={() => navigate('/')}>← Back to home</button>

        {mode === 'forgot' ? (
          <>
            <div className="eyebrow">Account recovery</div>
            <h1>Forgot your password?</h1>
            <p className="sub">Enter your email and we'll send you a link to reset your password.</p>

            {submitted ? (
              <div className="save-toast" style={{ display: 'block', textAlign: 'center' }}>
                ✓ If an account exists for {email}, a reset link is on its way.
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <label className="field">
                  <span>Email address</span>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <button type="submit" className="btn btn-primary auth-submit">Send reset link</button>
              </form>
            )}

            <p className="switch-line">
              Remembered it? <button type="button" className="link link-btn" onClick={() => navigate('/login')}>Log in</button>
            </p>
            <p className="switch-line">
              Have a reset link already? <button type="button" className="link link-btn" onClick={() => navigate('/reset-password')}>Reset password</button>
            </p>
          </>
        ) : (
          <>
            <div className="eyebrow">Account recovery</div>
            <h1>Reset your password</h1>
            <p className="sub">Choose a new password for your account.</p>

            {submitted ? (
              <div className="save-toast" style={{ display: 'block', textAlign: 'center' }}>✓ Password reset — redirecting you home…</div>
            ) : (
              <form onSubmit={handleReset}>
                <label className="field">
                  <span>New password</span>
                  <input type="password" value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} required />
                </label>
                <label className="field">
                  <span>Confirm new password</span>
                  <input type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} required />
                </label>
                <button type="submit" className="btn btn-primary auth-submit">Reset password</button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  )
}
