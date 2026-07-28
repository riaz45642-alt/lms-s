import { Link } from '../router/Router'
import './Intro.css'

// Signature visual for this section: a small fanned stack of "worksheet"
// pages, built from divs (no image assets) so it stays on-brand and loads
// instantly. It's the one thing this section is designed to be remembered by.
function WorksheetStack() {
  return (
    <div className="ws-stack" aria-hidden="true">
      <div className="ws-page ws-back">
        <span className="ws-line" style={{ width: '70%' }} />
        <span className="ws-line" style={{ width: '45%' }} />
      </div>
      <div className="ws-page ws-mid">
        <span className="ws-line" style={{ width: '60%' }} />
        <span className="ws-line" style={{ width: '80%' }} />
        <span className="ws-line" style={{ width: '35%' }} />
      </div>
      <div className="ws-page ws-front">
        <div className="ws-badge">✓</div>
        <span className="ws-line" style={{ width: '55%' }} />
        <span className="ws-line" style={{ width: '75%' }} />
        <span className="ws-line short" style={{ width: '40%' }} />
      </div>
    </div>
  )
}

export default function Intro() {
  return (
    <section className="intro">
      <div className="wrap intro-grid">
        <div className="intro-copy">
          <span className="eyebrow">Why families pick us</span>
          <h2>Worksheets and resources for every student, teacher and parent</h2>
          <p>Explore our full library of curriculum-aligned worksheets and see how we can help you succeed — searchable, printable, and mapped to what your child is learning this term.</p>
          <Link className="btn btn-gold" to="/worksheets">Browse worksheets →</Link>
        </div>
        <WorksheetStack />
      </div>
    </section>
  )
}
