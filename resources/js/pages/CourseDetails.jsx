import { useEffect, useMemo } from 'react'
import { useRouter, Link } from '../router/Router'
import { useApp } from '../context/AppContext'
import { ALL_COURSES } from '../data/coursesData'
import { FavoriteButton, EmptyState } from '../components/ui/UI'
import './pages.css'

export default function CourseDetails({ courseId }) {
  const { navigate } = useRouter()
  const { favorites, toggleFavorite, addRecentlyViewed } = useApp()
  const course = ALL_COURSES.find((c) => c.id === courseId)

  useEffect(() => {
    if (course) addRecentlyViewed(course.title)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  const related = useMemo(() => {
    if (!course) return []
    return ALL_COURSES.filter((c) => c.subject === course.subject && c.id !== course.id).slice(0, 4)
  }, [course])

  if (!course) {
    return (
      <div className="page-section">
        <div className="wrap">
          <EmptyState icon="🎮" title="Course not found" message="This course may have been removed or the link is incorrect." actionLabel="Back to courses" onAction={() => navigate('/courses')} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-section">
      <div className="wrap">
        <div className="breadcrumb">
          <Link to="/courses">Courses</Link> / {course.subject} / {course.title}
        </div>

        <div className="detail-layout">
          <div className="detail-preview">
            <div className="preview-surface">{course.em}</div>
            <div className="preview-actions">
              <button className="btn btn-primary" onClick={() => navigate(`/learning/${course.id}`)}>{course.progress > 0 ? 'Continue learning' : 'Start course'}</button>
              <button className="btn btn-ghost">Preview</button>
              <FavoriteButton active={favorites.includes(course.title)} onClick={() => toggleFavorite(course.title)} />
            </div>
          </div>

          <div className="detail-info">
            <span className={`badge ${course.badge === 'free' ? 'free' : 'prem'}`} style={{ position: 'static', display: 'inline-block', marginBottom: 12 }}>
              {course.badge === 'free' ? 'Free' : 'Premium'}
            </span>
            <h1>{course.title}</h1>
            <div className="meta-row">
              <span className="meta-pill">Subject: {course.subject}</span>
              <span className="meta-pill level-pill">{course.level}</span>
              <span className="meta-pill">{course.lessons} lessons · {course.duration}</span>
              <span className="meta-pill">👤 {course.instructor}</span>
              <span className="meta-pill">⭐ {course.rating} · {course.students} students</span>
            </div>
            <p className="desc">{course.summary} Progress is saved automatically, so learners can pick up right where they left off.</p>
            <div className="detail-cta">
              <button className="btn btn-primary" onClick={() => navigate(`/learning/${course.id}`)}>{course.progress > 0 ? 'Continue learning' : 'Start course'}</button>
              <button className="btn btn-ghost" onClick={() => navigate('/courses')}>Back to courses</button>
            </div>
          </div>
        </div>

        <div className="sec-head related-heading"><h2>Course syllabus</h2></div>
        <ul className="chapter-list numbered">
          {course.syllabus.map((s, i) => (
            <li key={s}><span><span className="num">{String(i + 1).padStart(2, '0')}</span>{s}</span></li>
          ))}
        </ul>

        {related.length > 0 && (
          <>
            <div className="sec-head related-heading">
              <h2>Related courses</h2>
            </div>
            <div className="grid-cards">
              {related.map((c) => (
                <div className="wcard" key={c.id} onClick={() => navigate(`/courses/${c.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="wthumb" style={{ background: c.badge === 'free' ? '#eef6fe' : '#fff7e6' }}>
                    <span className="wbrand">EduSphere</span>
                    <span className={`badge ${c.badge === 'free' ? 'free' : 'prem'}`}>{c.badge === 'free' ? 'Free' : 'Premium'}</span>
                    <span style={{ fontSize: '42px' }}>{c.em}</span>
                  </div>
                  <div className="wbody">
                    <h4>{c.title}</h4>
                    <div className="wmeta"><span className="lvl">{c.level} · {c.lessons} lessons</span></div>
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
