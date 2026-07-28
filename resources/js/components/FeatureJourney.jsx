import './FeatureJourney.css'

// A different way to show "what the platform does" than another card grid:
// a single connected path a learner travels along, with the line itself
// drawing in on scroll and each stop popping in right after it arrives.
const STEPS = [
  {
    em: '🔎',
    title: 'Discover',
    desc: 'Search or browse worksheets, workbooks and activities matched to age and subject in seconds.',
    tint: '#F1ECFE',
  },
  {
    em: '✏️',
    title: 'Practice',
    desc: 'Print, play or complete interactively — every worksheet is built to be picked up and used right away.',
    tint: '#FFE9D8',
  },
  {
    em: '📊',
    title: 'Track',
    desc: 'Scores, streaks and completion feed straight into a live progress dashboard for teachers and parents.',
    tint: '#E3F7EA',
  },
  {
    em: '🏆',
    title: 'Celebrate',
    desc: 'Certificates and milestones keep learners motivated as they clear each subject, one step at a time.',
    tint: '#FFF0F0',
  },
]

export default function FeatureJourney() {
  return (
    <section className="journey">
      <div className="wrap">
        <div className="sec-head">
          <h2>How EduSphere actually works</h2>
          <p>One simple loop, repeated every week — discover, practice, track, celebrate.</p>
        </div>

        <div className="journey-path" style={{ '--steps': STEPS.length }}>
          <svg className="journey-line" viewBox="0 0 1000 4" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="2" x2="1000" y2="2" />
          </svg>
          {STEPS.map((s, i) => (
            <div className="journey-step" key={s.title} style={{ '--i': i, background: s.tint }}>
              <span className="js-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="js-em">{s.em}</span>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
