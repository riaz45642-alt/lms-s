import { useCallback, useEffect, useRef, useState } from 'react'
import CharacterVisual from './CharacterVisual'
import { COMPANION_CONFIG, SECTION_MESSAGES } from './companionConfig'
import './LearningCompanion.css'
import { COMPANION_REACTION_EVENT, REACTION_MESSAGES } from './companionEvents'

export default function LearningCompanion({ page = 'home', sections = SECTION_MESSAGES }) {
  const config = COMPANION_CONFIG[page] || COMPANION_CONFIG.home
  const [compact, setCompact] = useState(() => window.scrollY >= 260)
  const [message, setMessage] = useState(config.message)
  const [messageKey, setMessageKey] = useState(0)
  const [reaction, setReaction] = useState('entering')
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const lastMessage = useRef(config.message)
  const reactionTimer = useRef(null)
  const companionRef = useRef(null)

  const react = useCallback((state = 'interaction', nextMessage, duration = 1100) => {
    window.clearTimeout(reactionTimer.current)
    const text = nextMessage || REACTION_MESSAGES[config.character]?.[state]
    if (text) {
      lastMessage.current = text
      setMessage(text)
      setMessageKey((value) => value + 1)
    }
    setReaction(state)
    reactionTimer.current = window.setTimeout(() => setReaction('idle'), duration)
  }, [config.character])

  useEffect(() => {
    lastMessage.current = config.message
    setMessage(config.message)
    setMessageKey((value) => value + 1)
    setReaction('entering')
    window.clearTimeout(reactionTimer.current)
    reactionTimer.current = window.setTimeout(() => setReaction('idle'), 850)
    return () => window.clearTimeout(reactionTimer.current)
  }, [config.character, config.message])

  useEffect(() => {
    const onReaction = (event) => react(event.detail?.state, event.detail?.message, event.detail?.duration)
    const onVisibility = () => setPageVisible(!document.hidden)
    const onClick = (event) => {
      const control = event.target instanceof Element ? event.target.closest('a,button,[role="button"],summary,input[type="file"]') : null
      if (!control || control.closest('.learning-companion')) return
      const label = `${control.textContent || ''} ${control.getAttribute('aria-label') || ''} ${control.getAttribute('href') || ''}`.toLowerCase()
      if (control.matches('.acc-q') && config.character === 'robot') return react('interaction', 'Let’s look at that together.', 900)
      if (control.matches('.worksheet-tile') && config.character === 'panda') return react('interaction')
      if (/mark lesson|submit final|complete|completed|finish|unlock|earned/.test(label)) return react('celebration', undefined, 1450)
      if (/play now|start activity|start course|start learning|continue learning|next lesson/.test(label)) return react('interaction')
      if (/download worksheet|upload completed|worksheets\//.test(label) && config.character === 'panda') return react('interaction')
      if (/progress|achievement|certificate|badge/.test(label) && config.character === 'astronaut') return react('success')
      return undefined
    }
    window.addEventListener(COMPANION_REACTION_EVENT, onReaction)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener(COMPANION_REACTION_EVENT, onReaction)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('click', onClick)
    }
  }, [config.character, react])

  useEffect(() => {
    let frame = 0
    const clamp = (min, value, max) => Math.min(max, Math.max(min, value))
    const mix = (from, to, progress) => from + (to - from) * progress

    const update = () => {
      frame = 0
      const node = companionRef.current
      if (!node) return

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const progress = clamp(0, window.scrollY / 260, 1)
      const isPhone = viewportWidth <= 620
      const isTablet = viewportWidth <= 900
      const isNarrowDesktop = viewportWidth <= 1350
      const heroWidth = isPhone
        ? Math.min(viewportWidth * .44, 190)
        : isTablet ? Math.min(viewportWidth * .38, 300) : clamp(260, viewportWidth * .29, 430)
      const compactWidth = isPhone ? 76 : isTablet ? 112 : isNarrowDesktop ? 145 : clamp(150, viewportWidth * .16, 210)
      const heroRight = isPhone ? -10 : isTablet ? viewportWidth * .02 : Math.max(18, (viewportWidth - 1240) / 2)
      const compactRight = isPhone ? 6 : isTablet || isNarrowDesktop ? 10 : clamp(16, viewportWidth * .025, 36)
      const heroTop = isPhone ? 170 : isTablet ? 118 : clamp(102, viewportHeight * .16, 150)

      node.style.width = `${mix(heroWidth, compactWidth, progress)}px`
      node.style.right = `${mix(heroRight, compactRight, progress)}px`
      node.style.bottom = 'auto'
      const compactTop = isTablet
        ? viewportHeight - (isPhone ? 8 : 14) - node.offsetHeight
        : Math.max(92, viewportHeight * .15)
      node.style.top = `${mix(heroTop, compactTop, progress)}px`
      setCompact(progress >= .999)
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-companion-section]')]
    if (!nodes.length) return undefined
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      const next = sections[visible.target.dataset.companionSection]
      if (next && next !== lastMessage.current) {
        lastMessage.current = next
        setMessage(next)
        setMessageKey((value) => value + 1)
      }
    }, { rootMargin: '-18% 0px -48% 0px', threshold: [0.15, 0.35, 0.6] })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [sections])

  return (
    <aside ref={companionRef} className={`learning-companion${compact ? ' is-compact' : ' is-hero'} state-${reaction}${pageVisible ? '' : ' is-paused'}`} aria-live="polite" aria-label="Learning companion" data-character={config.character}>
      <div className="companion-bubble" key={messageKey}><span>{message}</span></div>
      <CharacterVisual character={config.character} size="hero" />
    </aside>
  )
}
