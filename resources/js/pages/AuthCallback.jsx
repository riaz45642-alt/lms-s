import { useEffect, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useApp } from '../context/AppContext'
import { useRouter } from '../router/Router'
import { errorMessage } from '../services/api'
import '../components/Auth.css'

const ROLES = [
  { value: 'parent', label: 'Parent' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
]

/**
 * Landing page for the Auth0 redirect.
 *
 * Auth0 has proved the identity by the time we get here, but the API still needs
 * a role before it can create the local account, so a returning user goes
 * straight to their portal while a new one picks a role first.
 */
export default function AuthCallback() {
  const { isLoading, isAuthenticated, error: auth0Error, getAccessTokenSilently } = useAuth0()
  const { loginWithAuth0Token } = useApp()
  const { navigate } = useRouter()

  const [stage, setStage] = useState('working')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', role: 'parent', phone: '', specialization: '',
    grade_level: '', date_of_birth: '', parent_id: '', teacher_id: '',
  })

  // StrictMode mounts effects twice in development; without this the token would
  // be exchanged twice and two Sanctum tokens would be minted per sign-in.
  const exchanged = useRef(false)
  const accessToken = useRef(null)

  useEffect(() => {
    if (isLoading || exchanged.current) return

    if (auth0Error) {
      setError(auth0Error.message || 'Google sign-in was cancelled.')
      setStage('error')
      return
    }

    if (!isAuthenticated) {
      setError('Google sign-in did not complete. Please try again.')
      setStage('error')
      return
    }

    exchanged.current = true

    ;(async () => {
      try {
        accessToken.current = await getAccessTokenSilently()
        const data = await loginWithAuth0Token(accessToken.current)

        if (data.needs_role) {
          setForm((current) => ({ ...current, name: data.name || '' }))
          setStage('role')
          return
        }

        navigate(data.portal_path || '/dashboard')
      } catch (requestError) {
        setError(errorMessage(requestError))
        setStage('error')
      }
    })()
  }, [isLoading, isAuthenticated, auth0Error, getAccessTokenSilently, loginWithAuth0Token, navigate])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(''); setSaving(true)

    try {
      const payload = { role: form.role, name: form.name }

      if (form.role === 'parent' && form.phone) payload.phone = form.phone
      if (form.role === 'teacher' && form.specialization) payload.specialization = form.specialization
      if (form.role === 'student') {
        if (form.grade_level) payload.grade_level = form.grade_level
        if (form.date_of_birth) payload.date_of_birth = form.date_of_birth
        if (form.parent_id) payload.parent_id = form.parent_id
        if (form.teacher_id) payload.teacher_id = form.teacher_id
      }

      const data = await loginWithAuth0Token(accessToken.current, payload)
      navigate(data.portal_path || '/dashboard')
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  if (stage === 'working') {
    return (
      <section className="auth">
        <div className="auth-card">
          <div className="eyebrow">Almost there</div>
          <h1>Signing you in...</h1>
          <p className="sub">Verifying your Google account with EduSphere.</p>
        </div>
      </section>
    )
  }

  if (stage === 'error') {
    return (
      <section className="auth">
        <div className="auth-card">
          <div className="eyebrow">Sign-in failed</div>
          <h1>We could not sign you in</h1>
          <div className="auth-error" role="alert">{error}</div>
          <button type="button" className="btn btn-primary auth-submit" onClick={() => navigate('/login')}>
            Back to log in
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <div className="eyebrow">One last step</div>
        <h1>How will you use EduSphere?</h1>
        <p className="sub">We need this to set up the right portal for your account.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <label className="field">
            <span>Full name</span>
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>I am a</span>
            <select name="role" value={form.role} onChange={handleChange}>
              {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </label>

          {form.role === 'parent' && (
            <label className="field">
              <span>Phone (optional)</span>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} />
            </label>
          )}

          {form.role === 'teacher' && (
            <label className="field">
              <span>Specialization (optional)</span>
              <input type="text" name="specialization" value={form.specialization} onChange={handleChange} />
            </label>
          )}

          {form.role === 'student' && (
            <>
              <label className="field">
                <span>Grade level (optional)</span>
                <input type="text" name="grade_level" value={form.grade_level} onChange={handleChange} />
              </label>
              <label className="field">
                <span>Date of birth (optional)</span>
                <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
              </label>
              <label className="field">
                <span>Parent ID (optional)</span>
                <input type="number" name="parent_id" value={form.parent_id} onChange={handleChange} />
              </label>
              <label className="field">
                <span>Teacher ID (optional)</span>
                <input type="number" name="teacher_id" value={form.teacher_id} onChange={handleChange} />
              </label>
            </>
          )}

          <button type="submit" className="btn btn-primary auth-submit" disabled={saving}>
            {saving ? 'Creating your account...' : 'Continue'}
          </button>
        </form>
      </div>
    </section>
  )
}
