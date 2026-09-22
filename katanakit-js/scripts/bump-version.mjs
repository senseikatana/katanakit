#!/usr/bin/env node
/**
 * Bumps the version in package.json (and mirrors it to guides/package.json),
 * commits, and tags the release.
 *
 * Usage:
 *   node scripts/bump-version.mjs patch|minor|major
 *   node scripts/bump-version.mjs --sync   # mirror the latest git tag, no commit
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFESTS = [join(ROOT, "package.json"), join(ROOT, "guides/package.json")];

const args = process.argv.slice(2);
const kind = args[0];

function readVersion(manifest) {
	return JSON.parse(readFileSync(manifest, "utf8")).version;
}

function writeVersion(manifest, version) {
	const content = readFileSync(manifest, "utf8");
	const updated = content.replace(/("version":\s*)"[^"]+"/, `$1"${version}"`);
	writeFileSync(manifest, updated);
}

function bump(current, release) {
	const [major, minor, patch] = current.split(".").map(Number);
	if (release === "major") return `${major + 1}.0.0`;
	if (release === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

if (kind === "--sync") {
	const tag = execFileSync("git", ["tag", "--sort=-v:refname"], { cwd: ROOT, encoding: "utf8" })
		.split("\n")[0]
		.trim();
	const version = tag.replace(/^v/, "");
	for (const manifest of MANIFESTS) {
		writeVersion(manifest, version);
	}
	console.log(`Synced to v${version}`);
	process.exit(0);
}

if (kind !== "patch" && kind !== "minor" && kind !== "major") {
	console.error("Usage: node scripts/bump-version.mjs <patch|minor|major> | --sync");
	process.exit(1);
}

const version = bump(readVersion(MANIFESTS[0]), kind);
for (const manifest of MANIFESTS) {
	writeVersion(manifest, version);
}

const git = (...gitArgs) => execFileSync("git", gitArgs, { cwd: ROOT, stdio: "inherit" });
git("add", "-u");
git("commit", "-m", `chore: release v${version}`);
git("tag", `v${version}`);
console.log(`Released v${version}`);
