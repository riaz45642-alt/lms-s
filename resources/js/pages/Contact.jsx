import { useState } from 'react'
import { PageHero } from '../components/ui/UI'
import './pages.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
    setTimeout(() => setSent(false), 3500)
  }

  return (
    <>
      <PageHero eyebrow="Get in touch" title="Contact us" subtitle="Questions about worksheets, subjects or your account? We'd love to help." />
      <div className="page-section tight">
        <div className="wrap contact-layout">
          <div className="contact-info-card">
            <h3 style={{ marginBottom: 6 }}>Contact information</h3>
            <div className="info-row">
              <div className="info-em">✉️</div>
              <div><div style={{ fontWeight: 700 }}>Email</div><div style={{ color: 'var(--muted)', fontSize: 13 }}>contact@edusphere.co</div></div>
            </div>
            <div className="info-row">
              <div className="info-em">📞</div>
              <div><div style={{ fontWeight: 700 }}>Phone</div><div style={{ color: 'var(--muted)', fontSize: 13 }}>+1 (555) 012-3456</div></div>
            </div>
            <div className="info-row">
              <div className="info-em">📍</div>
              <div><div style={{ fontWeight: 700 }}>Address</div><div style={{ color: 'var(--muted)', fontSize: 13 }}>128 Learning Lane, Springfield, EDU 10101</div></div>
            </div>
            <div className="map-placeholder">🗺️ Map placeholder — Google Maps embed</div>
          </div>

          <div className="profile-panel">
            <h3>Send us a message</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Full name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label>Email address</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-field">
                <label>Subject</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary">Send message</button>
              {sent && <div className="save-toast">✓ Message sent — we'll be in touch soon</div>}
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
