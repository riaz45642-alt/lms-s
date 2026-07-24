import { PageHero } from '../components/ui/UI'
import './pages.css'

export default function Terms() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of service" subtitle="The rules that govern your use of EduSphere." />
      <div className="page-section tight">
        <div className="wrap legal-content">
          <span className="legal-updated">Last updated: 1 June 2026</span>

          <h2>1. Acceptance of terms</h2>
          <p>By creating an account or using EduSphere, you agree to these terms. If you're using EduSphere on behalf of a school or organisation, you confirm you have the authority to accept these terms for that organisation.</p>

          <h2>2. Accounts</h2>
          <p>You're responsible for maintaining the confidentiality of your account credentials. Parent, Educator and School accounts may manage sub-accounts for students, and are responsible for that activity.</p>

          <h2>3. Subscriptions & billing</h2>
          <ul>
            <li>Paid plans renew automatically at the end of each billing cycle unless cancelled.</li>
            <li>You can cancel anytime; access continues until the end of the current billing period.</li>
            <li>New subscriptions are covered by a 14-day money-back guarantee.</li>
          </ul>

          <h2>4. Acceptable use</h2>
          <p>Worksheets, workbooks and course content are licensed for personal, classroom or school use only. Redistributing, reselling or publicly republishing our materials without permission is not permitted.</p>

          <h2>5. Intellectual property</h2>
          <p>All worksheets, workbooks, courses, branding and platform content are owned by EduSphere or its licensors and are protected by copyright.</p>

          <h2>6. Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms, misuse the platform, or engage in fraudulent activity.</p>

          <h2>7. Disclaimer & liability</h2>
          <p>EduSphere is provided "as is". While we strive for accuracy across our curriculum-aligned content, we make no guarantee of specific academic outcomes.</p>

          <h2>8. Changes to these terms</h2>
          <p>We may revise these terms periodically. Continued use of EduSphere after changes take effect constitutes acceptance of the revised terms.</p>

          <h2>9. Contact</h2>
          <p>Questions about these terms can be sent via our Contact page or the Help centre.</p>
        </div>
      </div>
    </>
  )
}
