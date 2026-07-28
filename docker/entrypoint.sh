#!/bin/sh
set -eu

cd /var/www

mkdir -p \
    bootstrap/cache \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs

chown -R www-data:www-data bootstrap/cache storage

if [ -z "${APP_KEY:-}" ]; then
    key_file="storage/app/.docker-app-key"

    if [ ! -s "$key_file" ]; then
        php artisan key:generate --show --no-ansi > "$key_file"
        chmod 600 "$key_file"
        chown www-data:www-data "$key_file"
    fi

    APP_KEY="$(cat "$key_file")"
    export APP_KEY
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    attempts=0
    until php -r '
        try {
            $driver = getenv("DB_CONNECTION") ?: "pgsql";
            new PDO(
                $driver . ":host=" . getenv("DB_HOST") . ";port=" . getenv("DB_PORT") . ";dbname=" . getenv("DB_DATABASE"),
                getenv("DB_USERNAME"),
                getenv("DB_PASSWORD")
            );
        } catch (Throwable $exception) {
            exit(1);
        }
    '; do
        attempts=$((attempts + 1))
        if [ "$attempts" -ge 30 ]; then
            echo "Database did not become ready in time." >&2
            exit 1
        fi
        sleep 2
    done

    php artisan migrate --force --no-interaction
fi

exec "$@"
