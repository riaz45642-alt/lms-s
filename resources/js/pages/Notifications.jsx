import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { PageHero, EmptyState } from '../components/ui/UI'
import './pages.css'

const TYPE_ICON = { worksheet: '📄', event: '🗓️', registration: '✅', system: '⚙️' }
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'worksheet', label: 'Worksheets' },
  { key: 'event', label: 'Events' },
  { key: 'registration', label: 'Registrations' },
  { key: 'system', label: 'System' },
]

export default function Notifications() {
  const { notifications, markAllRead, markRead, unreadCount } = useApp()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter)

  return (
    <>
      <PageHero eyebrow="Stay updated" title="Notifications" subtitle="New worksheets, event updates, registration confirmations and system alerts." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="notif-top-actions">
            <div className="filter-group">
              {FILTERS.map((f) => (
                <button key={f.key} className={`filter-chip${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
              ))}
            </div>
            {unreadCount > 0 && <button className="btn btn-ghost" onClick={markAllRead}>Mark all as read</button>}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="🔔" title="No notifications" message="You're all caught up here." />
          ) : (
            <div className="notif-list">
              {filtered.map((n) => (
                <div key={n.id} className={`notif-item${n.read ? '' : ' unread'}`} onClick={() => markRead(n.id)}>
                  {!n.read && <span className="dot-unread" />}
                  <div className="notif-icon">{TYPE_ICON[n.type] || '🔔'}</div>
                  <div className="notif-body">
                    <h4>{n.title}</h4>
                    <p>{n.body}</p>
                  </div>
                  <span className="notif-time">{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
