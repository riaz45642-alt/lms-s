import { teamData } from '../data/appData'
import { PageHero } from '../components/ui/UI'
import Reveal from '../components/Reveal'
import './pages.css'

const FEATURES = [
  { em: '📄', title: 'Curriculum-aligned worksheets', desc: 'Thousands of printable worksheets mapped to grade-level standards.' },
  { em: '📚', title: 'Subject deep-dives', desc: 'Structured chapters and resources for every core subject.' },
  { em: '🗓️', title: 'Classroom events', desc: 'Themed events and bundles to keep learning fresh and topical.' },
  { em: '⭐', title: 'Favorites & tracking', desc: 'Save resources, track downloads and pick up where you left off.' },
  { em: '👨‍👩‍👧', title: 'Built for every role', desc: 'Tailored dashboards for students, teachers and administrators.' },
  { em: '🔍', title: 'Instant global search', desc: 'Find any worksheet, subject or event in seconds.' },
]

export default function About() {
  return (
    <>
      <PageHero eyebrow="About EduSphere" title="Learn, practice, succeed" subtitle="EduSphere gives students, teachers and parents a single home for curriculum-aligned worksheets, subjects and classroom events." />
      <div className="page-section tight">
        <div className="wrap">
          <Reveal className="mission-grid" stagger>
            <div className="mission-card">
              <div className="m-em">🎯</div>
              <h3>Our mission</h3>
              <p>To make high-quality, curriculum-aligned learning resources freely accessible to every classroom and household, regardless of budget or background.</p>
            </div>
            <div className="mission-card">
              <div className="m-em">🔭</div>
              <h3>Our vision</h3>
              <p>A world where every learner has an engaging, personalised path to mastering core subjects — supported by teachers, parents and technology working together.</p>
            </div>
          </Reveal>

          <Reveal><div className="sec-head related-heading"><h2>What we offer</h2></div></Reveal>
          <Reveal className="feature-grid" stagger>
            {FEATURES.map((f) => (
              <div className="feature-item" key={f.title}>
                <div className="f-em">{f.em}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </Reveal>

          <Reveal><div className="sec-head related-heading"><h2>Meet the team</h2></div></Reveal>
          <Reveal className="team-grid" stagger>
            {teamData.map((t) => (
              <div className="team-card" key={t.name}>
                <div className="t-em">{t.em}</div>
                <h4>{t.name}</h4>
                <span>{t.role}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </>
  )
}
