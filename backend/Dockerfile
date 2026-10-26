# Minimal container image for local/staging use — the live deployment on
# backend.shopitech.cm still runs the traditional way for now (see the
# performance audit's #10: this is a first step, not a replacement for it).
#
# Runs php-fpm + nginx, not `php artisan serve`: the latter's built-in dev
# server hangs on any request that arrives through Docker's published-port
# NAT path (confirmed live — it answers instantly over a direct in-container
# loopback connection, but never responds to the exact same request routed
# through the container's exposed port). php-fpm + nginx is the version of
# this that actually works from outside the container.
FROM php:8.4-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev libpng-dev libjpeg-dev libwebp-dev libfreetype6-dev unzip git nginx \
    && docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql gd zip bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --no-progress

COPY . .
# package:discover (triggered by dump-autoload's post-autoload-dump script)
# fully boots the app, including config/backup.php's notification email
# validation — it fails on a null MAIL_FROM_ADDRESS, which is all there is
# with no .env yet. This placeholder is only for that boot: real values
# come from docker-compose's `environment:` block at runtime, and Laravel's
# dotenv loader never overwrites a variable the real environment already
# set, so it's harmless there.
RUN cp -n .env.example .env \
    && composer dump-autoload --optimize \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN rm -f /etc/nginx/sites-enabled/default \
    && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

CMD ["/usr/local/bin/entrypoint.sh"]
