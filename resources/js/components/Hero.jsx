import { useEffect, useRef, useState } from 'react'
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
function CountUp({ target, suffix = '', duration = 1200 }) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    let raf
    let start
    const tick = (ts) => {
      if (start === undefined) start = ts
      const progress = Math.min(1, (ts - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    const timeout = setTimeout(() => { raf = requestAnimationFrame(tick) }, 250)
    return () => { clearTimeout(timeout); if (raf) cancelAnimationFrame(raf) }
  }, [target, duration])

  return <b ref={ref}>{value}{suffix}</b>
}

// Lightweight tilt-on-hover for the bento cards — no library, just pointer math.
function useTilt() {
  const onMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
    card.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`)
  }
  const onLeave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }
  return { onMouseMove: onMove, onMouseLeave: onLeave }
}

export default function Hero() {
  const tilt = useTilt()

  return (
    <section className="hero">
      <div className="hero-glow" aria-hidden="true"></div>
      <span className="hero-blob blob-a" aria-hidden="true"></span>
      <span className="hero-blob blob-b" aria-hidden="true"></span>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Worksheets, reimagined</span>
          <h1>Learning that feels like <RotatingWord />, not paperwork</h1>
          <p className="lead">Thousands of curriculum-aligned worksheets and activities — ready to print, play and track, all in one bright, friendly place.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/worksheets">Browse worksheets</Link>
            <Link className="btn btn-ghost" to="/activities">Try an activity</Link>
          </div>
          <div className="hero-stats">
            <div><CountUp target={12} suffix="k+" /><span>worksheets</span></div>
            <div><CountUp target={85} suffix="%" /><span>teacher approval</span></div>
            <div><b>5–11</b><span>age range</span></div>
          </div>
        </div>

        <div className="hero-bento">
          <div className="bento-card bento-main" {...tilt}>
            <span className="bc-em">📐</span>
            <b>Maths · Shapes & Patterns</b>
            <span className="bc-tag">Free</span>
          </div>
          <div className="bento-card bento-small" {...tilt}>
            <span className="bc-em">🔤</span>
            <b>Phonics</b>
          </div>
          <div className="bento-card bento-small accent" {...tilt}>
            <span className="bc-em">🔬</span>
            <b>Science lab</b>
          </div>
          <div className="bento-card bento-wide" {...tilt}>
            <span className="bc-em">⭐</span>
            <b>Track progress worksheet by worksheet</b>
          </div>
        </div>
      </div>
    </section>
  )
}
