import { useEffect, useMemo } from 'react'
import { useRouter, Link } from '../router/Router'
import { useApp } from '../context/AppContext'
import { ALL_WORKSHEETS } from '../data/worksheetsData'
import { FavoriteButton, EmptyState } from '../components/ui/UI'
import './pages.css'

export default function WorksheetDetails({ worksheetId }) {
  const { navigate } = useRouter()
  const { favorites, toggleFavorite, addRecentlyViewed, addRecentlyDownloaded } = useApp()
  const worksheet = ALL_WORKSHEETS.find((w) => w.id === worksheetId)

  useEffect(() => {
    if (worksheet) addRecentlyViewed(worksheet.title)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worksheetId])

  const related = useMemo(() => {
    if (!worksheet) return []
    return ALL_WORKSHEETS.filter((w) => w.subject === worksheet.subject && w.id !== worksheet.id).slice(0, 4)
  }, [worksheet])

  if (!worksheet) {
    return (
      <div className="page-section">
        <div className="wrap">
          <EmptyState icon="📄" title="Worksheet not found" message="This worksheet may have been removed or the link is incorrect." actionLabel="Back to worksheets" onAction={() => navigate('/worksheets')} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-section">
      <div className="wrap">
        <div className="breadcrumb">
          <Link to="/worksheets">Worksheets</Link> / {worksheet.subject} / {worksheet.title}
        </div>

        <div className="detail-layout">
          <div className="detail-preview">
            <div className="preview-surface">{worksheet.em}</div>
            <div className="preview-actions">
              <button className="btn btn-primary" onClick={() => addRecentlyDownloaded(worksheet.title)}>Download PDF</button>
              <button className="btn btn-ghost">Preview</button>
              <FavoriteButton active={favorites.includes(worksheet.title)} onClick={() => toggleFavorite(worksheet.title)} />
            </div>
          </div>

          <div className="detail-info">
            <span className={`badge ${worksheet.badge === 'free' ? 'free' : 'prem'}`} style={{ position: 'static', display: 'inline-block', marginBottom: 12 }}>
              {worksheet.badge === 'free' ? 'Free' : 'Premium'}
            </span>
            <h1>{worksheet.title}</h1>
            <div className="meta-row">
              <span className="meta-pill">Subject: {worksheet.subject}</span>
              <span className="meta-pill">Grade: {worksheet.year}</span>
              <span className="meta-pill">Difficulty: {worksheet.difficulty}</span>
            </div>
            <p className="desc">
              A curriculum-aligned {worksheet.subject.toLowerCase()} worksheet designed for {worksheet.year} learners.
              Includes clear instructions, engaging visuals and an answer key so it's ready to print and use in class
              or at home. Great for reinforcing core concepts through guided practice.
            </p>
            <div className="detail-cta">
              <button className="btn btn-primary" onClick={() => addRecentlyDownloaded(worksheet.title)}>Download worksheet</button>
              <button className="btn btn-ghost" onClick={() => navigate('/worksheets')}>Back to library</button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <>
            <div className="sec-head related-heading">
              <h2>Related worksheets</h2>
            </div>
            <div className="grid-cards">
              {related.map((w) => (
                <div className="wcard" key={w.id} onClick={() => navigate(`/worksheets/${w.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="wthumb" style={{ background: w.badge === 'free' ? '#F1ECFE' : '#FFE9D8' }}>
                    <span className="wbrand">EduSphere</span>
                    <span className={`badge ${w.badge === 'free' ? 'free' : 'prem'}`}>{w.badge === 'free' ? 'Free' : 'Premium'}</span>
                    <span style={{ fontSize: '42px' }}>{w.em}</span>
                  </div>
                  <div className="wbody">
                    <h4>{w.title}</h4>
                    <div className="wmeta"><span className="lvl">{w.year} · {w.subject}</span></div>
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
