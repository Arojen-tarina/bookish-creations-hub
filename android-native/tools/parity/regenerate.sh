#!/usr/bin/env bash
# Regenerates the engine's data tables and parity goldens from the ORIGINAL
# TypeScript game (bookish-creations-hub).
#
#   bash tools/parity/regenerate.sh <path-to-bookish-creations-hub> [data|goldens|all]
#
# data    -> rewrites game/data/Provinces1206.kt, CardCatalog.kt, assets/i18n/cards/<lang>.json
#            res/values*/strings_ui.xml (14 languages), the achievement catalog
#            and strings_achievements.xml (en, fi), assets/i18n/{codex,rulebook}/<lang>.json,
#            assets/i18n/moose/{en,fi}.json
# goldens -> rewrites app/src/test/resources/parity/*.json (12 seeded scripted games)
# Needs Node 22+. Work files go to tools/parity/.work (git-ignored).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
# `pwd -W` gives a Windows path under Git Bash, which the native esbuild binary needs.
SRC="$(cd "${1:?usage: regenerate.sh <bookish-creations-hub path> [data|goldens|all]}" && (pwd -W 2>/dev/null || pwd))/src"
WHAT="${2:-all}"
WORK="$HERE/.work"

mkdir -p "$WORK/patched" "$WORK/out"
rm -rf "$WORK/stubs"
cp -r "$HERE/stubs" "$HERE/run.ts" "$HERE/dump-data.ts" "$HERE/dump-card-text.ts" "$HERE/dump-ui-strings.ts" "$HERE/dump-achievements.ts" "$HERE/dump-books.ts" "$HERE/dump-moose.ts" "$WORK/"
cat > "$WORK/tsconfig.json" <<EOF
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["$SRC/*"] }, "jsx": "react-jsx" } }
EOF

# The original ids are random; a counter keeps both engines deterministic.
node -e "
const fs = require('fs');
let s = fs.readFileSync(process.argv[1], 'utf8');
const before = 'const generateId = () => Math.random().toString(36).substr(2, 9);';
if (!s.includes(before)) throw new Error('generateId line changed in the original source');
fs.writeFileSync(process.argv[2], s.replace(before, 'let __nextId = 1; const generateId = () => \'army-\' + (__nextId++);'));
" "$SRC/hooks/useProvinceGameState.ts" "$WORK/patched/useProvinceGameState.ts"

cd "$WORK"
[ -f package.json ] || echo '{ "name": "parity-work", "private": true }' > package.json
[ -d node_modules/esbuild ] || npm install --silent esbuild@0.25
BUNDLE="npx esbuild --bundle --platform=node --format=esm --tsconfig=tsconfig.json --alias:react=./stubs/react --alias:sonner=./stubs/sonner.js --log-level=warning"

if [ "$WHAT" = "data" ] || [ "$WHAT" = "all" ]; then
  $BUNDLE dump-data.ts --outfile=out/dump-data.mjs
  node out/dump-data.mjs "$WORK/data.json"
  node "$HERE/gen-kotlin.mjs" "$WORK/data.json" "$ROOT/app/src/main/java/fi/bookish/creations/arojen/tarinat/game/data"
  $BUNDLE dump-card-text.ts --outfile=out/dump-card-text.mjs
  node out/dump-card-text.mjs "$ROOT/app/src/main/assets/i18n/cards"
  # UI strings for 14 languages; names already written by hand in values/strings.xml win.
  HAND_WRITTEN="$(grep -oE 'name="[a-z0-9_]+"' "$ROOT/app/src/main/res/values/strings.xml" | sed 's/name="//;s/"//' | paste -sd, -)"
  $BUNDLE dump-ui-strings.ts --outfile=out/dump-ui-strings.mjs
  node out/dump-ui-strings.mjs "$ROOT/app/src/main/res" "$HAND_WRITTEN"
  $BUNDLE dump-achievements.ts --outfile=out/dump-achievements.mjs
  node out/dump-achievements.mjs "$SRC/game/achievementDefinitions.ts" "$ROOT/app/src/main/java/fi/bookish/creations/arojen/tarinat/game/achievements" "$ROOT/app/src/main/res"
  node "$HERE/prep-pages.mjs" "$SRC" "$WORK/patched"
  $BUNDLE dump-books.ts --outfile=out/dump-books.mjs
  node out/dump-books.mjs "$ROOT/app/src/main/assets/i18n"
  $BUNDLE dump-moose.ts --outfile=out/dump-moose.mjs
  node out/dump-moose.mjs "$ROOT/app/src/main/assets/i18n/moose"
fi

if [ "$WHAT" = "goldens" ] || [ "$WHAT" = "all" ]; then
  $BUNDLE run.ts --outfile=out/run.mjs
  GOLD="$ROOT/app/src/test/resources/parity"
  mkdir -p "$GOLD"
  for f in mongol song rus khwarezm; do
    for s in 1 2 3; do
      case $s in 1) d=normal ;; 2) d=hard ;; 3) d=easy ;; esac
      node out/run.mjs "$f" "$s" "$d" 60 "$GOLD/${f}_seed${s}.json" "$WORK/${f}_seed${s}.full.json"
    done
  done
fi
