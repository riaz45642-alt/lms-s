# Developer Guide

## Architecture in one sentence

React renders the browser interface, Axios calls Laravel JSON endpoints, Laravel validates and authorizes each action, Eloquent models work with PostgreSQL, and private files are served through checked download endpoints.

See [System Architecture](System_Architecture.md) for diagrams.

## Coding standards

- Follow Laravel's normal PSR-12 PHP style. Laravel Pint is installed and can format PHP with `./vendor/bin/pint`.
- Use React function components and hooks, matching the current frontend.
- Keep API access in the shared Axios client so authentication and errors remain consistent.
- Validate input on the server even when the browser already validates it.
- Check both role and record relationship for student data.
- Put multi-record business operations in a database transaction. A transaction makes all changes succeed together or fail together.
- Use migrations for every schema change. Do not manually change production tables.
- Store private files on a non-public disk and expose them only through authorized downloads.
- Add tests for allowed behavior and forbidden access.

## Important files

| File | Why it matters |
|---|---|
| `routes/api.php` | Complete public API surface |
| `resources/js/FrontendApp.jsx` | Active frontend page routing |
| `resources/js/context/AppContext.jsx` | Login state and shared API access |
| `resources/js/pages/PortalDashboard.jsx` | Main role workflows |
| `app/Models/User.php` | Roles, permissions, profiles, and tokens |
| `app/Policies/WorksheetPolicy.php` | Worksheet access rules |
| `app/Services/ManualReviewService.php` | Review, percentage, grade, and report transaction |
| `database/migrations/` | Authoritative schema history |
| `tests/Feature/` | Business-rule and security examples |

## Add a new backend module

1. Define the real user need and which roles may use it.
2. Create a migration: `php artisan make:migration create_example_table`.
3. Add the model and relationships.
4. Add a Form Request for validation and authorization when input is accepted.
5. Add a controller with small, focused actions.
6. Add routes in `routes/api.php` behind `auth:sanctum` unless the endpoint must be public.
7. Add policies or explicit relationship checks for private records.
8. Add feature tests for success, validation failure, unauthenticated access, wrong role, and unrelated users.
9. Add the frontend page or component and connect it in `FrontendApp.jsx`.
10. Update the documentation.

## Add a frontend page

1. Create the component under `resources/js/pages`.
2. Use `useApp()` for the API and current user.
3. Use the shared `errorMessage()` helper for API errors.
4. Add a path in `FrontendApp.jsx`; creating a file alone does not make it reachable.
5. Protect the page by login and role when needed.
6. Add navigation only after the route works.
7. Test direct URLs, refresh, browser back/forward, loading, empty, error, and small-screen states.

## Database migrations

Create a migration with Artisan, write both `up()` and `down()` behavior, and test against PostgreSQL-compatible rules. Run:

```bash
php artisan migrate
php artisan test
```

Use `php artisan migrate:rollback` only in a development database where reversing the latest migration is safe. Never edit an old migration after it has been deployed to shared environments; add a new migration instead.

## Testing

Run the full backend suite:

```bash
php artisan test
```

Build the frontend to catch import and compile problems:

```bash
npm run build
```

Important current test cases cover the complete review workflow, relationship privacy, admin-only worksheet changes, registration links, teacher restrictions, deadlines, duplicate submissions, resubmissions, academic relationships, and database-driven portal selection.

## Known implementation cautions

- `FrontendApp.jsx` is the real router. Many page files are prototypes and unused.
- Permissions exist in the database, but current API routes mostly use fixed role checks rather than the `permission` middleware.
- The legacy `users.role` column and database role links both exist. `hasRole()` accepts either, so changes should keep them synchronized.
- Worksheet bundles, messages, classes, and subjects have backend structures without complete frontend workflows.
- The forgot-password link, Google button, notification page, and several marketing claims are not connected to services.
- List endpoints return 20 records per page, while some frontend views do not yet provide next/previous controls.
- Some displayed punctuation in source files appears encoding-damaged; save edited source as UTF-8.

## Common troubleshooting

- **401 response:** the bearer token is missing, invalid, or removed. Log in again.
- **403 response:** the role or student relationship does not permit the action.
- **422 response:** validation failed; inspect the returned `errors` object.
- **409 response:** a business conflict occurred, such as late work, forbidden resubmission, or deletion of an assigned worksheet.
- **Uploaded file is missing:** verify the storage path, permissions, persistent volume, and database path.
- **Frontend shows an old version:** rebuild assets and clear browser/application caches.

See [Troubleshooting](Troubleshooting.md) for operator-focused steps.
