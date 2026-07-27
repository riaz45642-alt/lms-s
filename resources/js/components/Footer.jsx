import { Link } from '../router/Router'
import './Footer.css'

export default function Footer() {
  return (
    <footer>
      <div className="wrap fgrid">
        <div>
          <div className="footer-logo">
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="6" y="6" width="36" height="36" rx="12" fill="#6C4CF1" />
              <path d="M14 30V18l10-4 10 4v12" stroke="#FF8A3D" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M14 18l10 4 10-4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            Edu<span style={{ color: '#8467F5' }}>Sphere</span>
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
          <h5>Explore</h5>
          <ul>
            <li><Link to="/worksheets">Worksheets</Link></li>
            <li><Link to="/activities">Activities</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h5>Company</h5>
          <ul>
            <li><Link to="/about">About us</Link></li>
            <li><Link to="/help">Help centre</Link></li>
          </ul>
        </div>
        <div>
          <h5>Account</h5>
          <ul>
            <li><Link to="/login">Log in</Link></li>
            <li><Link to="/signup">Sign up</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-bot">
        <span>© 2026 EduSphere. All rights reserved.</span>
        <span><Link to="/help">Help</Link></span>
      </div>
    </footer>
  )
}
