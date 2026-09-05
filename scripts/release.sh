#!/usr/bin/env bash
# ============================================================
#  scripts/release.sh — Create a new release
#
#  Usage:
#    bash scripts/release.sh [patch|minor|major]
#
#  What it does:
#    1. Bumps version in package.json (npm version)
#    2. Compiles dist/css/katanakit.css
#    3. Syncs versions.json from git tags
#    4. Commits, tags, pushes
#    5. Creates a GitHub release with auto-generated notes
# ============================================================
set -euo pipefail

BUMP="${1:-patch}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT"

echo "==> Current version: $(node -p "require('./package.json').version")"
echo "==> Bump type: $BUMP"

# 1. Bump version (creates commit + tag)
npm version "$BUMP" --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
TAG="v$NEW_VERSION"
echo "==> New version: $NEW_VERSION (tag: $TAG)"

# 2. Build CSS artifact
echo "==> Building CSS..."
"$ROOT/node_modules/.bin/sass" src/scss/main.scss dist/css/katanakit.css --no-source-map --style=compressed

# 3. Sync versions.json
echo "==> Syncing versions.json..."
bash "$SCRIPT_DIR/sync-versions.sh"

# 4. Commit, tag, push
echo "==> Committing and tagging..."
git add package.json dist/css/katanakit.css site/src/content/versions.json
git commit -m "release: $TAG"
git tag "$TAG"

echo "==> Pushing to origin..."
git push origin HEAD
git push origin "$TAG"

# 5. Create GitHub release
echo "==> Creating GitHub release..."
gh release create "$TAG" \
  --title "$TAG" \
  --generate-notes \
  --latest

echo ""
echo "✅ Release $TAG created!"
echo "   GitHub: https://github.com/senseikatana/katanakit-css/releases/tag/$TAG"
echo "   npm:    npm publish (run manually when ready)"
echo "   Docs:   GitHub Actions will deploy automatically"
