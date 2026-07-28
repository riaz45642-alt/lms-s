import './LearnMore.css'

const cards = [
  { ic: '📝', tint: '#F1ECFE', accent: '#6C4CF1', title: 'How to register', desc: 'A quick guide for families on signing up and logging in.', link: 'Read more', href: '#' },
  { ic: '🎥', tint: '#FFE9D8', accent: '#FF8A3D', title: 'How students use EduSphere', desc: 'A short video guide to help students navigate the worksheet library.', link: 'Watch now', href: '#' },
  { ic: '❓', tint: '#E3F7EA', accent: '#1f9d57', title: 'Have any questions?', desc: 'Visit the EduSphere Knowledge Base for comprehensive answers.', link: 'Visit help desk', href: '#' },
  { ic: '🚀', tint: '#FFE3E3', accent: '#E0554A', title: "Let's get started!", desc: "If you love what you see, it's time to go premium and unlock everything.", link: 'Subscribe', href: '#pricing' },
]

// Deliberately not another card grid — a scannable resource rail, styled
// like a compact reference list so it reads as "quick jumps" rather than
// yet another set of white boxes.
export default function LearnMore() {
  return (
    <section className="learn">
      <div className="wrap">
        <div className="sec-head"><h2>Want to learn more about EduSphere?</h2></div>
        <div className="lrail">
          {cards.map((c, i) => (
            <a className="lrow" href={c.href} key={c.title} style={{ '--accent': c.accent }}>
              <span className="lrow-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="lrow-ic" style={{ background: c.tint }}>{c.ic}</span>
              <span className="lrow-body">
                <b>{c.title}</b>
                <span>{c.desc}</span>
              </span>
              <span className="lrow-cta">{c.link} <i>→</i></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
