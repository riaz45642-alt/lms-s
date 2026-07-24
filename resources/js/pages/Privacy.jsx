import { PageHero } from '../components/ui/UI'
import './pages.css'

export default function Privacy() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy policy" subtitle="How EduSphere collects, uses and protects your information." />
      <div className="page-section tight">
        <div className="wrap legal-content">
          <span className="legal-updated">Last updated: 1 June 2026</span>

          <h2>1. Information we collect</h2>
          <p>We collect information you provide directly, such as your name, email address and account role (student, parent, educator or school), as well as usage data like worksheets viewed, downloaded or favorited, to help us improve our resources.</p>

          <h2>2. How we use your information</h2>
          <ul>
            <li>To provide and personalise your access to worksheets, workbooks and courses.</li>
            <li>To send account, billing and product update notifications.</li>
            <li>To generate progress reports for parents, educators and school admins.</li>
            <li>To improve our curriculum and platform based on aggregated usage trends.</li>
          </ul>

          <h2>3. Children's privacy</h2>
          <p>Accounts for young learners are created and managed by a parent, educator or school administrator. We do not knowingly collect personal information directly from children without appropriate consent from a responsible adult.</p>

          <h2>4. Data sharing</h2>
          <p>We do not sell personal information. We may share limited data with trusted service providers (such as payment processors) strictly to operate the platform, and only under confidentiality obligations.</p>

          <h2>5. Cookies</h2>
          <p>We use functional cookies to keep you signed in and remember preferences, and analytics cookies to understand how the site is used so we can improve it. You can manage cookie preferences at any time.</p>

          <h2>6. Your rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting our support team through the Help centre or Contact page.</p>

          <h2>7. Changes to this policy</h2>
          <p>We may update this policy from time to time. Material changes will be communicated via email or an in-app notice.</p>
        </div>
      </div>
    </>
  )
}
