import { useState } from 'react'
import { faqs } from '../data/faqData'
import './Faq.css'

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="faq" id="faq">
      <div className="wrap faq-grid">
        <div className="faq-intro">
          <span className="eyebrow">Got questions?</span>
          <h2>Frequently asked questions</h2>
          <p>Can't find the answer you're looking for? Reach out to our support team and we'll get back to you within one business day.</p>
          <a className="btn btn-ghost" href="mailto:support@edusphere.co">Email support</a>
        </div>
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
