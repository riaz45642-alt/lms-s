import { weeklyActivity, monthlyActivity, quizPerformance, subjectProgress, achievementsData } from '../data/lmsData'
import { PageHero, ProgressRing, BarChart } from '../components/ui/UI'
import './pages.css'
import './lms.css'

const STREAK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const STREAK_ACTIVE = [true, true, true, false, true, true, true]

export default function ProgressAnalytics() {
  const overall = Math.round(subjectProgress.reduce((s, x) => s + x.progress, 0) / subjectProgress.length)
  const studyHoursTotal = weeklyActivity.reduce((s, d) => s + d.hours, 0).toFixed(1)

  return (
    <>
      <PageHero eyebrow="Track your growth" title="Progress Analytics" subtitle="A full picture of your learning: overall progress, subject breakdown and study habits." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat-card"><ProgressRing value={overall} size={70} stroke={7} /><div className="stat-label" style={{ marginTop: 8 }}>Overall progress</div></div>
            <div className="stat-card"><div className="stat-em">🔥</div><div className="stat-value">6 days</div><div className="stat-label">Learning streak</div></div>
            <div className="stat-card"><div className="stat-em">⏱️</div><div className="stat-value">{studyHoursTotal}h</div><div className="stat-label">Study hours this week</div></div>
            <div className="stat-card"><div className="stat-em">🧠</div><div className="stat-value">81%</div><div className="stat-label">Avg. quiz score</div></div>
          </div>

          <div className="dash-columns">
            <div>
              <div className="dash-card">
                <h3>Weekly learning hours</h3>
                <BarChart data={weeklyActivity} valueKey="hours" labelKey="day" suffix="h" />
              </div>
              <div className="dash-card">
                <h3>Monthly activity</h3>
                <BarChart data={monthlyActivity} color="var(--gold)" suffix="h" />
              </div>
              <div className="dash-card">
                <h3>Quiz performance by subject</h3>
                <BarChart data={quizPerformance} valueKey="score" color="#1f9d57" suffix="%" max={100} />
              </div>
            </div>

            <div>
              <div className="dash-card">
                <h3>Subject-wise progress</h3>
                {subjectProgress.map((s) => (
                  <div className="progress-item" key={s.subject}>
                    <div className="pi-top"><span>{s.em} {s.subject}</span><span>{s.progress}%</span></div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${s.progress}%` }} /></div>
                  </div>
                ))}
              </div>

              <div className="dash-card">
                <h3>Learning streak</h3>
                <div className="streak-row">
                  {STREAK_DAYS.map((d, i) => <div key={i} className={`streak-day${STREAK_ACTIVE[i] ? ' active' : ''}`}>{STREAK_ACTIVE[i] ? '🔥' : d}</div>)}
                </div>
              </div>

              <div className="dash-card">
                <h3>Achievements</h3>
                {achievementsData.map((a) => (
                  <div className="activity-item" key={a.title}>
                    <span className="activity-em">{a.em}</span>
                    <span className="activity-text">{a.title}<div style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{a.desc}</div></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
