#!/bin/sh
set -e

if [ -n "$API_URL" ]; then
  echo "window.__API_URL__ = \"$API_URL\";" > /usr/share/nginx/html/config.js
fi

exec nginx -g "daemon off;"
