import { useEffect, useRef, useState } from 'react'

export default function Reveal({ children, as: Tag = 'div', className = '', delay = 0, variant = 'up', stagger = false, style, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  const variantClass = variant && variant !== 'up' ? ` reveal-${variant}` : ''
  const mergedStyle = { ...(style || {}), ...(delay ? { transitionDelay: `${delay}ms` } : {}) }

  return (
    <Tag
      ref={ref}
      className={`reveal${variantClass}${visible ? ' in' : ''}${stagger ? ' stagger' : ''}${className ? ' ' + className : ''}`}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Tag>
  )
}
