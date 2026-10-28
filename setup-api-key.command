#!/bin/bash
set -e
cd "$(dirname "$0")" || exit 1
if ! command -v osascript >/dev/null 2>&1; then
  echo "This helper requires macOS. See README-LIVE-AI.md for manual setup."
  exit 1
fi
KEY=$(osascript -e 'try' -e 'set answer to display dialog "Paste your OpenAI API key here. It is saved only on this Mac in the private .env file, not sent to ChatGPT. Never post it in a chat." default answer "" with title "Amber Cafe — API Key Setup" with hidden answer buttons {"Cancel", "Save Key"} default button "Save Key"' -e 'return text returned of answer' -e 'on error' -e 'return ""' -e 'end try')
if [ -z "$KEY" ]; then
  osascript -e 'display dialog "No key was saved." buttons {"OK"} default button "OK"' >/dev/null
  exit 0
fi
case "$KEY" in
  sk-*) ;;
  *) osascript -e 'display dialog "That does not look like an OpenAI API key. No key was saved. Please copy the full key from the API platform." buttons {"OK"} default button "OK"' >/dev/null; exit 1;;
esac
if [[ ! "$KEY" =~ ^sk-[A-Za-z0-9_-]+$ ]]; then
  osascript -e 'display dialog "Invalid key characters. No key saved." buttons {"OK"} default button "OK"' >/dev/null
  exit 1
fi
umask 077
# Preserve host settings and model from the included example on first install.
if [ ! -f .env ]; then
  cp .env.example .env
fi
# Replace only the key field, leaving configured model/port intact. Avoid printing secrets.
export AMBER_NEW_API_KEY="$KEY"
/usr/bin/python3 - <<'PYSETUP'
from pathlib import Path
import os
p=Path('.env')
lines=p.read_text().splitlines()
key=os.environ['AMBER_NEW_API_KEY']
found=False
for i,line in enumerate(lines):
    if line.startswith('OPENAI_API_KEY='):
        lines[i]='OPENAI_API_KEY='+key
        found=True
if not found: lines.insert(0,'OPENAI_API_KEY='+key)
p.write_text('\n'.join(lines)+'\n')
p.chmod(0o600)
PYSETUP
unset KEY AMBER_NEW_API_KEY
osascript -e 'display dialog "API key saved locally! Next, double-click start-cafe.command to launch the café. (You need Node.js 20+ installed.)" buttons {"OK"} default button "OK" with title "Amber Cafe — Setup Complete"' >/dev/null
