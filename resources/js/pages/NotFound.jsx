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

export default NotFound
