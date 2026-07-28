# Manual worksheet review workflow

The Laravel API is the source of truth for worksheet assignments and reports. The React marketing/demo data is not a database seed.

## Workflow

1. A teacher uploads a worksheet with `POST /api/worksheets`.
2. A linked parent or the owning teacher assigns it with `POST /api/assignments`.
3. A linked parent uploads the completed file with `POST /api/assignments/{assignment}/submission`.
4. The worksheet owner records a pending or checked review with `POST /api/submissions/{submission}/review`.
5. A checked review calculates its percentage and creates or updates exactly one performance report in the same database transaction.

All endpoints except registration and login require a Sanctum bearer token.

## Docker database commands

Starting the stack waits for PostgreSQL and runs outstanding migrations automatically:

```powershell
docker compose up --build -d
```

Run migrations explicitly:

```powershell
docker compose exec app php artisan migrate --force
```

Load local demo users and relationship records:

```powershell
docker compose exec app php artisan db:seed --class=LmsDemoSeeder
```

Inspect migration state:

```powershell
docker compose exec app php artisan migrate:status
```

The demo accounts all use the password `password` and are intended only for local development.
