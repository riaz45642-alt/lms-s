import { useEffect, useState } from 'react'
import { Link } from '../router/Router'
import './Hero.css'

const WORDS = ['play', 'discovery', 'adventure', 'wonder']

// Cycles through a short list of words with a crossfade/slide, purely CSS driven.
function RotatingWord() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2200)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="rotating-word" key={i}>
      {WORDS[i]}
    </span>
  )
}

// Counts up from 0 to `target` once it scrolls into view (or shortly after mount,
// since the hero is already visible on load).
export default function Hero() {
  const moveVisual = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    event.currentTarget.style.setProperty('--mx', `${x * 16}px`)
    event.currentTarget.style.setProperty('--my', `${y * 12}px`)
    event.currentTarget.style.setProperty('--rx', `${-y * 5}deg`)
    event.currentTarget.style.setProperty('--ry', `${x * 7}deg`)
  }

  const resetVisual = (event) => {
    event.currentTarget.style.setProperty('--mx', '0px')
    event.currentTarget.style.setProperty('--my', '0px')
    event.currentTarget.style.setProperty('--rx', '0deg')
    event.currentTarget.style.setProperty('--ry', '0deg')
  }

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="hero-pill"><i aria-hidden="true">✦</i> A brighter way to learn</span>
          <h1>Big ideas start with a little <RotatingWord /></h1>
          <p className="lead">Worksheets, activities and progress — together in one friendly learning space.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/worksheets">Start learning <span aria-hidden="true">→</span></Link>
            <Link className="btn btn-ghost" to="/activities">Explore activities</Link>
          </div>
          <div className="hero-trust" aria-label="Platform highlights">
            <span><b>✓</b> Easy to explore</span>
            <span><b>✓</b> Progress made clear</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true" onPointerMove={moveVisual} onPointerLeave={resetVisual}>
          <span className="hero-dot dot-one">Aa</span>
          <span className="hero-dot dot-two">12</span>
          <span className="hero-dot dot-three">✓</span>
          <div className="hero-art-halo"></div>
          <div className="hero-progress-card"><span>Weekly goal</span><div><i style={{ width: '72%' }}></i></div><strong>Great progress!</strong></div>
        </div>
      </div>
    </section>
  )
}
