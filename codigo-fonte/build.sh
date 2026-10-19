#!/usr/bin/env bash
# Gera o site estático em ./out (requer Bun: https://bun.sh)
set -e
cd "$(dirname "$0")"
OUT=${1:-out}
mkdir -p "$OUT/assets"
bun build src/site/main.tsx  --outfile="$OUT/assets/site.js"  --target=browser --minify --define process.env.NODE_ENV='"production"'
bun build src/admin/main.tsx --outfile="$OUT/assets/admin.js" --target=browser --minify --define process.env.NODE_ENV='"production"'
cat src/style.css > "$OUT/assets/style.css"
cat src/style.css src/admin.css > "$OUT/assets/admin.css"
cp public/*.html public/*.png public/*.webmanifest public/robots.txt "$OUT/" 2>/dev/null || true
touch "$OUT/.nojekyll"
[ -f "$OUT/dados/site.json" ] || bun scripts/gerar-dados.ts "$OUT"
echo "Site gerado em $OUT"
