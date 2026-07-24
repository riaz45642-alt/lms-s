import { useEffect, useMemo } from 'react'
import { useRouter, Link } from '../router/Router'
import { useApp } from '../context/AppContext'
import { ALL_WORKBOOKS } from '../data/workbooksData'
import { FavoriteButton, EmptyState } from '../components/ui/UI'
import './pages.css'

export default function WorkbookDetails({ workbookId }) {
  const { navigate } = useRouter()
  const { favorites, toggleFavorite, addRecentlyViewed, addRecentlyDownloaded } = useApp()
  const workbook = ALL_WORKBOOKS.find((w) => w.id === workbookId)

  useEffect(() => {
    if (workbook) addRecentlyViewed(workbook.title)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workbookId])

  const related = useMemo(() => {
    if (!workbook) return []
    return ALL_WORKBOOKS.filter((w) => w.subject === workbook.subject && w.id !== workbook.id).slice(0, 4)
  }, [workbook])

  if (!workbook) {
    return (
      <div className="page-section">
        <div className="wrap">
          <EmptyState icon="📘" title="Workbook not found" message="This workbook may have been removed or the link is incorrect." actionLabel="Back to workbooks" onAction={() => navigate('/workbooks')} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-section">
      <div className="wrap">
        <div className="breadcrumb">
          <Link to="/workbooks">Workbooks</Link> / {workbook.subject} / {workbook.title}
        </div>

        <div className="detail-layout">
          <div className="detail-preview">
            <div className="preview-surface">{workbook.em}</div>
            <div className="preview-actions">
              <button className="btn btn-primary" onClick={() => addRecentlyDownloaded(workbook.title)}>Download workbook</button>
              <button className="btn btn-ghost">Preview</button>
              <FavoriteButton active={favorites.includes(workbook.title)} onClick={() => toggleFavorite(workbook.title)} />
            </div>
          </div>

          <div className="detail-info">
            <span className={`badge ${workbook.badge === 'free' ? 'free' : 'prem'}`} style={{ position: 'static', display: 'inline-block', marginBottom: 12 }}>
              {workbook.badge === 'free' ? 'Free' : 'Premium'}
            </span>
            <h1>{workbook.title}</h1>
            <div className="meta-row">
              <span className="meta-pill">Subject: {workbook.subject}</span>
              <span className="meta-pill">Grade: {workbook.year}</span>
              <span className="meta-pill">{workbook.weeks} weeks · {workbook.pageCount} pages</span>
            </div>
            <p className="desc">{workbook.summary} Each week builds on the last, with clear learning goals, guided examples and an answer key for every session.</p>
            <div className="detail-cta">
              <button className="btn btn-primary" onClick={() => addRecentlyDownloaded(workbook.title)}>Download workbook</button>
              <button className="btn btn-ghost" onClick={() => navigate('/workbooks')}>Back to workbooks</button>
            </div>
          </div>
        </div>

        <div className="sec-head related-heading"><h2>What's inside</h2></div>
        <ul className="chapter-list numbered">
          {workbook.chapters.map((c, i) => (
            <li key={c}><span><span className="num">{String(i + 1).padStart(2, '0')}</span>{c}</span></li>
          ))}
        </ul>

        {related.length > 0 && (
          <>
            <div className="sec-head related-heading">
              <h2>Related workbooks</h2>
            </div>
            <div className="grid-cards">
              {related.map((w) => (
                <div className="wcard" key={w.id} onClick={() => navigate(`/workbooks/${w.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="wthumb" style={{ background: w.badge === 'free' ? '#eef6fe' : '#fff7e6' }}>
                    <span className="wbrand">EduSphere</span>
                    <span className={`badge ${w.badge === 'free' ? 'free' : 'prem'}`}>{w.badge === 'free' ? 'Free' : 'Premium'}</span>
                    <span style={{ fontSize: '42px' }}>{w.em}</span>
                  </div>
                  <div className="wbody">
                    <h4>{w.title}</h4>
                    <div className="wmeta"><span className="lvl">{w.year} · {w.weeks} weeks</span></div>
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
