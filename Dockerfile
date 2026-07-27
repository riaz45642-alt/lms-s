# syntax=docker/dockerfile:1.7

FROM composer:2 AS composer-dependencies

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --no-progress \
    --prefer-dist


FROM node:22-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.js ./
COPY resources ./resources
COPY public ./public
RUN npm run build


FROM php:8.2-fpm-bookworm AS php-runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends libzip-dev \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql zip opcache \
    && apt-get purge -y --auto-remove libzip-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=composer-dependencies /app/vendor ./vendor
COPY . .
COPY --from=frontend /app/public/build ./public/build
COPY docker/php.ini /usr/local/etc/php/conf.d/99-lms.ini
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/docker-entrypoint

RUN mkdir -p \
        bootstrap/cache \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
    && composer dump-autoload \
        --no-dev \
        --classmap-authoritative \
        --no-interaction \
    && chown -R www-data:www-data bootstrap/cache storage

ENTRYPOINT ["docker-entrypoint"]
CMD ["php-fpm", "-F"]


FROM nginx:1.27-alpine AS nginx

WORKDIR /var/www

COPY --from=php-runtime /var/www/public ./public
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

RUN ln -s /var/www/storage/app/public /var/www/public/storage

EXPOSE 80
