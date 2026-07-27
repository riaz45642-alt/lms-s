import { useState } from 'react'
import { titles, thumbs, years, subjects } from '../data/worksheetsData'
import './Featured.css'

export default function Featured() {
  const [curYear, setCurYear] = useState('Early Years')
  const [curSubj, setCurSubj] = useState('Maths')

  const list = titles[curSubj] || []
  const emoji = thumbs[curSubj]

  return (
    <section className="featured" id="featured">
      <div className="wrap">
        <div className="sec-head">
          <h2>Featured worksheets</h2>
          <p>Easily download, print, score and track progress with our curated selection.</p>
        </div>
        <a className="btn btn-primary free-cta" href="#">Get free access</a>

        <div className="year-tabs">
          {years.map((y) => (
            <button
              key={y}
              className={`year-tab${curYear === y ? ' active' : ''}`}
              onClick={() => setCurYear(y)}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="feat-layout">
          <div className="subj-list">
            {subjects.map((s) => (
              <div
                key={s}
                className={`subj${curSubj === s ? ' active' : ''}`}
                onClick={() => setCurSubj(s)}
              >
                {s} <span className="chev">›</span>
              </div>
            ))}
          </div>

          <div className="cards">
            {list.map(([t, b]) => (
              <div className="wcard" key={t}>
                <div className="wthumb" style={{ background: b === 'free' ? '#F1ECFE' : '#FFE9D8' }}>
                  <span className="wbrand">EduSphere</span>
                  <span className={`badge ${b === 'free' ? 'free' : 'prem'}`}>{b === 'free' ? 'Free' : 'Premium'}</span>
                  <span style={{ fontSize: '42px' }}>{emoji}</span>
                </div>
                <div className="wbody">
                  <h4>{t}</h4>
                  <div className="wmeta">
                    <span className="lvl">{curYear} · {curSubj}</span>
                    <span className="pdf"><i>PDF</i></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
