import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <h1>Primary <span>worksheets</span> for every student, teacher and parent</h1>
          <p className="lead">Thousands of curriculum-aligned, ready-to-print worksheets. Download, print, score and track progress — all in one place.</p>
          <div className="stat-pill">⭐ <span><b>85%</b> of teachers prefer our worksheets</span></div>
        </div>

        <div className="hero-art">
          <div className="blob b1"></div>
          <div className="blob b2"></div>
          <svg className="mascot float" viewBox="0 0 300 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs><linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a9bf0" /><stop offset="1" stopColor="#142d6f" /></linearGradient></defs>
            <circle cx="150" cy="120" r="92" fill="none" stroke="url(#gl)" strokeWidth="5" />
            <ellipse cx="150" cy="120" rx="40" ry="92" fill="none" stroke="#2a9bf0" strokeWidth="3" opacity=".8" />
            <ellipse cx="150" cy="120" rx="78" ry="92" fill="none" stroke="#2a9bf0" strokeWidth="3" opacity=".5" />
            <line x1="58" y1="120" x2="242" y2="120" stroke="#2a9bf0" strokeWidth="3" opacity=".7" />
            <line x1="72" y1="80" x2="228" y2="80" stroke="#2a9bf0" strokeWidth="3" opacity=".5" />
            <line x1="72" y1="160" x2="228" y2="160" stroke="#2a9bf0" strokeWidth="3" opacity=".5" />
            <circle cx="150" cy="108" r="17" fill="#142d6f" />
            <path d="M150 126c-6 0-11 4-12 10l-30 26 12 12 22-20v8h16v-8l22 20 12-12-30-26c-1-6-6-10-12-10z" fill="#142d6f" />
            <path d="M236 56l6 13 14 2-10 9 3 14-13-7-13 7 3-14-10-9 14-2z" fill="#f6b81e" />
            <path d="M70 175c40 36 130 36 175-15" stroke="#1f86e0" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".85" />
            <path d="M86 220c20-12 44-12 64 4 20-16 44-16 64-4v66c-20-12-44-12-64 0-20-12-44-12-64 0z" fill="#fff" stroke="#142d6f" strokeWidth="5" />
            <path d="M150 224v66" stroke="#142d6f" strokeWidth="4" />
            <path d="M104 240c12-5 24-4 34 2M196 240c-12-5-24-4-34 2" stroke="#1f86e0" strokeWidth="3" opacity=".6" />
          </svg>
        </div>
      </div>
    </section>
  )
}