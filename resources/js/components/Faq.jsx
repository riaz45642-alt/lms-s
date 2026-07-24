import { useState } from 'react'
import { faqs } from '../data/faqData'
import './Faq.css'

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <h2>Frequently asked questions</h2>
        <div className="acc">
          {faqs.map((item, i) => (
            <div className={`acc-item${openIndex === i ? ' open' : ''}`} key={item.q}>
              <button className="acc-q" onClick={() => setOpenIndex(openIndex === i ? -1 : i)}>
                {item.q}
              </button>
              <div className="acc-a" style={{ maxHeight: openIndex === i ? '300px' : '0' }}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
