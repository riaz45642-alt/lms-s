import { useState } from 'react'
import { useRouter } from '../router/Router'
import api, { errorMessage } from '../services/api'
import '../components/Auth.css'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPassword() {
  const { navigate, params } = useRouter()
  const [form, setForm] = useState({ password: '', passwordConfirmation: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.password || !form.passwordConfirmation) {
      setError('Please complete both password fields.')
      return
    }
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Your new password must contain at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (form.password !== form.passwordConfirmation) {
      setError('The password confirmation does not match.')
      return
    }
    if (!params.token || !params.email) {
      setError('This password reset link is invalid. Please request a new one.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password', {
        token: params.token,
        email: params.email,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      })
      setSuccess(data.message)
      setForm({ password: '', passwordConfirmation: '' })
      window.setTimeout(() => navigate('/login', { replace: true }), 1500)
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
        <h1>Reset your password</h1>
        <p className="sub">Choose a new password containing at least eight characters.</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error" role="alert">{error}</div>}
          {success && (
            <div className="save-toast" role="status" style={{ display: 'block', marginBottom: 16 }}>
              {success}
            </div>
          )}

          <label className="field">
            <span>New password</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={Boolean(error)}
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              name="passwordConfirmation"
              autoComplete="new-password"
              value={form.passwordConfirmation}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={Boolean(error)}
            />
          </label>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Resetting password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </section>
  )
}
