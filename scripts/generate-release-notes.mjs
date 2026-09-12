#!/usr/bin/env node
/**
 * Generates release notes from Conventional Commits between the previous tag
 * and the given tag. Prints markdown by default; use --json for structured
 * output that the docs site can consume.
 *
 * Usage:
 *   node scripts/generate-release-notes.mjs v2.14.1
 *   node scripts/generate-release-notes.mjs v2.14.1 --json
 *   node scripts/generate-release-notes.mjs --all --json
 */
import { execFileSync } from "node:child_process";

const REPO = "senseikatana/katanakit-js";

const SECTIONS = [
	{ type: "feat", title: "🚀 Features" },
	{ type: "fix", title: "🔧 Fixes" },
	{ type: "perf", title: "⚡ Performance" },
	{ type: "refactor", title: "♻️ Refactors" },
	{ type: "docs", title: "📝 Documentation" },
	{ type: "test", title: "🧪 Tests" },
	{ type: "build", title: "📦 Build" },
	{ type: "ci", title: "🤖 CI" },
	{ type: "chore", title: "🧹 Chores" },
];

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

function allTags() {
	return git("tag", "--sort=-v:refname")
		.split("\n")
		.map((tag) => tag.trim())
		.filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag));
}

function previousTag(tag) {
	const tags = allTags();
	const index = tags.indexOf(tag);
	return index === -1 ? undefined : tags[index + 1];
}

function parseCommit(subject) {
	const match = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/);
	if (!match) return undefined;
	const [, type, scope, breaking, message] = match;
	return { type, scope, breaking: Boolean(breaking), message };
}

function collect(tag) {
	const prev = previousTag(tag);
	const range = prev ? `${prev}..${tag}` : tag;
	const date = git("log", "-1", "--format=%cs", tag);

	const commits = git("log", "--no-merges", "--pretty=format:%s", range)
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map(parseCommit)
		.filter(Boolean)
		.filter((commit) => !(commit.type === "chore" && /^release v/.test(commit.message)));

	const sections = SECTIONS.map((section) => ({
		title: section.title,
		items: commits
			.filter((commit) => commit.type === section.type)
			.map((commit) => ({
				scope: commit.scope,
				message: commit.message,
				breaking: commit.breaking,
			})),
	})).filter((section) => section.items.length > 0);

	return { tag, version: tag.replace(/^v/, ""), date, previous: prev, sections };
}

function renderMarkdown(release) {
	const lines = [`## ${release.version} (${release.date})`, ""];

	for (const section of release.sections) {
		lines.push(`### ${section.title}`, "");
		for (const item of section.items) {
			const scope = item.scope ? `**${item.scope}:** ` : "";
			const breaking = item.breaking ? "**BREAKING** " : "";
			lines.push(`- ${breaking}${scope}${item.message}`);
		}
		lines.push("");
	}

	if (release.previous) {
		lines.push(
			`**Full Changelog**: https://github.com/${REPO}/compare/${release.previous}...${release.tag}`,
		);
	}

	return `${lines.join("\n").trimEnd()}\n`;
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const all = args.includes("--all");
const tag = args.find((arg) => !arg.startsWith("--"));

if (all) {
	const releases = allTags().map(collect);
	process.stdout.write(`${JSON.stringify(releases, null, 2)}\n`);
} else if (tag) {
	const release = collect(tag);
	process.stdout.write(asJson ? `${JSON.stringify(release, null, 2)}\n` : renderMarkdown(release));
} else {
	console.error("Usage: node scripts/generate-release-notes.mjs <tag> [--json] | --all [--json]");
	process.exit(1);
}
