#!/usr/bin/env bash
# ============================================================
#  scripts/build-docs-css.sh
#  Compiles ONLY the utility classes and color tokens (no reset)
#  into a CSS file for the documentation site. This prevents the
#  framework's preflight from overriding Starlight's own styles.
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT="$ROOT/site/public/framework-docs.css"

mkdir -p "$(dirname "$OUT")"

# Write a temporary entry that imports variables + utilities but NOT reset.
TMPFILE=$(mktemp /tmp/kk-docs-XXXX.scss)
cat > "$TMPFILE" <<'SCSS'
@use "variables" as v;
@use "utilities" as u;

// Color custom properties (--neutral-100, --white, etc.)
@include v.generate-css-vars();

// Color utility classes: .text-*, .bg-*, .border-*, .hover-*
@include v.all-utilities();

// All opt-in utilities: sizing, flex, effects, layout
@include u.generate-all-utilities();
SCSS

# Use local sass binary to avoid npm warnings
"$ROOT/node_modules/.bin/sass" "$TMPFILE" "$OUT" --load-path "$ROOT/src/scss" --no-source-map --style=compressed
rm -f "$TMPFILE"

SIZE=$(wc -c < "$OUT")
echo "✓ framework-docs.css → $OUT ($SIZE bytes)"
