import { useState } from 'react'
import './Newsletter.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const handleSubscribe = () => {
    if (email) {
      alert(`Subscribed: ${email}`)
      setEmail('')
    }
  }

  return (
    <section className="news" id="pricing">
      <span className="star" style={{ top: '24px', left: '14%' }}>✦</span>
      <span className="star" style={{ top: '60px', right: '18%' }}>✦</span>
      <span className="star" style={{ bottom: '40px', left: '24%' }}>✦</span>
      <div className="wrap">
        <h2>Sign up to our newsletter</h2>
        <p>Receive teaching and parenting tips and advice. Gain exclusive access to all of our free content.</p>
        <div className="news-form">
          <input
            type="email"
            placeholder="Enter your email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-gold" onClick={handleSubscribe}>Subscribe</button>
        </div>
      </div>
    </section>
  )
}
