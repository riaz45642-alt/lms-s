# EduSphere LMS Documentation

EduSphere is a worksheet-centered Learning Management System for administrators, teachers, students, and parents. It manages worksheet files, parent-created assignments, student/parent submissions, linked-teacher reviews, and performance reports.

## Core features

- Parent, teacher, and student registration; four-role token login.
- Separate role dashboards with live summary counts.
- Administrator worksheet upload, publication, editing, replacement, and deletion.
- Parent assignment of published work to linked children.
- Deadlines, late-submission rules, and numbered repeat attempts.
- Private worksheet and submission downloads.
- Linked-teacher marking, comments, percentage calculation, and grades.
- Student progress summaries and role-filtered reports.
- Role-specific profile editing.

Attendance, notification delivery, password recovery, user-management screens, messages, and class-management screens are not complete in the current version.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 19, JavaScript, CSS, Axios |
| Build tool | Vite 4 |
| Backend | PHP 8.1+, Laravel 10 |
| Authentication | Laravel Sanctum bearer tokens |
| Database | PostgreSQL; SQLite for tests |
| Storage | Laravel private local filesystem |
| Deployment | Docker, PHP-FPM, Nginx, PostgreSQL 16 |
| Tests | PHPUnit through Laravel's test runner |

## Quick installation

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

In a second terminal:

```bash
npm run dev
```

See the full [Installation Guide](Installation_Guide.md), including PostgreSQL, environment settings, Docker, and production steps.

## Project structure

```text
app/            Laravel controllers, models, requests, policies, and services
database/       Database migrations and demo seed data
resources/js/   React interface, routing, pages, components, and API client
routes/         API and web route definitions
storage/        Private uploads, logs, sessions, and caches
tests/          Automated business-rule and security tests
docs/           Project documentation
```

See [Folder Structure](Folder_Structure.md) for details.

## Documentation index

- [Project Overview](Project_Overview.md)
- [Features](Features.md)
- [User Guide](User_Guide.md)
- [System Architecture](System_Architecture.md)
- [Database Documentation](Database_Documentation.md)
- [API Documentation](API_Documentation.md)
- [Folder Structure](Folder_Structure.md)
- [Installation Guide](Installation_Guide.md)
- [Screenshots Guide](Screenshots_Guide.md)
- [Developer Guide](Developer_Guide.md)
- [FAQ](FAQ.md)
- [Troubleshooting](Troubleshooting.md)
- [Future Improvements](Future_Improvements.md)
- [Glossary](Glossary.md)

## Testing

```bash
php artisan test
npm run build
```

The verified documentation baseline is 13 passing backend tests with 70 assertions.

## License

The Composer project metadata declares the MIT License. No separate `LICENSE` file is present in this repository. Before publishing or distributing the project, add the intended license text and confirm ownership of third-party images, fonts, and content.

## Authors

No author names are defined in the project metadata. Add the student/team names, supervisor, institution, and contact details here before final submission.

Example:

- Project author(s): _Add names_
- Supervisor: _Add name_
- Institution: _Add institution_
- Academic year: _Add year_
