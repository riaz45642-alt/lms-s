import { useMemo, useState } from 'react'
import { faqs } from '../data/faqData'
import { PageHero } from '../components/ui/UI'
import './pages.css'

const CATEGORIES = [
  { key: 'account', em: '👤', title: 'Account & billing' },
  { key: 'resources', em: '📄', title: 'Worksheets & activities' },
  { key: 'technical', em: '🛠️', title: 'Technical support' },
]

export default function Help() {
  const [query, setQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(0)

  const filtered = useMemo(() => {
    if (!query) return faqs
    return faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()))
  }, [query])

  return (
    <>
      <PageHero eyebrow="We're here to help" title="Help centre" subtitle="Search our knowledge base or browse a category to find quick answers.">
        <div className="search-lg" style={{ maxWidth: 480, margin: '22px auto 0' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
          <input placeholder="Search for help…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </PageHero>
      <div className="page-section tight">
        <div className="wrap">
          <div className="help-cats">
            {CATEGORIES.map((c) => (
              <div className="help-cat" key={c.key} onClick={() => setQuery('')}>
                <div className="hc-em">{c.em}</div>
                <h4>{c.title}</h4>
              </div>
            ))}
          </div>

          <div className="sec-head related-heading"><h2>Frequently asked questions</h2></div>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>No results for "{query}" — try a different search term or contact us below.</p>
          ) : (
            <div className="acc" style={{ maxWidth: 780 }}>
              {filtered.map((item) => {
                const i = faqs.indexOf(item)
                return (
                  <div className={`acc-item${openFaq === i ? ' open' : ''}`} key={item.q}>
                    <button className="acc-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{item.q}</button>
                    <div className="acc-a" style={{ maxHeight: openFaq === i ? '300px' : '0' }}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="help-support-card">
            <div>
              <h3>Can't find what you're looking for?</h3>
              <p>Our support team typically replies within one business day.</p>
            </div>
            <a className="btn btn-gold" href="mailto:support@edusphere.co">Contact support</a>
          </div>
        </div>
      </div>
    </>
  )
}
