import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const ROOT_DIR = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	clearScreen: true,
	resolve: {
		alias: [
			// Resolve Solid's client builds in tests — the default node condition
			// maps `solid-js` / `solid-js/store` to the SSR builds where signals,
			// effects and stores are no-ops. Anchored regexes so the bare package
			// alias does not swallow the `solid-js/store` subpath.
			{
				find: /^solid-js$/,
				replacement: resolve(ROOT_DIR, "node_modules/solid-js/dist/solid.js"),
			},
			{
				find: /^solid-js\/store$/,
				replacement: resolve(ROOT_DIR, "node_modules/solid-js/store/dist/store.js"),
			},
			{ find: "@/guides", replacement: resolve(ROOT_DIR, "guides/") },
			{ find: "@", replacement: resolve(ROOT_DIR, "src") },
		],
		tsconfigPaths: true,
	},
	base: "/",
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
	},
	root: process.cwd(),
});
