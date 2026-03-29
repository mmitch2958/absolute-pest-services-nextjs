#!/bin/bash
set -e

# Configure git auth using GITHUB_TOKEN secret so agent can push commits
if [ -n "$GITHUB_TOKEN" ]; then
  git remote set-url origin "https://mmitch2958:${GITHUB_TOKEN}@github.com/mmitch2958/absolute-pest-services-nextjs.git"
  git config --global user.email "agent@absolutepestservices.com"
  git config --global user.name "AgentRep"
fi

echo "[start.sh] Renaming SWC native binaries to avoid Replit crash..."
find node_modules -name "*.node" 2>/dev/null | grep -i swc | while read f; do
  [ -f "$f" ] && mv "$f" "${f}.bak" && echo "  Disabled: $f"
done

export NEXT_TELEMETRY_DISABLED=1

echo "[start.sh] Starting Next.js dev server on port 5000..."
exec npx next dev -p 5000 --webpack
