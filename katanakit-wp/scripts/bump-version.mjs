#!/usr/bin/env node
/**
 * Bumps the version in package.json (and mirrors it to the theme
 * style.css header), commits, and tags the release.
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
const PACKAGE_JSON = join(ROOT, "package.json");
const STYLE_CSS = join(ROOT, "style.css");

const args = process.argv.slice(2);
const kind = args[0];

function readVersion() {
	return JSON.parse(readFileSync(PACKAGE_JSON, "utf8")).version;
}

function writeVersion(version) {
	const pkg = readFileSync(PACKAGE_JSON, "utf8");
	writeFileSync(PACKAGE_JSON, pkg.replace(/("version":\s*)"[^"]+"/, `$1"${version}"`));
	const css = readFileSync(STYLE_CSS, "utf8");
	writeFileSync(STYLE_CSS, css.replace(/^Version:.*$/m, `Version: ${version}`));
}

function bump(current, release) {
	const [major, minor, patch] = current.split(".").map(Number);
	if (release === "major") return `${major + 1}.0.0`;
	if (release === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

if (kind === "--sync") {
	const tag = execFileSync("git", ["tag", "--sort=-v:refname"], { cwd: ROOT, encoding: "utf8" })
		.split("\n")
		.map((line) => line.trim())
		.find((line) => /^v\d+\.\d+\.\d+$/.test(line));
	if (!tag) {
		console.error("No vX.Y.Z tags found");
		process.exit(1);
	}
	writeVersion(tag.replace(/^v/, ""));
	console.log(`Synced to ${tag}`);
	process.exit(0);
}

if (kind !== "patch" && kind !== "minor" && kind !== "major") {
	console.error("Usage: node scripts/bump-version.mjs <patch|minor|major> | --sync");
	process.exit(1);
}

const version = bump(readVersion(), kind);
writeVersion(version);

const git = (...gitArgs) => execFileSync("git", gitArgs, { cwd: ROOT, stdio: "inherit" });
git("add", "-u");
git("commit", "-m", `chore: release v${version}`);
git("tag", `v${version}`);
console.log(`Released v${version}`);
