import './WaveBand.css'

// Signature for this section: a winding progress trail with checkpoints,
// directly illustrating "track every learner's progress" rather than
// decorative, off-brand icons.
function ProgressTrail() {
  const checkpoints = [
    { label: 'Started', state: 'done' },
    { label: 'Practising', state: 'done' },
    { label: 'Reviewing', state: 'active' },
    { label: 'Mastered', state: 'todo' },
  ]
  return (
    <div className="trail" aria-hidden="true">
      <svg className="trail-line" viewBox="0 0 600 40" preserveAspectRatio="none">
        <path d="M10,30 C160,-10 220,50 300,20 C380,-10 440,50 590,10" />
      </svg>
      <div className="trail-points">
        {checkpoints.map((c) => (
          <div className={`trail-point ${c.state}`} key={c.label}>
            <span className="tp-dot" />
            <span className="tp-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WaveBand() {
  return (
    <section className="wave-band">
      <div className="wrap wave-grid">
        <div className="wave-copy">
          <span className="eyebrow eyebrow-light">Live progress tracking</span>
          <h2>Track every learner's progress, worksheet by worksheet</h2>
          <p>Teacher-reviewed submissions, downloadable PDFs and progress reports for ages 5–11, aligned to the national curriculum.</p>
          <a className="btn btn-primary" href="#">Get free access</a>
        </div>
        <ProgressTrail />
      </div>
    </section>
  )
}
