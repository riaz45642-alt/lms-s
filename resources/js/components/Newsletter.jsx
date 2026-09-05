import { useState } from 'react'
import api, { errorMessage } from '../services/api'
import './Newsletter.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubscribe = async (event) => {
    event.preventDefault()
    setSaving(true); setStatus('')
    try {
      const { data } = await api.post('/newsletter/subscriptions', { email })
      setStatus(data.message)
      setEmail('')
    } catch (requestError) { setStatus(errorMessage(requestError)) }
    finally { setSaving(false) }
  }

  return (
    <section className="news" id="pricing">
      <span className="star" style={{ top: '24px', left: '14%' }}>✦</span>
      <span className="star" style={{ top: '60px', right: '18%' }}>✦</span>
      <span className="star" style={{ bottom: '40px', left: '24%' }}>✦</span>
      <div className="wrap">
        <h2>Sign up to our newsletter</h2>
        <p>Receive teaching and parenting tips and advice. Gain exclusive access to all of our free content.</p>
        <form className="news-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn btn-gold" disabled={saving}>{saving ? 'Subscribing...' : 'Subscribe'}</button>
        </form>
        {status && <p role="status">{status}</p>}
      </div>
    </section>
  )
}
