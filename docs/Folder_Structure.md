# Folder Structure

The list below covers folders that matter to development and operation. Installed dependencies and generated build folders are intentionally omitted.

```text
lms/
├── app/                    Laravel application code
├── bootstrap/              Laravel startup and generated cache
├── config/                 Application configuration
├── database/               Migrations, seed data, and factories
├── docker/                 Nginx, PHP, and container startup settings
├── docs/                   Project documentation
├── public/                 Public web entry point and built browser assets
├── resources/              React, CSS, images, and the HTML template
├── routes/                 API, web, console, and channel routes
├── storage/                Private files, logs, cache, and sessions
├── tests/                  Automated unit and feature tests
├── Dockerfile              Production container build
├── docker-compose.yml      Local/hosted multi-container setup
├── composer.json           PHP packages and scripts
├── package.json            JavaScript packages and scripts
└── vite.config.js          Frontend build configuration
```

## `app/`

- `Http/Controllers/Api/` contains the actions behind each API endpoint.
- `Http/Requests/` validates worksheet, assignment, submission, and review input.
- `Http/Middleware/` contains request checks, including role and permission checks.
- `Models/` maps PHP classes to database tables and relationships.
- `Policies/WorksheetPolicy.php` controls worksheet viewing and management.
- `Services/ManualReviewService.php` calculates results and creates reports.
- `Providers/` registers routes, policies, events, and other Laravel services.
- `Console/` is the place for scheduled tasks and command setup; no LMS-specific command is currently defined.

## `database/`

- `migrations/` is the ordered history that creates and changes database tables.
- `seeders/` can add four linked demo users in local and testing environments.
- `factories/` creates test users.

## `resources/`

- `views/welcome.blade.php` is the HTML shell for the React application.
- `js/app.jsx` is the active browser entry point.
- `js/FrontendApp.jsx` selects active pages.
- `js/context/` stores login and shared browser state.
- `js/services/api.js` configures API requests and bearer tokens.
- `js/router/` contains the small client-side router.
- `js/pages/` contains active pages and several unused prototypes. A file in this folder is not necessarily a live feature.
- `js/components/` contains reusable navigation, authentication, marketing, and interface components.
- `js/data/` contains static demonstration and marketing data, not database records.
- `js/assets/` and `css/` contain images and styles.

## `routes/`

- `api.php` defines all LMS API endpoints.
- `web.php` sends non-API paths to the React application.
- `console.php` and `channels.php` contain Laravel defaults; there are no project-specific console or broadcast routes.

## `storage/`

- `app/worksheets/` is created when worksheet files are uploaded.
- `app/submissions/` is created when completed work is uploaded.
- `logs/` contains Laravel logs.
- `framework/` contains caches, sessions, testing files, and compiled views.

The content of storage should be writable by the web process. Private learning files should not be committed to Git.

## `tests/`

Feature tests cover the complete worksheet-review workflow, relationship access, roles and permissions, registration links, deadlines, resubmission, and progress privacy. Unit and example tests provide basic project checks.

## Root configuration files

- `.env` contains local secrets and settings and must not be committed.
- `.env.example` is a safe configuration template.
- `phpunit.xml` configures automated tests.
- `artisan` is Laravel's command-line helper.
- `Dockerfile`, `docker-compose.yml`, and `docker/` support container deployment.
