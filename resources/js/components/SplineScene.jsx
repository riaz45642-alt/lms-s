import { useEffect, useMemo, useRef, useState } from 'react'
import './SplineScene.css'

const RUNTIME_SCENES = {
  hero: import.meta.env.VITE_SPLINE_HERO_URL || '',
  worksheets: import.meta.env.VITE_SPLINE_WORKSHEETS_URL || '',
  activities: import.meta.env.VITE_SPLINE_ACTIVITIES_URL || '',
}

const VIEWER_SCRIPT = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js'

function loadSplineViewer() {
  if (window.customElements?.get('spline-viewer')) return Promise.resolve()
  const existing = document.querySelector('script[data-spline-viewer]')
  if (existing) return new Promise((resolve, reject) => {
    existing.addEventListener('load', resolve, { once: true })
    existing.addEventListener('error', reject, { once: true })
  })
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = VIEWER_SCRIPT
    script.dataset.splineViewer = 'true'
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', reject, { once: true })
    document.head.appendChild(script)
  })
}

export default function SplineScene({ scene, title, eager = false, className = '' }) {
  const hostRef = useRef(null)
  const runtimeUrl = RUNTIME_SCENES[scene]
  const validRuntimeUrl = runtimeUrl && !runtimeUrl.includes('app.spline.design/file/')
  const usesViewer = validRuntimeUrl && runtimeUrl.includes('scene.splinecode')
  const [active, setActive] = useState(eager)
  const [runtimeReady, setRuntimeReady] = useState(!usesViewer)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    if (eager || active || !hostRef.current) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true)
        observer.disconnect()
      }
    }, { rootMargin: '240px 0px' })
    observer.observe(hostRef.current)
    return () => observer.disconnect()
  }, [active, eager])

  useEffect(() => {
    if (!active || !usesViewer) return undefined
    let current = true
    loadSplineViewer().then(() => {
      if (current) setRuntimeReady(true)
    }).catch(() => {
      if (current) setRuntimeReady(false)
    })
    return () => { current = false }
  }, [active, usesViewer])

  useEffect(() => {
    if (!usesViewer || !runtimeReady) return undefined
    const timer = window.setTimeout(() => setSceneReady(true), 500)
    return () => window.clearTimeout(timer)
  }, [runtimeReady, usesViewer])

  const stateClass = useMemo(() => {
    if (!validRuntimeUrl) return 'is-awaiting-export'
    return sceneReady ? 'is-ready' : 'is-loading'
  }, [validRuntimeUrl, sceneReady])

  return (
    <div ref={hostRef} className={`spline-scene ${stateClass} ${className}`} aria-label={title}>
      {validRuntimeUrl && !sceneReady && <div className="spline-loader" aria-hidden="true"><span /><span /><span /></div>}
      {active && validRuntimeUrl && usesViewer && runtimeReady && (
        <spline-viewer url={runtimeUrl} events-target="global" loading-anim-type="spinner-small-dark" />
      )}
      {active && validRuntimeUrl && !usesViewer && (
        <iframe src={runtimeUrl} title={title} loading={eager ? 'eager' : 'lazy'} allow="fullscreen; autoplay; accelerometer; gyroscope" onLoad={() => setSceneReady(true)} />
      )}
      {!validRuntimeUrl && <div className="spline-slot" aria-hidden="true"><span /><span /><span /></div>}
      {validRuntimeUrl && sceneReady && <span className="spline-hint" aria-hidden="true">Drag to explore</span>}
    </div>
  )
}
