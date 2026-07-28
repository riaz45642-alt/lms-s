import { useEffect, useRef } from 'react'

// Thin gradient bar pinned to the top of the viewport that fills up as the
// user scrolls the page. Pure transform updates (no React re-render on every
// scroll tick) so it stays smooth even on long pages.
export default function ScrollProgress() {
  const barRef = useRef(null)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - window.innerHeight
      const pct = height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct})`
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div className="scroll-progress" ref={barRef} style={{ width: '100%', transform: 'scaleX(0)' }} />
}
