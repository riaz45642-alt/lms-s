import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const RouterCtx = createContext(null)

function parse(pathname) {
  const [path, query] = pathname.split('?')
  const params = {}
  if (query) {
    new URLSearchParams(query).forEach((v, k) => { params[k] = v })
  }
  return { path: path.replace(/\/+$/, '') || '/', params }
}

export function RouterProvider({ children }) {
  const [state, setState] = useState(() => parse(window.location.pathname + window.location.search))

  useEffect(() => {
    const onPop = () => setState(parse(window.location.pathname + window.location.search))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to, opts = {}) => {
    const target = typeof to === 'string' ? to : `${to.path}${to.query ? '?' + new URLSearchParams(to.query).toString() : ''}`
    if (opts.replace) {
      window.history.replaceState({}, '', target)
    } else {
      window.history.pushState({}, '', target)
    }
    setState(parse(target))
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const value = useMemo(() => ({ path: state.path, params: state.params, navigate }), [state, navigate])

  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterCtx)
  if (!ctx) throw new Error('useRouter must be used within RouterProvider')
  return ctx
}

export function Link({ to, children, className, onClick, ...rest }) {
  const { navigate } = useRouter()
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        if (onClick) onClick(e)
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
