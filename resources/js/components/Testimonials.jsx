import { useState, useEffect } from 'react'
import { testimonials } from '../data/testimonialsData'
import './Testimonials.css'

export default function Testimonials() {
  const [ti, setTi] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTi((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="testi">
      <div className="wrap">
        <div className="sec-head">
          <h2>Customer testimonials</h2>
          <p>Hear from parents and teachers who use EduSphere worksheets every week.</p>
        </div>
        <div className="tcarousel">
          {testimonials.map((t, i) => (
            <div className={`tslide${i === ti ? ' active' : ''}`} key={t.name}>
              <span className="tquote-mark" aria-hidden="true">&ldquo;</span>
              <div className="tslide-person">
                <div className="av">{t.initials}</div>
                <div><b>{t.name}</b><span>{t.role}</span></div>
              </div>
              <div className="tslide-body">
                <div className="stars">{t.stars}</div>
                <p>{t.quote}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="tdots">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              className={`tdot${i === ti ? ' active' : ''}`}
              aria-label={`Testimonial ${i + 1}`}
              onClick={() => setTi(i)}
            >
              {i === ti && <span className="tdot-progress" key={ti} />}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
