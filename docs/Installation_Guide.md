# Installation Guide

## Requirements

For a normal local installation:

- PHP 8.1 or newer, with PDO PostgreSQL and common Laravel extensions.
- Composer 2 for PHP packages.
- Node.js and npm for the React frontend. Node 18 or newer is a practical choice; the Docker build uses Node 22.
- PostgreSQL, preferably version 16 to match Docker.
- Git, if the project is being cloned from a repository.

Alternatively, install Docker with Docker Compose and use the supplied containers.

## Standard local installation

From the project folder:

```bash
composer install
npm install
```

Create the local environment file:

```bash
cp .env.example .env
php artisan key:generate
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
php artisan key:generate
```

Do not replace an existing `.env` file unless its settings are safely backed up.

## Environment variables

Edit `.env` for the current machine.

| Variable | Purpose | Typical local value |
|---|---|---|
| `APP_NAME` | Name shown by Laravel | `EduSphere` |
| `APP_ENV` | Runtime environment | `local` |
| `APP_KEY` | Encryption key; generate it | generated value |
| `APP_DEBUG` | Detailed developer errors | `true` locally, `false` in production |
| `APP_URL` | Main site address | `http://localhost:8000` |
| `DB_CONNECTION` | Database type | `pgsql` |
| `DB_HOST` | Database server | `127.0.0.1` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_DATABASE` | Database name | `lms` |
| `DB_USERNAME` | Database login | `lms` |
| `DB_PASSWORD` | Database password | choose a private value |
| `FILESYSTEM_DISK` | Default file storage | `local` |
| `SESSION_DRIVER` | Session storage | `file` |
| `CACHE_DRIVER` | Cache storage | `file` |
| `QUEUE_CONNECTION` | Background work mode | `sync` |

Mail, AWS, Redis, and Pusher variables are present in the template but are not required by the current LMS workflow.

## Database setup

Create an empty PostgreSQL database and a user that can create and change tables. Put those details in `.env`, then run:

```bash
php artisan migrate
```

To add the four linked demo accounts in a local environment:

```bash
php artisan db:seed
```

The demo emails are `admin@example.com`, `teacher@example.com`, `parent@example.com`, and `student@example.com`. Their development-only password is `password`. Never use these credentials in production.

## Run the backend and frontend

Use two terminals in the project folder.

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

Open the address printed by `php artisan serve`, normally `http://127.0.0.1:8000`.

## Docker installation

Set at least a secure `APP_KEY` and database password in `.env`. Then run:

```bash
docker compose up --build -d
```

By default the application is available at `http://localhost:8000`. The container waits for PostgreSQL and runs migrations when `RUN_MIGRATIONS=true`.

## Verify the installation

```bash
php artisan test
npm run build
```

At the time this documentation was prepared, all 13 project tests passed.

## Production deployment

1. Use HTTPS and a trusted domain.
2. Set `APP_ENV=production`, `APP_DEBUG=false`, the correct `APP_URL`, and a strong generated `APP_KEY`.
3. Use strong database credentials and protected backups.
4. Build with `docker compose build` or run `npm run build` and install Composer packages with production options.
5. Run `php artisan migrate --force` as a controlled release step.
6. Ensure `storage` and `bootstrap/cache` are writable by the PHP process.
7. Persist both PostgreSQL data and `storage/app`, because they contain records and uploaded learning files.
8. Configure log collection, monitoring, backups, and a restore test.

The supplied Docker image already builds frontend assets, uses PHP-FPM and Nginx, and stores database and application files in named volumes. It does not configure TLS certificates or off-site backups; the hosting platform must provide those.
