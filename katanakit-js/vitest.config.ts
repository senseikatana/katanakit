import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	clearScreen: true,
	resolve: {
		alias: {
			"@": resolve(root, "src"),
			"@/docs": resolve(root, "docs/"),
			// Resolve Solid's client build in tests — the default node condition
			// maps "solid-js" to the SSR build where `createEffect` is a no-op.
			"solid-js": resolve(root, "node_modules/solid-js/dist/solid.js"),
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
