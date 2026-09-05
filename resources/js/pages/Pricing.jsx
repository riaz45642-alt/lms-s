import { useEffect, useState } from 'react'
import { useRouter } from '../router/Router'
import { pricingFaqs } from '../data/pricingData'
import { PageHero } from '../components/ui/UI'
import Reveal from '../components/Reveal'
import { useApp } from '../context/AppContext'
import api, { errorMessage } from '../services/api'
import './pages.css'

export default function Pricing() {
  const { navigate } = useRouter()
  const { user } = useApp()
  const [openFaq, setOpenFaq] = useState(0)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/billing/plans')
      .then(({ data }) => { if (active) setPlans(data) })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <>
      <PageHero eyebrow="Simple, transparent pricing" title="Plans for every kind of learner" subtitle="Full access to worksheets, workbooks and interactive courses. Cancel anytime." />
      <div className="page-section tight">
        <div className="wrap">
          {loading && <p role="status">Loading current plans...</p>}
          {error && <div className="portal-error" role="alert">{error}</div>}

          <Reveal className="plans-grid" stagger>
            {plans.map((plan, index) => {
              const highlight = index === 1
              const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || [])
              return (
                <div className={`plan-card${highlight ? ' highlight' : ''}`} key={plan.id}>
                  {highlight && <span className="plan-ribbon">Most popular</span>}
                  <div className="plan-em">{['🌱', '🚀', '🏡'][index % 3]}</div>
                  <h3>{plan.name}</h3>
                  <div className="plan-tagline">{plan.description}</div>
                  <div className="plan-price">
                    <span className="amt">{new Intl.NumberFormat(undefined, { style: 'currency', currency: plan.currency }).format(plan.price_cents / 100)}</span>
                    <span className="per">/ {plan.interval}</span>
                  </div>
                  <ul className="plan-features">
                    {features.map((f) => (
                      <li key={f}><span className="tick">✓</span>{f}</li>
                    ))}
                  </ul>
                  <button
                    className={`btn ${highlight ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => navigate(user ? '/billing' : '/signup')}
                  >
                    Choose {plan.name}
                  </button>
                </div>
              )
            })}
          </Reveal>

          <Reveal><div className="sec-head related-heading"><h2>Pricing questions</h2></div></Reveal>
          <Reveal className="acc" style={{ maxWidth: 780 }}>
            {pricingFaqs.map((item, i) => (
              <div className={`acc-item${openFaq === i ? ' open' : ''}`} key={item.q}>
                <button className="acc-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{item.q}</button>
                <div className="acc-a" style={{ maxHeight: openFaq === i ? '300px' : '0' }}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal className="help-support-card">
            <div>
              <h3>Still not sure which plan is right?</h3>
              <p>Our team can help you pick the best fit for your family, classroom or school.</p>
            </div>
            <button className="btn btn-gold" onClick={() => navigate('/help')}>Talk to us</button>
          </Reveal>
        </div>
      </div>
    </>
  )
}
