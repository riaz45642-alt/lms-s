import { useState } from 'react'
import { useRouter } from '../router/Router'
import api, { errorMessage } from '../services/api'
import '../components/Auth.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPassword() {
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setError('Please enter your email address.')
      return
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email: normalizedEmail })
      setSuccess(data.message)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth">
      <span className="planet" style={{ top: '14%', left: '8%' }}>★</span>
      <span className="planet" style={{ bottom: '18%', right: '10%' }}>●</span>

      <div className="auth-card">
        <button type="button" className="back-link" onClick={() => navigate('/login')}>
          ← Back to login
        </button>

        <div className="eyebrow">Account recovery</div>
        <h1>Forgot your password?</h1>
        <p className="sub">Enter your account email to prepare a password-reset request.</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error" role="alert">{error}</div>}
          {success && (
            <div className="save-toast" role="status" style={{ display: 'block', marginBottom: 16 }}>
              {success}
            </div>
          )}

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              aria-invalid={Boolean(error)}
            />
          </label>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Sending reset link...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </section>
  )
}
