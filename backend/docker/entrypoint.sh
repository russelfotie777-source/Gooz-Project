#!/bin/sh
set -e

# See storage:link's own comment in the Dockerfile for why this runs here
# rather than being copied in from the host.
php artisan storage:link --force

php-fpm -D
exec nginx -g 'daemon off;'
