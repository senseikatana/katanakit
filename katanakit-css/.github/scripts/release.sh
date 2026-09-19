#!/usr/bin/env bash
set -euo pipefail

# Creates a Git tag and the matching GitHub release. Mirrors the tag + release
# portion of the `useRelease` (`on_git release`) helper, non-interactively:
#   - computes the next version (or reuses an explicitly provided one)
#   - skips cleanly when the tag already exists
#   - pushes the tag and creates the release with `gh release create`
#
# Release notes order matches `useRelease`: README.md -> CHANGELOG.md ->
# commit list since the previous tag.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

tag_name="${1:-}"

# If HEAD is already tagged, there is nothing new to release (e.g. the workflow
# was re-run on the same commit). Avoid creating a spurious patch tag.
if [[ -z "$tag_name" ]] && git describe --tags --exact-match HEAD >/dev/null 2>&1; then
	echo "HEAD is already tagged ($(git describe --tags --exact-match HEAD)) — nothing to release."
	exit 0
fi

if [[ -z "$tag_name" ]]; then
	tag_name="$(bash "${SCRIPT_DIR}/determine-version.sh")"
fi

# Normalize and validate the version: accept "2.3.0" or "v2.3.0", output "v2.3.0".
if [[ "$tag_name" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
	tag_name="v${tag_name#v}"
else
	echo "❌ Invalid version '${tag_name}'. Expected MAJOR.MINOR.PATCH (e.g. v2.3.0)." >&2
	exit 1
fi

if git rev-parse "refs/tags/${tag_name}" >/dev/null 2>&1; then
	echo "Tag ${tag_name} already exists — nothing to do."
	exit 0
fi

# Configure a bot identity so the annotated tag can be created in CI.
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

tag_msg="Release ${tag_name}"
git tag -a "$tag_name" -m "$tag_msg"
git push origin "$tag_name"
echo "Created and pushed tag ${tag_name}."

# A release requires a tag to be pushed first; gh reads the tag from the remote.
if ! command -v gh >/dev/null 2>&1; then
	echo "gh CLI not available — skipping GitHub release."
	exit 0
fi

# Idempotency: if the release already exists, do nothing (tag may exist while
# the release does not — e.g. the tag was pushed manually).
if gh release view "$tag_name" >/dev/null 2>&1; then
	echo "GitHub release ${tag_name} already exists — nothing to do."
	exit 0
fi

release_notes=""
if [[ -f README.md ]]; then
	release_notes="$(cat README.md)"
elif [[ -f CHANGELOG.md ]]; then
	release_notes="$(cat CHANGELOG.md)"
else
	prev_tag="$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")"
	if [[ -n "$prev_tag" ]]; then
		release_notes="$(git log "${prev_tag}..${tag_name}" --pretty=format:'- %s (%h)' --no-merges 2>/dev/null || echo "")"
	else
		release_notes="$(git log "$tag_name" --pretty=format:'- %s (%h)' --no-merges 2>/dev/null || echo "")"
	fi
fi

# The release body is passed through a file to avoid argument-length and
# quoting issues with large notes (README/CHANGELOG).
notes_file="$(mktemp)"
printf '%s\n' "${release_notes:-Release $tag_name}" >"$notes_file"

gh release create "$tag_name" --title "$tag_name" --notes-file "$notes_file" --latest || status=$?
rm -f "$notes_file"
if [[ -z "${status:-}" ]]; then
	echo "Created GitHub release ${tag_name}."
else
	# Tag is already pushed and correct; a release failure must not fail the
	# workflow (mirrors `useRelease`, which warns instead of erroring).
	echo "⚠️  Tag ${tag_name} created, but the GitHub release could not be created."
	exit 0
fi
