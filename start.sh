#!/bin/bash
set -e

echo "[start.sh] Renaming SWC native binaries to avoid Replit crash..."
find node_modules -name "*.node" 2>/dev/null | grep -i swc | while read f; do
  [ -f "$f" ] && mv "$f" "${f}.bak" && echo "  Disabled: $f"
done

export NEXT_TELEMETRY_DISABLED=1

echo "[start.sh] Starting Next.js dev server on port 5000..."
exec npx next dev -p 5000 --webpack
