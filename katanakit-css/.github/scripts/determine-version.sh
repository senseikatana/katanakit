#!/usr/bin/env bash
set -euo pipefail

# Determines the next semantic version tag from Conventional Commits since the
# latest tag. This mirrors the `useRelease` (`on_git release`) helper:
#   - "BREAKING CHANGE" in the body, or a `type!:` prefix  -> major
#   - a `feat:` or `docs:` commit                          -> minor
#   - anything else                                        -> patch
#
# Prints the next version tag (e.g. `v2.3.0`) to stdout.

latest_tag="$(git describe --tags --abbrev=0 2>/dev/null || echo "")"

major=0
minor=0
patch=0
if [[ "$latest_tag" =~ ^v?([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
	major="${BASH_REMATCH[1]}"
	minor="${BASH_REMATCH[2]}"
	patch="${BASH_REMATCH[3]}"
fi

commit_range="HEAD"
if [[ -n "$latest_tag" ]]; then
	commit_range="${latest_tag}..HEAD"
fi

bump_level="patch"

if [[ "$latest_tag" == "v0.0.0" ]]; then
	bump_level="minor"
else
	commits="$(git log "$commit_range" --pretty=format:"%s%n%b" 2>/dev/null || echo "")"
	if [[ -n "$commits" ]]; then
		while IFS= read -r line; do
			lower_line="${line,,}" # bash >= 4 lowercase
			# Breaking change = Major
			if [[ "$lower_line" == *"breaking change"* ]] || [[ "$line" =~ ^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-zA-Z0-9_/-]+\))?!: ]]; then
				bump_level="major"
				break
			fi
			# Feature = Minor
			if [[ "$line" =~ ^(feat|docs)(\([a-zA-Z0-9_/-]+\))?: ]]; then
				if [[ "$bump_level" != "major" ]]; then
					bump_level="minor"
				fi
			fi
		done <<< "$commits"
	fi
fi

case "$bump_level" in
	major)
		major=$((major + 1))
		minor=0
		patch=0
		;;
	minor)
		minor=$((minor + 1))
		patch=0
		;;
	patch)
		patch=$((patch + 1))
		;;
esac

echo "v${major}.${minor}.${patch}"
