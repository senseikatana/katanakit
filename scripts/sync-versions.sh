#!/usr/bin/env bash
# ============================================================
#  scripts/sync-versions.sh — Generate versions.json from tags
#
#  Reads all v* tags from git and writes site/src/content/versions.json.
#  Used by the release script and by the GitHub Actions workflow
#  before building the docs site.
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT="$ROOT/site/src/content/versions.json"

cd "$ROOT"

echo '[' > "$OUTPUT"
echo '  { "tag": "latest", "label": "latest", "path": "/" },' >> "$OUTPUT"

# List tags newest first, write one JSON line per tag.
FIRST=true
while IFS= read -r tag; do
  [ -z "$tag" ] && continue

  # Validate tag format (vX.Y.Z)
  if [[ ! "$tag" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
    echo "WARNING: Skipping invalid tag format: $tag" >&2
    continue
  fi

  version="${tag#v}"
  safe=$(echo "$version" | tr '.' '-')

  # Add comma before all entries except the first
  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    # Add trailing comma to previous line
    sed -i '$ s/$/,/' "$OUTPUT"
  fi

  echo "  { \"tag\": \"$tag\", \"label\": \"$tag\", \"path\": \"/versions/$safe/\" }" >> "$OUTPUT"
done < <(git tag -l 'v*' --sort=-v:refname)

echo ']' >> "$OUTPUT"

COUNT=$(grep -c '"tag"' "$OUTPUT")
echo "✓ versions.json updated ($COUNT entries) → $OUTPUT"
