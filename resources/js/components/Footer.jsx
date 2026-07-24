import { Link } from '../router/Router'
import './Footer.css'

export default function Footer() {
  return (
    <footer>
      <div className="wrap fgrid">
        <div>
          <div className="footer-logo">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="22" r="15" fill="none" stroke="#2a9bf0" strokeWidth="2.2" />
              <line x1="9" y1="22" x2="39" y2="22" stroke="#2a9bf0" strokeWidth="1.6" />
              <circle cx="24" cy="20" r="4" fill="#2a9bf0" />
              <path d="M38 10l1.6 3.4 3.6.4-2.7 2.5.8 3.6L38 18l-3.3 1.9.8-3.6L32.8 13.8l3.6-.4z" fill="#f6b81e" />
            </svg>
            Edu<span style={{ color: '#2a9bf0' }}>Sphere</span>
          </div>
          <p>Learn · Practice · Succeed. Curriculum-aligned printable worksheets for every primary learner.</p>
          <div className="socials">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="Instagram">◎</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div>
          <h5>Navigation</h5>
          <ul>
            <li><Link to="/worksheets">Worksheets</Link></li>
            <li><Link to="/workbooks">Workbooks</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/activities">Activities</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h5>Company</h5>
          <ul>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/our-services">Our services</Link></li>
            <li><Link to="/help">Help centre</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h5>Sign up</h5>
          <ul>
            <li><Link to="/parent">Join as a parent</Link></li>
            <li><Link to="/educator">Join as a tutor</Link></li>
            <li><Link to="/student">Join as a student</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-bot">
        <span>© 2026 EduSphere. All rights reserved.</span>
        <span><Link to="/help">Help</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · contact@edusphere.co</span>
      </div>
    </footer>
  )
}
