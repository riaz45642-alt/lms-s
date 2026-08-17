import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useRouter } from '../router/Router'
import { errorMessage } from '../services/api'
import '../components/Auth.css'

export default function VerifyEmail() {
  const { user, api, refreshUser, logout } = useApp()
  const { params, navigate } = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.verification === 'success') {
      setMessage('Your email address has been verified successfully.')
      refreshUser()
    } else if (params.verification === 'invalid') {
      setError('This verification link is invalid or has expired.')
    }
  }, [params.verification, refreshUser])

  const resend = async () => {
    setLoading(true); setMessage(''); setError('')
    try {
      const { data } = await api.post('/auth/email/verification-notification')
      setMessage(data.message)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const verified = Boolean(user?.email_verified_at) || params.verification === 'success'

  return (
    <section className="auth">
      <span className="planet" style={{ top: '14%', left: '8%' }}>★</span>
      <span className="planet" style={{ bottom: '18%', right: '10%' }}>●</span>
      <div className="auth-card">
        <div className="eyebrow">Email verification</div>
        <h1>{verified ? 'Email verified' : 'Check your inbox'}</h1>
        <p className="sub">
          {verified
            ? 'Your account is ready to use.'
            : `We sent a verification link${user?.email ? ` to ${user.email}` : ''}. Click it to verify your account.`}
        </p>
        {error && <div className="auth-error" role="alert">{error}</div>}
        {message && <div className="save-toast" role="status" style={{ display: 'block', marginBottom: 16 }}>{message}</div>}
        {verified ? (
          <button className="btn btn-primary auth-submit" onClick={() => navigate('/dashboard')}>Continue</button>
        ) : user ? (
          <button className="btn btn-primary auth-submit" disabled={loading} onClick={resend}>
            {loading ? 'Sending...' : 'Resend verification email'}
          </button>
        ) : (
          <button className="btn btn-primary auth-submit" onClick={() => navigate('/login')}>Log in to resend</button>
        )}
        {user && <button type="button" className="back-link" onClick={signOut}>Sign out</button>}
      </div>
    </section>
  )
}
