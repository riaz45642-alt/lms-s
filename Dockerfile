FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    curl \
    libzip-dev \
    libpng-dev

RUN docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=node:22 /usr/local /usr/local

WORKDIR /var/www

COPY . .

RUN composer install

RUN npm install

RUN npm run build

RUN php artisan key:generate || true

EXPOSE 8000

CMD php artisan serve --host=0.0.0.0 --port=8000