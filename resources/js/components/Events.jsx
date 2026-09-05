import { useEffect, useState } from 'react'
import api from '../services/api'
import './Events.css'

export default function Events() {
  const [eventStrip,setEvents]=useState([])
  useEffect(()=>{let active=true;api.get('/events').then(({data})=>active&&setEvents(data)).catch(()=>{});return()=>{active=false}},[])
  const featured=eventStrip[0]
  const icon=(type)=>({deadline:'⏳',assignment:'📝',class:'📚',event:'🎈'}[type]||'📅')
  return (
    <section className="events">
      <div className="wrap">
        <div className="sec-head">
          <h2>Upcoming EduSphere events</h2>
          <p>Stay connected to scheduled learning events and important dates.</p>
        </div>
        <div className="ev-strip">
          {eventStrip.map((e) => (
            <div className="ev" key={e.id}>
              <div className="em">{icon(e.event_type)}</div>
              <div className="d">{new Date(e.starts_at).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</div>
              <div className="t">{e.title}</div>
            </div>
          ))}
        </div>
        {featured&&<div className="ev-feat">
          <div>
            <span className="tag">Next event · {new Date(featured.starts_at).toLocaleDateString()}</span>
            <h3>{featured.title}</h3>
            <p>{featured.description||'More event details will be shared soon.'}</p>
          </div>
          <div className="ev-sheets">
            <div className="mini"><div className="mt">📝</div><b>Syllables</b></div>
            <div className="mini"><div className="mt">🔍</div><b>Word Search</b></div>
            <div className="mini"><div className="mt">❓</div><b>Quiz Sheet</b></div>
          </div>
        </div>}
      </div>
    </section>
  )
}
