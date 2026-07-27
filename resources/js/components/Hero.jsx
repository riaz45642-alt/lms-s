import { Link } from '../router/Router'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true"></div>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Worksheets, reimagined</span>
          <h1>Learning that feels like <span>play</span>, not paperwork</h1>
          <p className="lead">Thousands of curriculum-aligned worksheets and activities — ready to print, play and track, all in one bright, friendly place.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/worksheets">Browse worksheets</Link>
            <Link className="btn btn-ghost" to="/activities">Try an activity</Link>
          </div>
          <div className="hero-stats">
            <div><b>12k+</b><span>worksheets</span></div>
            <div><b>85%</b><span>teacher approval</span></div>
            <div><b>5–11</b><span>age range</span></div>
          </div>
        </div>

        <div className="hero-bento">
          <div className="bento-card bento-main">
            <span className="bc-em">📐</span>
            <b>Maths · Shapes & Patterns</b>
            <span className="bc-tag">Free</span>
          </div>
          <div className="bento-card bento-small">
            <span className="bc-em">🔤</span>
            <b>Phonics</b>
          </div>
          <div className="bento-card bento-small accent">
            <span className="bc-em">🔬</span>
            <b>Science lab</b>
          </div>
          <div className="bento-card bento-wide">
            <span className="bc-em">⭐</span>
            <b>Track progress worksheet by worksheet</b>
          </div>
        </div>
      </div>
    </section>
  )
}
