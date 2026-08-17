# Troubleshooting

Start with the visible error message, then check `storage/logs/laravel.log` on the server. Never share passwords, access tokens, or the contents of `.env` in a public issue.

## Login is not working

1. Confirm the email address and password.
2. Check that the backend is running and the browser can reach `/api/auth/login`.
3. Clear the saved `lms_token` from browser local and session storage, then log in again.
4. Confirm the user exists and the stored password is a valid hash.
5. If many attempts were made, wait one minute because login is rate-limited.

Password recovery and Google login are not implemented. A lost password needs an approved administrator/developer reset process.

## Database connection failed

1. Confirm PostgreSQL is running.
2. Compare `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `.env` with the database server.
3. In Docker, `DB_HOST` must be `postgres`, not `127.0.0.1`.
4. Confirm PHP has the PostgreSQL PDO extension.
5. Clear cached configuration after changes: `php artisan config:clear`.
6. Run `php artisan migrate:status` to test the connection and migration state.

## Server is not running

- Local backend: run `php artisan serve`.
- Frontend development assets: run `npm run dev` in a second terminal.
- Docker: run `docker compose ps` and inspect `docker compose logs app nginx postgres`.
- Confirm the selected port is not already used by another application.

## Frontend is blank or outdated

1. Check the browser console for a JavaScript error.
2. Run `npm install` and `npm run build`.
3. In development, make sure Vite is running.
4. Clear browser cache and run `php artisan view:clear`.
5. Confirm `resources/views/welcome.blade.php` contains the `#app` element.

## File upload failed

1. Use PDF, JPG, JPEG, PNG, or WebP.
2. Keep the file at or below 20 MB.
3. Confirm the assignment deadline and resubmission rules.
4. Confirm `storage/app` is writable by the PHP process.
5. Check PHP upload limits in `docker/php.ini` or the active `php.ini`.
6. In Docker, confirm the `app_storage` volume is mounted and has free space.

## File download returns 404

The database record may exist while the physical file is missing. Check the record's `file_path`, the `storage/app` contents, volume persistence, and restore history. A 403 instead means the user is not authorized.

## Permission denied or 403

Check all of the following:

- The user has the expected primary role and role link.
- A parent has a parent profile and the student's `parent_id` matches it.
- A teacher has a teacher profile and the pair exists in `teacher_student`.
- A parent is assigning a published worksheet.
- The requested record belongs to an allowed student.

Do not remove authorization checks to make an error disappear. Correct the account relationship or business rule.

## Validation failed or 422

Read the response's `errors` object. Common causes are a duplicate email, password under eight characters, missing confirmation, past deadline, marks above total, unsupported file, or invalid relationship ID.

## Conflict or 409

- **Deadline passed:** enable late submission when creating a suitable new assignment; existing assignments have no update endpoint.
- **Already submitted:** the assignment must allow resubmission.
- **Worksheet cannot be deleted:** it has assignment history and should remain.

## Migration errors

1. Back up shared or production data before changing anything.
2. Run `php artisan migrate:status`.
3. Confirm migrations are being run in filename order.
4. Confirm the database user can create tables, indexes, foreign keys, and checks.
5. Do not rerun `migrate:fresh` on a database containing needed data; it deletes all tables.
6. In development only, fix the new migration or roll back the latest safe batch, then rerun tests.

## Demo accounts are missing

The main seeder creates demo users only in `local` and `testing` environments. Run `php artisan db:seed` with `APP_ENV=local`. Do not enable or use demo credentials in production.

## Tests fail

Run `php artisan test` from the project root. Confirm dependencies are installed, the test environment can use SQLite, and no test was changed to depend on real files or a shared database. The documented baseline is 13 passing tests with 70 assertions.
