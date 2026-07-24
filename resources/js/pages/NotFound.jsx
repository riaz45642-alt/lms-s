import { useRouter } from '../router/Router'
import './pages.css'

export function NotFound() {
  const { navigate } = useRouter()
  return (
    <div className="status-page">
      <div>
        <div className="status-em">🧭</div>
        <h1>404 — Page not found</h1>
        <p>The page you're looking for doesn't exist or may have moved.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to home</button>
      </div>
    </div>
  )
}

export function EmptyStatePage() {
  const { navigate } = useRouter()
  return (
    <div className="status-page">
      <div>
        <div className="status-em">📭</div>
        <h1>Nothing to show yet</h1>
        <p>Once there's content here, it will show up automatically.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to dashboard</button>
      </div>
    </div>
  )
}

export function ServerError({ onRetry }) {
  const { navigate } = useRouter()
  return (
    <div className="status-page">
      <div>
        <div className="status-em">🛠️</div>
        <h1>500 — Something went wrong</h1>
        <p>Our server hit a snag. Please try again in a moment.</p>
        <button className="btn btn-primary" onClick={onRetry || (() => navigate('/'))}>Try again</button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to home</button>
      </div>
    </div>
  )
}

export function NetworkError({ onRetry }) {
  const { navigate } = useRouter()
  return (
    <div className="status-page">
      <div>
        <div className="status-em">📡</div>
        <h1>No connection</h1>
        <p>We couldn't reach EduSphere. Check your internet connection and try again.</p>
        <button className="btn btn-primary" onClick={onRetry || (() => window.location.reload())}>Retry</button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to home</button>
      </div>
    </div>
  )
}

export default NotFound
