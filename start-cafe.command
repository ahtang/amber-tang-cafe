#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
 echo 'Node.js 20+ is required. Install it from https://nodejs.org and reopen this file.'
 read -r -p 'Press Enter to close...'; exit 1
fi
if [ -f .env ]; then
 set -a
 . ./.env
 set +a
fi
echo 'Opening Amber Cafe on http://127.0.0.1:4173 ...'
(sleep 2; open 'http://127.0.0.1:4173') &
node server/server.mjs
