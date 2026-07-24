import { useMemo, useState } from 'react'
import { calendarEvents, CALENDAR_TYPE_META } from '../data/lmsData'
import { PageHero, EmptyState } from '../components/ui/UI'
import './pages.css'
import './lms.css'

const YEAR = 2026, MONTH = 6 // July (0-indexed)
const TODAY = new Date(2026, 6, 12)

function pad(n) { return String(n).padStart(2, '0') }

export default function CalendarPage() {
  const [selected, setSelected] = useState(null)
  const firstDay = new Date(YEAR, MONTH, 1)
  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate()
  const startOffset = firstDay.getDay()

  const eventsByDate = useMemo(() => {
    const map = {}
    calendarEvents.forEach((e) => { (map[e.date] ||= []).push(e) })
    return map
  }, [])

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectedEvents = selected ? (eventsByDate[selected] || []) : []
  const upcoming = [...calendarEvents].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <>
      <PageHero eyebrow="Plan ahead" title="Learning Calendar" subtitle="Live classes, assignment deadlines, events and exams in one view." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="legend-row">
            {Object.entries(CALENDAR_TYPE_META).map(([k, v]) => (
              <span className="legend-item" key={k}><span className="legend-dot" style={{ background: v.color }} />{v.label}</span>
            ))}
          </div>

          <div className="dash-columns">
            <div>
              <div className="dash-card">
                <h3>July 2026</h3>
                <div className="cal-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="cal-dow">{d}</div>)}
                  {cells.map((d, i) => {
                    if (!d) return <div key={i} className="cal-cell muted" />
                    const dateStr = `${YEAR}-${pad(MONTH + 1)}-${pad(d)}`
                    const evts = eventsByDate[dateStr] || []
                    const isToday = TODAY.getDate() === d
                    return (
                      <div key={i} className={`cal-cell${isToday ? ' today' : ''}`} onClick={() => setSelected(dateStr)}>
                        <div className="cal-date">{d}</div>
                        <div className="cal-dot-row">
                          {evts.map((e) => <span key={e.id} className="cal-dot" style={{ background: CALENDAR_TYPE_META[e.type].color }} title={e.title} />)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {selected && (
                <div className="dash-card">
                  <h3>{new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                  {selectedEvents.length === 0 ? <EmptyState icon="🗓️" title="Nothing scheduled" message="No classes, deadlines or events on this day." /> : selectedEvents.map((e) => (
                    <div className="agenda-item" key={e.id}>
                      <div style={{ fontSize: 22 }}>{CALENDAR_TYPE_META[e.type].em}</div>
                      <div>
                        <strong style={{ fontSize: 14 }}>{e.title}</strong>
                        <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{e.time} · {CALENDAR_TYPE_META[e.type].label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="dash-card">
                <h3>Upcoming</h3>
                {upcoming.map((e) => {
                  const d = new Date(e.date)
                  return (
                    <div className="agenda-item" key={e.id}>
                      <div className="agenda-date">
                        <div className="ad-day">{d.getDate()}</div>
                        <div className="ad-mon">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                      </div>
                      <div>
                        <strong style={{ fontSize: 13.5 }}>{e.title}</strong>
                        <div style={{ color: 'var(--muted)', fontSize: 12 }}>{e.time} · {CALENDAR_TYPE_META[e.type].label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
