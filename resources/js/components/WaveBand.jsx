import './WaveBand.css'

export default function WaveBand() {
  return (
    <section className="wave-band">
      <span className="planet" style={{ top: '30px', left: '8%' }}>🪐</span>
      <span className="planet" style={{ bottom: '34px', right: '10%' }}>🚀</span>
      <span className="planet" style={{ top: '50%', left: '4%' }}>⭐</span>
      <div className="wrap">
        <h2>Track every learner's progress, worksheet by worksheet</h2>
        <p>Auto-scoring, downloadable PDFs and progress reports for ages 5–11, aligned to the national curriculum.</p>
        <a className="btn btn-primary" href="#">Get free access</a>
      </div>
    </section>
  )
}
