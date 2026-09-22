// @ts-check

import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
	{
		ignores: [
			"dist/**",
			"guides/**",
			"node_modules/**",
			"**/*.js",
			"**/*.cjs",
			"scripts/**",
			"src/prisma/schema.d.ts",
			"src/prisma/schema.json",
		],
	},
	js.configs.recommended,
	tseslint.configs.recommended,
	eslintPluginPrettier,
	{
		plugins: {
			"simple-import-sort": simpleImportSort,
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"preserve-caught-error": "off",
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
		},
	},
);
