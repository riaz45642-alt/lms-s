import './UI.css'

export function Skeleton({ className = '', style }) {
  return <div className={`skel ${className}`} style={style} />
}

export function CardSkeleton() {
  return (
    <div className="wcard skel-card">
      <Skeleton className="skel-thumb" />
      <div className="wbody">
        <Skeleton className="skel-line" style={{ width: '80%' }} />
        <Skeleton className="skel-line" style={{ width: '50%', marginTop: 10 }} />
      </div>
    </div>
  )
}

export function EmptyState({ icon = '📭', title = 'Nothing here yet', message = 'There\'s no content to show right now.', actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-em">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && (
        <button className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">‹</button>
      {pages.map((p) => (
        <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="page-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">›</button>
    </div>
  )
}

export function FavoriteButton({ active, onClick }) {
  return (
    <button
      type="button"
      className={`fav-btn${active ? ' active' : ''}`}
      onClick={onClick}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
    >
      {active ? '★' : '☆'}
    </button>
  )
}

export function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}
