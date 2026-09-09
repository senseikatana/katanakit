import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
	title: "KatanaKit",
	tagline:
		"A sharp, framework-agnostic TypeScript service toolkit organized with hexagonal architecture.",
	favicon: "img/favicon.ico",

	future: {
		v4: true,
	},

	url: "https://senseikatana.com",
	baseUrl: "/katanakit-js/",

	organizationName: "senseikatana",
	projectName: "katanakit-js",
	trailingSlash: true,

	onBrokenLinks: "log",

	i18n: {
		defaultLocale: "es",
		locales: ["en", "es"],
		path: "/",
	},

	plugins: [
		[
			"docusaurus-plugin-typedoc",
			{
				entryPoints: ["../src/index.ts"],
				tsconfig: "../tsconfig.json",
				out: "./docs/api",
				cleanOutputDir: true,
				useHTMLEncodedBrackets: true,
			},
		],
	],

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					editUrl: "https://github.com/senseikatana/katanakit-js/edit/dev/docs/",
				},
				blog: false,
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		colorMode: {
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: "KatanaKit",
			items: [
				{
					type: "docSidebar",
					sidebarId: "docsSidebar",
					position: "left",
					label: "Docs",
				},
				{
					href: "https://github.com/senseikatana/katanakit-js",
					label: "GitHub",
					position: "right",
				},
			],
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "Docs",
					items: [
						{
							label: "Getting Started",
							to: "/docs/guides/getting-started",
						},
						{
							label: "Architecture",
							to: "/docs/guides/architecture",
						},
						{
							label: "API Reference",
							to: "/docs/api",
						},
						{
							label: "Changelog",
							to: "/docs/changelog",
						},
					],
				},
				{
					title: "Community",
					items: [
						{
							label: "GitHub",
							href: "https://github.com/senseikatana/katanakit-js",
						},
						{
							label: "Issues",
							href: "https://github.com/senseikatana/katanakit-js/issues",
						},
					],
				},
				{
					title: "More",
					items: [
						{
							label: "Changelog",
							to: "/docs/changelog",
						},
						{
							label: "Roadmap",
							to: "/docs/guides/roadmap",
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} Sergio Jurado. Built with Docusaurus.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
			additionalLanguages: ["bash", "json"],
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
