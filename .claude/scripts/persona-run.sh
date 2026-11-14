#!/usr/bin/env bash
# Prepare a blind play folder for persona testers in .git/persona-runs/ (never committed).
#   .claude/scripts/persona-run.sh <run-name>   -> prints the run folder
# The folder gets the built game page, the play harness, and a snapshot of levels.js
# (so results can be analysed against the build that was played).
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: $0 <run-name>" >&2; exit 2; }
ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
BH="$ROOT/prototypes/body-hop"
[ -d "$BH/node_modules/playwright" ] || { echo "Playwright missing: run npm install in prototypes/body-hop" >&2; exit 3; }
RUN="$(git -C "$ROOT" rev-parse --path-format=absolute --git-path persona-runs)/$1"
[ ! -e "$RUN" ] || { echo "$RUN already exists: pick a new run name (an old session would be replayed)" >&2; exit 2; }
mkdir -p "$RUN/interviews" "$RUN/build"
node "$BH/tools/build-page.js" "$RUN/body.html" >/dev/null
{ echo '<!doctype html><html><head><meta charset="utf-8"></head><body>'; cat "$RUN/body.html"; echo '</body></html>'; } > "$RUN/game.html"
rm "$RUN/body.html"
cp "$BH/levels.js" "$RUN/build/levels.js"
git -C "$ROOT" rev-parse HEAD > "$RUN/build/commit"
git -C "$ROOT" status --porcelain -- prototypes/body-hop > "$RUN/build/uncommitted"
{ echo "module.paths.push($(printf %s "$BH/node_modules" | python3 -I -c 'import json,sys;print(json.dumps(sys.stdin.read()))'));"; sed 1d "$BH/tools/playtest.js"; } > "$RUN/play.js"
echo "$RUN"
