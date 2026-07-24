import { popularPacks } from '../data/popularData'
import './Popular.css'

export default function Popular() {
  return (
    <section className="popular" id="popular">
      <div className="wrap">
        <div className="sec-head">
          <h2>Popular worksheet packs</h2>
          <p>Connect your students and engage them with our most-downloaded worksheet collections.</p>
        </div>
        <div className="pgrid">
          {popularPacks.map((p) => (
            <div className="pcard" style={{ background: p.bg }} key={p.title}>
              <span className="em">{p.em}</span>
              <span className="yr">{p.yr}</span>
              <h4>{p.title}</h4>
              <small>{p.count}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
