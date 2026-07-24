import { useState } from 'react'
import { useRouter, Link } from '../router/Router'
import { eventsData } from '../data/appData'
import { PageHero, EmptyState } from '../components/ui/UI'
import './pages.css'

export default function EventsPage({ eventId }) {
  const { navigate } = useRouter()
  const [registered, setRegistered] = useState([])
  const event = eventId ? eventsData.find((e) => e.id === eventId) : null

  if (event) {
    const isRegistered = registered.includes(event.id)
    return (
      <div className="page-section">
        <div className="wrap">
          <div className="breadcrumb"><Link to="/events">Events</Link> / {event.title}</div>
          <div className="detail-layout">
            <div className="detail-preview">
              <div className="preview-surface">{event.em}</div>
            </div>
            <div className="detail-info">
              <span className="meta-pill">{event.date}</span>
              <h1 style={{ marginTop: 12 }}>{event.title}</h1>
              <p className="desc">{event.desc}</p>
              <div className="meta-row">
                <span className="meta-pill">📍 {event.location}</span>
              </div>
              <div className="detail-cta">
                <button
                  className={`btn ${isRegistered ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => setRegistered((r) => (isRegistered ? r.filter((id) => id !== event.id) : [...r, event.id]))}
                >
                  {isRegistered ? '✓ Registered' : 'Register now'}
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/events')}>Back to events</button>
              </div>
            </div>
          </div>

          <div className="sec-head related-heading"><h2>Event schedule</h2></div>
          <ul className="schedule-list" style={{ maxWidth: 620, margin: '0 auto' }}>
            {event.schedule.map(([time, item]) => (
              <li key={time}><span className="sched-time">{time}</span><span>{item}</span></li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHero eyebrow="What's on" title="Events" subtitle="Themed classroom events with schedules, resources and easy registration." />
      <div className="page-section tight">
        <div className="wrap">
          {eventsData.length === 0 ? (
            <EmptyState title="No events scheduled" message="Check back soon for upcoming events." />
          ) : (
            <div className="grid-cards">
              {eventsData.map((e) => (
                <div className="event-card" key={e.id} onClick={() => navigate(`/events/${e.id}`)}>
                  <div className="ec-top">
                    <span className="ec-em">{e.em}</span>
                    <span className="ec-date">{e.date}</span>
                  </div>
                  <div className="ec-body">
                    <h4>{e.title}</h4>
                    <p>{e.desc}</p>
                    <button className="btn btn-primary" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={(ev) => { ev.stopPropagation(); navigate(`/events/${e.id}`) }}>
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
