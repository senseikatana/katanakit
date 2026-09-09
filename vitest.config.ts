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
		},
		tsconfigPaths: true,
	},
	base: "https://senseikatana.com/",
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
	},
	root: process.cwd(),
});
