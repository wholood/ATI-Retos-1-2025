#!/bin/bash

APP_DIR="/var/www/html"

cd "$APP_DIR" || { echo "Failed to change directory to $APP_DIR"; exit 1; }

echo "Iniciando Gunicorn..."
gunicorn --bind 0.0.0.0:5000 --workers 3 perfil:app &

echo "Iniciando Apache..."
exec apache2ctl -D FOREGROUND