import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const ROOT_DIR = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	clearScreen: true,
	resolve: {
		alias: {
			"@": resolve(ROOT_DIR, "src"),
			"@/guides": resolve(ROOT_DIR, "guides/"),
			// Resolve Solid's client build in tests — the default node condition
			// maps "solid-js" to the SSR build where `createEffect` is a no-op.
			"solid-js": resolve(ROOT_DIR, "node_modules/solid-js/dist/solid.js"),
		},
		tsconfigPaths: true,
	},
	base: "/",
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
	},
	root: process.cwd(),
});
