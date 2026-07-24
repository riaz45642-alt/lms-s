import { useState } from 'react'
import { useRouter } from '../router/Router'
import { ALL_COURSES } from '../data/coursesData'
import { wishlistIds } from '../data/lmsData'
import { PageHero, EmptyState } from '../components/ui/UI'
import './pages.css'
import './lms.css'

export default function Wishlist() {
  const { navigate } = useRouter()
  const [ids, setIds] = useState(wishlistIds)
  const courses = ids.map((id) => ALL_COURSES.find((c) => c.id === id)).filter(Boolean)

  return (
    <>
      <PageHero eyebrow="Saved for later" title="Wishlist" subtitle="Courses you've saved to start when you're ready." />
      <div className="page-section tight">
        <div className="wrap">
          {courses.length === 0 ? (
            <EmptyState icon="💙" title="Your wishlist is empty" message="Save courses you're interested in and they'll show up here." actionLabel="Browse courses" onAction={() => navigate('/courses')} />
          ) : (
            <div className="grid-cards">
              {courses.map((c) => (
                <div className="wcard" key={c.id}>
                  <div className="wthumb" style={{ background: c.badge === 'free' ? '#eef6fe' : '#fff7e6', cursor: 'pointer' }} onClick={() => navigate(`/courses/${c.id}`)}>
                    <span className="wbrand">EduSphere</span>
                    <span className={`badge ${c.badge === 'free' ? 'free' : 'prem'}`}>{c.badge === 'free' ? 'Free' : 'Premium'}</span>
                    <span style={{ fontSize: 42 }}>{c.em}</span>
                  </div>
                  <div className="wbody">
                    <h4 style={{ cursor: 'pointer' }} onClick={() => navigate(`/courses/${c.id}`)}>{c.title}</h4>
                    <div className="course-meta-row"><span>⭐ {c.rating}</span><span>👥 {c.students}</span></div>
                    <div className="wcard-actions">
                      <button className="btn btn-primary" onClick={() => navigate(`/learning/${c.id}`)}>Continue learning</button>
                      <button className="btn btn-ghost" onClick={() => setIds((l) => l.filter((x) => x !== c.id))}>Remove</button>
                    </div>
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
