# Google login through Auth0

EduSphere authorizes every API call with a Sanctum bearer token. Auth0 is used to
prove *who* somebody is; it never replaces Sanctum. The SPA therefore trades a
verified Auth0 access token for a Sanctum token and the rest of the application is
untouched.

## Flow

```
React  ──loginWithRedirect(connection: google-oauth2)──▶  Auth0  ──▶  Google
                                                                        │
React  ◀─────────── redirect to /auth/callback ─────────────────────────┘
  │
  │ getAccessTokenSilently()          (RS256 JWT, aud = AUTH0_AUDIENCE)
  ▼
POST /api/auth/auth0/exchange
  │
  ├─ Auth0TokenVerifier::verify()     signature via cached JWKS + iss/aud/exp
  ├─ Auth0TokenVerifier::userInfo()   name / email / email_verified / picture
  │
  ├─ users.auth0_sub matches          →  Sanctum token
  ├─ verified email matches a user    →  link auth0_sub, Sanctum token
  └─ nobody matches                   →  { needs_role: true }
                                            │
                                            ▼
                              SPA shows the role picker and re-posts
                              the same token with role + profile fields
                                            │
                                            ▼
                                   user + profile created, Sanctum token
```

A role picker is unavoidable: `users.role` drives the whole RBAC layer and every
account owns a parent/teacher/student profile row, but Google only supplies a
name, an email and a picture.

## Auth0 dashboard settings

1. **Application → Settings** (type must be *Single Page Application*)
   - Allowed Callback URLs: `http://localhost:8000/auth/callback`
   - Allowed Logout URLs: `http://localhost:8000`
   - Allowed Web Origins: `http://localhost:8000`

   The app is served by Laravel on port 8000. Vite's port 5173 only serves assets
   and must not be used here.

2. **Applications → APIs → Create API**
   - Name: `EduSphere API`
   - Identifier (audience): `https://api.edusphere.local`

   This step is missing from the SPA quickstart. Without an audience Auth0 issues
   an opaque token that the API cannot verify.

3. **Authentication → Social → Google**
   - Enable the connection for the EduSphere application.
   - Replace Auth0's shared *Developer Keys* with a Google Cloud OAuth client.
     The developer keys are rate limited and are not supported outside testing.

4. **Google Cloud Console** (for step 3)
   - Configure the OAuth consent screen.
   - Create an OAuth client of type *Web application*.
   - Authorized redirect URI: `https://dev-dcvktuayhyjdtyvq.us.auth0.com/login/callback`
   - Copy the client id/secret into the Auth0 Google connection.

## Environment

```
AUTH0_DOMAIN=dev-dcvktuayhyjdtyvq.us.auth0.com
AUTH0_AUDIENCE=https://api.edusphere.local

VITE_AUTH0_DOMAIN=dev-dcvktuayhyjdtyvq.us.auth0.com
VITE_AUTH0_CLIENT_ID=<SPA client id>
VITE_AUTH0_AUDIENCE=https://api.edusphere.local
```

`AUTH0_*` is read by the API, `VITE_AUTH0_*` is compiled into the bundle. A SPA
client id is public by design, so nothing secret ships to the browser. Changing a
`VITE_*` value requires `npm run build` (or a `npm run dev` restart).

When any of the three `VITE_*` values is missing the Google buttons are hidden and
`Auth0Provider` is skipped, so password login keeps working on a machine with no
Auth0 configuration.

## Files

| File | Role |
|---|---|
| `app/Services/Auth0TokenVerifier.php` | JWKS download + cache, RS256 verification, `/userinfo` |
| `app/Http/Controllers/Api/AuthController.php` | `auth0Exchange()` — matching, linking, account creation |
| `app/Providers/AppServiceProvider.php` | binds the verifier with the configured domain/audience |
| `database/migrations/2026_08_16_000001_add_auth0_columns_to_users_table.php` | `users.auth0_sub`, `users.avatar_url` |
| `resources/js/services/auth0Config.js` | env reading + `isAuth0Configured` guard |
| `resources/js/components/GoogleButton.jsx` | `loginWithRedirect` with the Google connection |
| `resources/js/pages/AuthCallback.jsx` | redirect handling and the role picker |
| `tests/Feature/Auth0LoginTest.php` | matching, linking, unverified email, forged token |

## Security notes

- The API verifies the token signature against the tenant JWKS and checks `iss`,
  `aud` and `exp`. A forged or foreign token is rejected with 401.
- An existing account is only linked when Auth0 reports `email_verified: true`.
  Without that check anyone could register an unverified address at an identity
  provider and take over a local account.
- Social accounts store a random secret in `users.password`, so password login can
  never succeed for them.
- The JWKS is cached for one hour and refreshed automatically once on a
  verification failure, which covers tenant key rotation.

## Known gaps

- `logout` clears the Sanctum token only; the Auth0 session survives. The Google
  button sends `prompt=select_account` so the next sign-in still shows the account
  chooser, but a full RP-initiated logout is not implemented.
- Role selection cannot be changed by the user afterwards; an admin has to do it.
