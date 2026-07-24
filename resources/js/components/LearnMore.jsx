import './LearnMore.css'

const cards = [
  { ic: "📝", title: "How to register", desc: "A quick guide for families on signing up and logging in.", link: "Read more →", href: "#" },
  { ic: "🎥", title: "How students use EduSphere", desc: "A short video guide to help students navigate the worksheet library.", link: "Watch now →", href: "#" },
  { ic: "❓", title: "Have any questions?", desc: "Visit the EduSphere Knowledge Base for comprehensive answers.", link: "Visit help desk →", href: "#" },
  { ic: "🚀", title: "Let's get started!", desc: "If you love what you see, it's time to go premium and unlock everything.", link: "Subscribe →", href: "#pricing" }
]

export default function LearnMore() {
  return (
    <section className="learn">
      <div className="wrap">
        <div className="sec-head"><h2>Want to learn more about EduSphere?</h2></div>
        <div className="lgrid">
          {cards.map((c) => (
            <div className="lcard" key={c.title}>
              <div className="ic">{c.ic}</div>
              <div>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
                <a className="lnk" href={c.href}>{c.link}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
