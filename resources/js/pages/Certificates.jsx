import { useEffect, useState } from 'react'
import { useRouter } from '../router/Router'
import { certificatesData } from '../data/lmsData'
import { PageHero, EmptyState, CardSkeleton } from '../components/ui/UI'
import './pages.css'
import './lms.css'

export default function Certificates() {
  const { navigate } = useRouter()
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t) }, [])

  return (
    <>
      <PageHero eyebrow="Your achievements" title="Certificates" subtitle="Every course you complete earns you a certificate you can preview or download." />
      <div className="page-section tight">
        <div className="wrap">
          {loading ? (
            <div className="grid-cards">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : certificatesData.length === 0 ? (
            <EmptyState icon="🏆" title="No certificates yet" message="Complete a course to earn your first certificate." actionLabel="Browse courses" onAction={() => navigate('/courses')} />
          ) : (
            <div className="grid-cards">
              {certificatesData.map((c) => (
                <div className="cert-card" key={c.id}>
                  <span className="cert-grade">{c.grade}</span>
                  <div className="cert-ribbon">🏅</div>
                  <h4>{c.course}</h4>
                  <div className="cert-date">Completed {c.date}</div>
                  <div className="cert-actions">
                    <button className="btn btn-ghost">Preview</button>
                    <button className="btn btn-primary">Download</button>
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
