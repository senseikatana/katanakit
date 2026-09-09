import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(root, "src"),
		},
	},
	build: {
		copyPublicDir: true,
		cssMinify: true,
	},
	clearScreen: true,
	base: "https://senseikatana.com",
	logLevel: "info",
	appType: "mpa",
	dev: {
		sourcemap: true,
	},
	envPrefix: "VITE_",
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts"],
	},
	optimizeDeps: {
		force: true,
	},
	root: process.cwd(),
	server: {
		cors: true,
		hmr: true,
		open: false,
		port: 4000,
	},
});
