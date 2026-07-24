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

export function ErrorState({ title = 'Something went wrong', message = 'We couldn\'t load this content. Please try again.', onRetry }) {
  return (
    <div className="empty-state error-state">
      <div className="empty-em">⚠️</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && <button className="btn btn-ghost" onClick={onRetry}>Try again</button>}
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

export function StatCard({ em, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-em">{em}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="wcard" style={{ padding: 20 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
          <Skeleton className="skel-line" style={{ width: '30%' }} />
          <Skeleton className="skel-line" style={{ width: '20%' }} />
          <Skeleton className="skel-line" style={{ width: '15%' }} />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="dash-card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Skeleton className="skel-thumb" style={{ width: 44, height: 44, borderRadius: 12 }} />
          <div style={{ flex: 1 }}>
            <Skeleton className="skel-line" style={{ width: '60%' }} />
            <Skeleton className="skel-line" style={{ width: '35%', marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="wrap">
      <Skeleton className="skel-line" style={{ width: 260, height: 90, borderRadius: 16, marginBottom: 30 }} />
      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="skel-line" style={{ height: 100, borderRadius: 16 }} />)}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="profile-layout">
      <Skeleton className="skel-line" style={{ height: 300, borderRadius: 16 }} />
      <Skeleton className="skel-line" style={{ height: 300, borderRadius: 16 }} />
    </div>
  )
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Badge({ children, tone = 'blue' }) {
  return <span className={`ui-badge tone-${tone}`}>{children}</span>
}

export function StatusChip({ status }) {
  const MAP = {
    pending: { label: 'Pending', tone: 'gold' },
    submitted: { label: 'Submitted', tone: 'blue' },
    graded: { label: 'Graded', tone: 'green' },
    late: { label: 'Late', tone: 'red' },
    completed: { label: 'Completed', tone: 'green' },
    'in-progress': { label: 'In progress', tone: 'blue' },
    'not-started': { label: 'Not started', tone: 'gray' },
  }
  const m = MAP[status] || { label: status, tone: 'gray' }
  return <Badge tone={m.tone}>{m.label}</Badge>
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal-head">
          <h3>{title}</h3>
          <button className="ui-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="ui-modal-body">{children}</div>
        {footer && <div className="ui-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title = 'Are you sure?', message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={(
        <>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </>
      )}
    >
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>{message}</p>
    </Modal>
  )
}

export function ProgressRing({ value = 0, size = 96, stroke = 10, label, color = 'var(--blue)' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sky)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="progress-ring-label">
        <strong>{value}%</strong>
        {label && <span>{label}</span>}
      </div>
    </div>
  )
}

export function BarChart({ data, valueKey = 'value', labelKey = 'label', max, height = 160, color = 'var(--blue)', suffix = '' }) {
  const m = max || Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d) => (
        <div className="bar-col" key={d[labelKey]}>
          <div className="bar-track">
            <div className="bar-fill" style={{ height: `${(d[valueKey] / m) * 100}%`, background: color }} title={`${d[valueKey]}${suffix}`} />
          </div>
          <span className="bar-label">{d[labelKey]}</span>
        </div>
      ))}
    </div>
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
