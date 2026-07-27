import { useState } from 'react'
import { useRouter } from '../router/Router'
import { pricingPlans, pricingFaqs } from '../data/pricingData'
import { PageHero } from '../components/ui/UI'
import './pages.css'

export default function Pricing() {
  const { navigate } = useRouter()
  const [annual, setAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <>
      <PageHero eyebrow="Simple, transparent pricing" title="Plans for every kind of learner" subtitle="Full access to worksheets, workbooks and interactive courses. Cancel anytime." />
      <div className="page-section tight">
        <div className="wrap">
          <div className="billing-toggle">
            <span className={!annual ? 'on' : ''}>Monthly</span>
            <button
              type="button"
              className={`billing-switch${annual ? ' annual' : ''}`}
              aria-pressed={annual}
              aria-label="Toggle annual billing"
              onClick={() => setAnnual((a) => !a)}
            >
              <span className="knob" />
            </button>
            <span className={annual ? 'on' : ''}>Annual</span>
            {annual && <span className="save-pill">Save up to 35%</span>}
          </div>

          <div className="plans-grid">
            {pricingPlans.map((plan) => {
              const price = annual ? plan.annual : plan.monthly
              return (
                <div className={`plan-card${plan.highlight ? ' highlight' : ''}`} key={plan.key}>
                  {plan.highlight && <span className="plan-ribbon">Most popular</span>}
                  <div className="plan-em">{plan.em}</div>
                  <h3>{plan.title}</h3>
                  <div className="plan-tagline">{plan.tagline}</div>
                  <div className="plan-price">
                    <span className="amt">${price.toFixed(2)}</span>
                    <span className="per">/ month, billed {annual ? 'annually' : 'monthly'}</span>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((f) => (
                      <li key={f}><span className="tick">✓</span>{f}</li>
                    ))}
                  </ul>
                  <button
                    className={`btn ${plan.highlight ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => navigate('/signup')}
                  >
                    Choose {plan.title}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="sec-head related-heading"><h2>Pricing questions</h2></div>
          <div className="acc" style={{ maxWidth: 780 }}>
            {pricingFaqs.map((item, i) => (
              <div className={`acc-item${openFaq === i ? ' open' : ''}`} key={item.q}>
                <button className="acc-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{item.q}</button>
                <div className="acc-a" style={{ maxHeight: openFaq === i ? '300px' : '0' }}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="help-support-card">
            <div>
              <h3>Still not sure which plan is right?</h3>
              <p>Our team can help you pick the best fit for your family, classroom or school.</p>
            </div>
            <button className="btn btn-gold" onClick={() => navigate('/help')}>Talk to us</button>
          </div>
        </div>
      </div>
    </>
  )
}
