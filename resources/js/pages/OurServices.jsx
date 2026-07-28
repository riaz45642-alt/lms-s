import { useRouter } from '../router/Router'
import { PageHero } from '../components/ui/UI'
import './pages.css'

const SERVICES = [
  { em: '📄', title: 'Worksheets', desc: 'Thousands of printable, curriculum-aligned worksheets across every core subject and year group.', to: '/worksheets' },
  { em: '📘', title: 'Workbooks', desc: 'Structured, multi-week workbooks that guide learners through a topic step by step.', to: '/workbooks' },
  { em: '🎮', title: 'Interactive Courses', desc: 'Self-paced video courses with quizzes and instant feedback for a more guided learning path.', to: '/courses' },
  { em: '🧩', title: 'Activities', desc: 'Short, playful games and puzzles that turn revision time into play time.', to: '/activities' },
  { em: '🗓️', title: 'Classroom Events', desc: 'Themed events and seasonal bundles that keep learning fresh and topical all year round.', to: '/events' },
  { em: '📊', title: 'Progress Reports', desc: 'Teacher-checked marks, remarks and dashboards help families track performance at a glance.', to: '/dashboard' },
]

const AUDIENCES = [
  { em: '👨‍👩‍👧', title: 'For Parents', desc: 'Support learning at home with resources matched to your child\'s year group.', to: '/parent' },
  { em: '👩‍🏫', title: 'For Educators', desc: 'Assign, print and track classroom resources for every student in minutes.', to: '/educator' },
  { em: '🧑‍🎓', title: 'For Students', desc: 'Practice, play and track your own progress with a dashboard built just for you.', to: '/student' },
]

export default function OurServices() {
  const { navigate } = useRouter()

  return (
    <>
      <PageHero eyebrow="Our services" title="Everything you need, in one place" subtitle="From printable worksheets to interactive courses, EduSphere brings every kind of learning resource together." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="feature-grid">
            {SERVICES.map((s) => (
              <div className="feature-item" key={s.title} style={{ cursor: 'pointer' }} onClick={() => navigate(s.to)}>
                <div className="f-em">{s.em}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="sec-head related-heading"><h2>Built for every role</h2></div>
          <div className="mission-grid-3">
            {AUDIENCES.map((a) => (
              <div className="mission-card" key={a.title}>
                <div className="m-em">{a.em}</div>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
                <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => navigate(a.to)}>Learn more</button>
              </div>
            ))}
          </div>

          <div className="help-support-card">
            <div>
              <h3>Ready to get started?</h3>
              <p>Create a free account and explore the full EduSphere library today.</p>
            </div>
            <button className="btn btn-gold" onClick={() => navigate('/pricing')}>See pricing</button>
          </div>
        </div>
      </div>
    </>
  )
}
