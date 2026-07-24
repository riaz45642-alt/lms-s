import './Events.css'

const eventStrip = [
  { em: "🎈", d: "5th June", t: "Hot Air Balloon Day" },
  { em: "🌱", d: "5th June", t: "World Environment Day" },
  { em: "🌊", d: "8th June", t: "World Ocean Day" },
  { em: "📔", d: "12th June", t: "Anne Frank Day" },
  { em: "👨‍👧", d: "15th June", t: "Father's Day" }
]

export default function Events() {
  return (
    <section className="events">
      <div className="wrap">
        <div className="sec-head">
          <h2>June's teaching worksheets for parents and teachers</h2>
          <p>Stay connected to current events and use our themed worksheets in your classroom.</p>
        </div>
        <div className="ev-strip">
          {eventStrip.map((e) => (
            <div className="ev" key={e.t}>
              <div className="em">{e.em}</div>
              <div className="d">{e.d}</div>
              <div className="t">{e.t}</div>
            </div>
          ))}
        </div>
        <div className="ev-feat">
          <div>
            <span className="tag">Featured event · 15 June</span>
            <h3>Father's Day worksheet bundle</h3>
            <p>Honour and appreciate fathers and father figures with this themed bundle of printable activities and reading sheets.</p>
            <a className="btn btn-primary" href="#">Download bundle</a>
          </div>
          <div className="ev-sheets">
            <div className="mini"><div className="mt">📝</div><b>Syllables</b></div>
            <div className="mini"><div className="mt">🔍</div><b>Word Search</b></div>
            <div className="mini"><div className="mt">❓</div><b>Quiz Sheet</b></div>
          </div>
        </div>
      </div>
    </section>
  )
}
