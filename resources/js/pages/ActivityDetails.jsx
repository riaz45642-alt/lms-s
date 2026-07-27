import { useEffect, useMemo } from 'react'
import { useRouter, Link } from '../router/Router'
import { useApp } from '../context/AppContext'
import { ALL_ACTIVITIES } from '../data/activitiesData'
import { FavoriteButton, EmptyState } from '../components/ui/UI'
import './pages.css'

export default function ActivityDetails({ activityId }) {
  const { navigate } = useRouter()
  const { favorites, toggleFavorite, addRecentlyViewed } = useApp()
  const activity = ALL_ACTIVITIES.find((a) => a.id === activityId)

  useEffect(() => {
    if (activity) addRecentlyViewed(activity.title)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId])

  const related = useMemo(() => {
    if (!activity) return []
    return ALL_ACTIVITIES.filter((a) => a.subject === activity.subject && a.id !== activity.id).slice(0, 4)
  }, [activity])

  if (!activity) {
    return (
      <div className="page-section">
        <div className="wrap">
          <EmptyState icon="🧩" title="Activity not found" message="This activity may have been removed or the link is incorrect." actionLabel="Back to activities" onAction={() => navigate('/activities')} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-section">
      <div className="wrap">
        <div className="breadcrumb">
          <Link to="/activities">Activities</Link> / {activity.subject} / {activity.title}
        </div>

        <div className="detail-layout">
          <div className="detail-preview">
            <div className="preview-surface">{activity.em}</div>
            <div className="preview-actions">
              <a className="btn btn-primary" href="#how-it-works">Play now</a>
              <a className="btn btn-ghost" href="#how-it-works">Preview</a>
              <FavoriteButton active={favorites.includes(activity.title)} onClick={() => toggleFavorite(activity.title)} />
            </div>
          </div>

          <div className="detail-info">
            <span className={`badge ${activity.badge === 'free' ? 'free' : 'prem'}`} style={{ position: 'static', display: 'inline-block', marginBottom: 12 }}>
              {activity.badge === 'free' ? 'Free' : 'Premium'}
            </span>
            <h1>{activity.title}</h1>
            <div className="meta-row">
              <span className="meta-pill">Subject: {activity.subject}</span>
              <span className="meta-pill">Takes about {activity.minutes} minutes</span>
            </div>
            <p className="desc">{activity.summary}</p>
            <div className="detail-cta">
              <a className="btn btn-primary" href="#how-it-works">Play now</a>
              <button className="btn btn-ghost" onClick={() => navigate('/activities')}>Back to activities</button>
            </div>
          </div>
        </div>

        <div className="sec-head related-heading" id="how-it-works"><h2>How it works</h2></div>
        <ul className="chapter-list numbered">
          {activity.steps.map((s, i) => (
            <li key={s}><span><span className="num">{String(i + 1).padStart(2, '0')}</span>{s}</span></li>
          ))}
        </ul>

        {related.length > 0 && (
          <>
            <div className="sec-head related-heading">
              <h2>Related activities</h2>
            </div>
            <div className="grid-cards">
              {related.map((a) => (
                <div className="wcard" key={a.id} onClick={() => navigate(`/activities/${a.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="wthumb" style={{ background: a.badge === 'free' ? '#F1ECFE' : '#FFE9D8' }}>
                    <span className="wbrand">EduSphere</span>
                    <span className={`badge ${a.badge === 'free' ? 'free' : 'prem'}`}>{a.badge === 'free' ? 'Free' : 'Premium'}</span>
                    <span style={{ fontSize: '42px' }}>{a.em}</span>
                  </div>
                  <div className="wbody">
                    <h4>{a.title}</h4>
                    <div className="wmeta"><span className="lvl">{a.subject} · {a.minutes} min</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
