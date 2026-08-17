// Auth0 settings come from the Laravel .env file (Vite exposes VITE_* keys only).
// A SPA client id is public by design, so nothing secret lives in the bundle.
export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
}

// Without all three values Auth0Provider cannot be built, so the social buttons
// stay hidden instead of throwing at render time.
export const isAuth0Configured = Boolean(
  auth0Config.domain && auth0Config.clientId && auth0Config.audience,
)

export const AUTH0_REDIRECT_PATH = '/auth/callback'

export const auth0RedirectUri = () => `${window.location.origin}${AUTH0_REDIRECT_PATH}`
