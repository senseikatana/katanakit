import type {
	SeoMeta,
	SeoMetaInput,
	SeoOgImageObject,
	SeoRobotsObject,
	SeoTagNode,
	UseSeoMetaBase,
	UseSeoMetaOptions,
} from "./seo-meta.types.js";
import { type SiteConfig, siteConfig as defaultSiteConfig } from "./site.config.js";

export type {
	SeoArrayable,
	SeoBooleanable,
	SeoMeta,
	SeoMetaArticle,
	SeoMetaFlat,
	SeoMetaInput,
	SeoOgImageObject,
	SeoRobotsObject,
	SeoTagNode,
	UseSeoMetaBase,
	UseSeoMetaOptions,
} from "./seo-meta.types.js";

/**
 * Result of {@link useSeoMeta}: `html` / `tags` for the head, plus **one**
 * flat object of resolved fields (site + HTML + OG). No duplicate
 * `title` / `meta.title` / `config.title`.
 *
 * - `title` = document title (page)
 * - `siteTitle` = brand / site name
 * - `html` / `tags` = what you inject into `<head>`
 */
export type SeoTagResult = UseSeoMetaOptions & {
	html: string;
	tags: SeoTagNode[];
	jsonLd?: Record<string, unknown>;
};

/** @deprecated Use {@link SeoTagResult}. */
export type SeoTagsResult = SeoTagResult;

/**
 * SEO helper: one flat object in → one flat object out (+ html/tags).
 *
 * @example
 * ```ts
 * const seo = useSeoMeta({
 *   site: "https://example.com",
 *   siteTitle: "My Site",
 *   title: "Home",
 *   description: "…",
 *   ogImage: "https://example.com/image.png",
 * });
 * // seo.title, seo.site, seo.ogImage — once each
 * // seo.html / seo.tags — head injection
 * ```
 */
export function useSeoMeta<OmitKeys extends keyof UseSeoMetaBase = never>(
	opts: UseSeoMetaOptions<OmitKeys>,
	defaults: SiteConfig = defaultSiteConfig,
): SeoTagResult {
	const { config, meta } = splitUseSeoMetaOptions(opts as UseSeoMetaOptions, defaults);
	const merged = mergeSeoDefaults(meta, config);
	const tags = flattenSeoMetaToTags(merged, config);

	const rss = buildRssTagNode(config);
	if (rss) tags.push(rss);

	const jsonLd = config.seo.jsonLd ? buildJsonLdFromInput(merged, config) : undefined;
	if (jsonLd) {
		tags.push({
			tag: "script",
			attrs: { type: "application/ld+json" },
			text: safeJsonLd(jsonLd),
		});
	}

	const title = String(merged.title ?? config.title);
	const description = String(merged.description ?? config.description);
	const url = String(merged.ogUrl ?? merged.canonical ?? merged.url ?? config.site);
	const ogImage = resolveOgImageUrl(merged, config);

	return {
		...merged,
		site: config.site,
		siteTitle: config.title,
		lang: config.lang,
		rss: config.rss,
		seo: {
			noindex: config.seo.noindex,
			canonical: config.seo.canonical,
			openGraph: config.seo.openGraph,
			jsonLd: config.seo.jsonLd,
		},
		nav: config.nav,
		title,
		description,
		url,
		ogUrl: merged.ogUrl ?? url,
		ogImage: ogImage ?? (typeof merged.ogImage === "string" ? merged.ogImage : undefined),
		canonical: merged.canonical ?? (config.seo.canonical ? url : merged.canonical),
		html: serializeSeoTags(tags),
		tags,
		jsonLd,
	};
}

/**
 * @deprecated Prefer {@link useSeoMeta} with a unified flat object.
 * Legacy: `useSeoTag(siteConfig, { title, description, ... })`.
 */
export function useSeoTag(config: SiteConfig, meta: SeoMeta): SeoTagResult {
	return useSeoMeta({ ...siteConfigToOpts(config), ...legacySeoMetaToInput(meta) });
}

/** @deprecated Prefer {@link useSeoMeta}. */
export const useSeoTags = useSeoTag;

/** Maps a {@link SiteConfig} into unified {@link UseSeoMetaOptions} site fields. */
function siteConfigToOpts(config: SiteConfig): UseSeoMetaOptions {
	return {
		site: config.site,
		siteTitle: config.title,
		lang: config.lang,
		author: config.author,
		ogImage: config.ogImage,
		description: config.description,
		rss: config.rss,
		seo: {
			noindex: config.seo.noindex,
			canonical: config.seo.canonical,
			openGraph: config.seo.openGraph,
			jsonLd: config.seo.jsonLd,
		},
		nav: config.nav,
	};
}

function splitUseSeoMetaOptions(
	opts: UseSeoMetaOptions,
	defaults: SiteConfig,
): { config: SiteConfig; meta: SeoMetaInput } {
	const { site, siteTitle, lang, rss, seo, nav, ...metaRest } = opts;

	const brand =
		siteTitle ??
		(typeof opts.ogSiteName === "string" ? opts.ogSiteName : undefined) ??
		defaults.title;

	const config: SiteConfig = {
		site: site ?? defaults.site,
		title: brand,
		description:
			(typeof metaRest.description === "string" ? metaRest.description : undefined) ??
			defaults.description,
		lang: lang ?? defaults.lang,
		author: (typeof metaRest.author === "string" ? metaRest.author : undefined) ?? defaults.author,
		ogImage:
			typeof metaRest.ogImage === "string" ? metaRest.ogImage : (defaults.ogImage ?? undefined),
		twitter: defaults.twitter,
		rss: {
			enabled: rss?.enabled ?? defaults.rss.enabled,
			path: rss?.path ?? defaults.rss.path,
			title: rss?.title ?? defaults.rss.title,
			description: rss?.description ?? defaults.rss.description,
			limit: rss?.limit ?? defaults.rss.limit,
		},
		seo: {
			noindex: seo?.noindex ?? defaults.seo.noindex,
			canonical: seo?.canonical ?? defaults.seo.canonical,
			openGraph: seo?.openGraph ?? defaults.seo.openGraph,
			twitterCard: defaults.seo.twitterCard,
			jsonLd: seo?.jsonLd ?? defaults.seo.jsonLd,
		},
		nav: nav ?? defaults.nav,
	};

	return { config, meta: { ...metaRest } };
}

/**
 * Applies tags from a {@link SeoTagResult} into `document.head` (Vanilla / SPA).
 * No-op when `document` is unavailable (SSR).
 */
export function useApplySeoTag(
	seo: SeoTagResult,
	head: ParentNode | null = typeof document !== "undefined" ? document.head : null,
): void {
	if (!head || typeof document === "undefined") return;

	for (const el of head.querySelectorAll("[data-katanakit-seo]")) {
		el.remove();
	}

	for (const node of seo.tags) {
		const el = document.createElement(node.tag);
		el.setAttribute("data-katanakit-seo", "");
		if (node.attrs) {
			for (const [key, value] of Object.entries(node.attrs)) {
				el.setAttribute(key, value);
			}
		}
		if (node.text !== undefined) {
			el.textContent = node.text;
		}
		head.appendChild(el);
	}
}

/** HTML string of meta tags (no RSS). Prefer {@link useSeoMeta}. */
export function useGenerateMetaTags(config: SiteConfig, meta: SeoMeta): string {
	const { tags } = useSeoMeta({
		...siteConfigToOpts({ ...config, rss: { ...config.rss, enabled: false } }),
		...legacySeoMetaToInput(meta),
	});
	return serializeSeoTags(tags.filter((t) => !(t.tag === "link" && t.attrs?.rel === "alternate")));
}

export function useTitle(config: SiteConfig, pageTitle?: string): string {
	if (!pageTitle || pageTitle === config.title) {
		return `<title>${escapeHtml(config.title)}</title>`;
	}
	return `<title>${escapeHtml(`${pageTitle} | ${config.title}`)}</title>`;
}

export function useRssHeadLink(config: SiteConfig): string {
	const node = buildRssTagNode(config);
	return node ? serializeSeoTag(node) : "";
}

/** Full `<head>` HTML (meta + RSS). Accepts legacy {@link SeoMeta} or flat {@link SeoMetaInput}. */
export function useHeadTags(config: SiteConfig, meta: SeoMeta | SeoMetaInput): string {
	if (isLegacySeoMeta(meta)) {
		return useSeoTag(config, meta).html;
	}
	return useSeoMeta({ ...siteConfigToOpts(config), ...meta }).html;
}

function isLegacySeoMeta(meta: SeoMeta | SeoMetaInput): meta is SeoMeta {
	return (
		"publishedTime" in meta ||
		"modifiedTime" in meta ||
		"noindex" in meta ||
		("tags" in meta && !("articleTag" in meta))
	);
}

// --- Merge & legacy ---

function legacySeoMetaToInput(meta: SeoMeta): SeoMetaInput {
	const input: SeoMetaInput = {
		title: meta.title,
	};
	if (meta.description != null) input.description = meta.description;
	if (meta.canonical != null) input.canonical = meta.canonical;
	if (meta.url != null) {
		input.url = meta.url;
		input.ogUrl = meta.url;
	}
	if (meta.ogImage != null) input.ogImage = meta.ogImage;
	if (meta.ogType != null) input.ogType = meta.ogType;
	if (meta.author != null) input.author = meta.author;
	if (meta.ogType === "article") {
		if (meta.publishedTime != null) input.articlePublishedTime = meta.publishedTime;
		if (meta.modifiedTime != null) input.articleModifiedTime = meta.modifiedTime;
		if (meta.tags != null) input.articleTag = meta.tags;
		if (meta.author) input.articleAuthor = [meta.author];
	}
	if (meta.noindex) {
		input.robots = "noindex, nofollow";
	}
	return input;
}

function mergeSeoDefaults(input: SeoMetaInput, config?: SiteConfig): SeoMetaInput {
	if (!config) return { ...input };

	const pageTitle = input.title ?? config.title;
	const siteSuffix = ` | ${config.title}`;
	const alreadySuffixed =
		typeof pageTitle === "string" && pageTitle !== config.title && pageTitle.endsWith(siteSuffix);
	const title =
		pageTitle === config.title || !pageTitle || alreadySuffixed
			? (pageTitle ?? config.title)
			: `${pageTitle} | ${config.title}`;

	const description = input.description ?? config.description;
	const url = input.ogUrl ?? input.canonical ?? input.url ?? config.site;
	const ogImage = input.ogImage ?? config.ogImage;

	const merged: SeoMetaInput = {
		...input,
		title,
		description,
		ogTitle: input.ogTitle ?? title,
		ogDescription: input.ogDescription ?? description,
		ogUrl: input.ogUrl ?? url,
		ogSiteName: input.ogSiteName ?? config.title,
		ogLocale: input.ogLocale ?? config.lang.replace("-", "_"),
		ogType: input.ogType ?? "website",
		author: input.author ?? config.author,
		canonical: input.canonical ?? (config.seo.canonical ? url : input.canonical),
		url,
	};

	if (ogImage !== undefined && ogImage !== null) {
		merged.ogImage = ogImage;
	}

	if (config.seo.noindex && merged.robots == null) {
		merged.robots = "noindex, nofollow";
	}

	if (!config.seo.openGraph) {
		for (const key of Object.keys(merged) as (keyof SeoMetaInput)[]) {
			if (String(key).startsWith("og") || String(key).startsWith("article")) {
				delete merged[key];
			}
		}
		merged.title = title;
		merged.description = description;
		merged.author = input.author ?? config.author;
		merged.canonical = input.canonical ?? (config.seo.canonical ? url : undefined);
	}

	return merged;
}

function resolveOgImageUrl(input: SeoMetaInput, config?: SiteConfig): string | undefined {
	const raw = input.ogImage ?? input.ogImageUrl ?? config?.ogImage;
	if (raw == null) return undefined;
	if (typeof raw === "string") {
		return absoluteUrl(raw, config?.site);
	}
	const first = Array.isArray(raw) ? raw[0] : raw;
	if (first && typeof first === "object" && "url" in first && first.url) {
		return absoluteUrl(String(first.url), config?.site);
	}
	return undefined;
}

function absoluteUrl(value: string, site?: string): string {
	if (value.startsWith("http://") || value.startsWith("https://")) return value;
	if (!site) return value;
	return `${site.replace(/\/$/, "")}${value.startsWith("/") ? value : `/${value}`}`;
}

// --- Flatten input → nodes ---

const NAME_KEYS = new Set(["description", "keywords", "author", "viewport", "robots"]);

const SKIP_KEYS = new Set([
	"url",
	"title",
	"canonical",
	"charset",
	"site",
	"siteTitle",
	"lang",
	"rss",
	"seo",
	"nav",
]);

function flattenSeoMetaToTags(input: SeoMetaInput, config?: SiteConfig): SeoTagNode[] {
	const tags: SeoTagNode[] = [];

	if (input.charset) {
		tags.push({ tag: "meta", attrs: { charset: String(input.charset) } });
	}

	if (input.title != null && input.title !== "") {
		tags.push({ tag: "title", text: String(input.title) });
	}

	if (input.canonical) {
		tags.push({ tag: "link", attrs: { rel: "canonical", href: String(input.canonical) } });
	}

	for (const [key, raw] of Object.entries(input)) {
		if (raw === undefined || raw === null) continue;
		if (SKIP_KEYS.has(key)) continue;

		if (key === "ogImage") {
			tags.push(...flattenOgImage(raw, config));
			continue;
		}

		if (key === "robots") {
			const content = serializeRobots(raw as string | SeoRobotsObject);
			if (content) tags.push({ tag: "meta", attrs: { name: "robots", content } });
			continue;
		}

		if (key === "viewport" && typeof raw === "object") {
			const content = Object.entries(raw as Record<string, unknown>)
				.filter(([, v]) => v != null)
				.map(([k, v]) => `${camelToKebab(k)}=${v}`)
				.join(", ");
			if (content) tags.push({ tag: "meta", attrs: { name: "viewport", content } });
			continue;
		}

		if (Array.isArray(raw)) {
			for (const item of raw) {
				pushScalarMeta(tags, key, item);
			}
			continue;
		}

		pushScalarMeta(tags, key, raw);
	}

	return tags;
}

function pushScalarMeta(tags: SeoTagNode[], key: string, value: unknown): void {
	const content = String(value);
	if (NAME_KEYS.has(key)) {
		tags.push({ tag: "meta", attrs: { name: camelToMetaName(key), content } });
		return;
	}
	if (key.startsWith("og") || key.startsWith("article")) {
		tags.push({ tag: "meta", attrs: { property: camelToMetaProperty(key), content } });
		return;
	}
	tags.push({ tag: "meta", attrs: { name: camelToMetaName(key), content } });
}

function flattenOgImage(raw: unknown, config?: SiteConfig): SeoTagNode[] {
	const tags: SeoTagNode[] = [];
	const prop = "og:image";

	if (typeof raw === "string") {
		tags.push({
			tag: "meta",
			attrs: { property: prop, content: absoluteUrl(raw, config?.site) },
		});
		return tags;
	}

	const list = Array.isArray(raw) ? raw : [raw];
	for (const item of list) {
		if (!item || typeof item !== "object") continue;
		const obj = item as SeoOgImageObject;
		if (obj.url) {
			tags.push({
				tag: "meta",
				attrs: { property: prop, content: absoluteUrl(String(obj.url), config?.site) },
			});
		}
		if (obj.secureUrl) {
			tags.push({
				tag: "meta",
				attrs: { property: `${prop}:secure_url`, content: String(obj.secureUrl) },
			});
		}
		if (obj.type)
			tags.push({ tag: "meta", attrs: { property: `${prop}:type`, content: String(obj.type) } });
		if (obj.width != null) {
			tags.push({ tag: "meta", attrs: { property: `${prop}:width`, content: String(obj.width) } });
		}
		if (obj.height != null) {
			tags.push({ tag: "meta", attrs: { property: `${prop}:height`, content: String(obj.height) } });
		}
		if (obj.alt)
			tags.push({ tag: "meta", attrs: { property: `${prop}:alt`, content: String(obj.alt) } });
	}
	return tags;
}

function serializeRobots(value: string | SeoRobotsObject): string {
	if (typeof value === "string") return value;
	const parts: string[] = [];
	const map: Record<string, string> = {
		index: "index",
		follow: "follow",
		noindex: "noindex",
		nofollow: "nofollow",
		none: "none",
		noarchive: "noarchive",
		nosnippet: "nosnippet",
	};
	for (const [k, directive] of Object.entries(map)) {
		if (truthy(value[k as keyof SeoRobotsObject])) parts.push(directive);
	}
	return parts.join(", ");
}

function truthy(v: unknown): boolean {
	return v === true || v === "true" || v === 1 || v === "1";
}

function camelToKebab(key: string): string {
	return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function camelToMetaName(key: string): string {
	return camelToKebab(key);
}

function camelToMetaProperty(key: string): string {
	const overrides: Record<string, string> = {
		ogSiteName: "og:site_name",
		ogImageSecureUrl: "og:image:secure_url",
	};
	if (overrides[key]) return overrides[key];

	if (key.startsWith("og")) {
		const rest = key.slice(2);
		return `og:${rest.replace(/([a-z0-9])([A-Z])/g, "$1:$2").toLowerCase()}`;
	}
	if (key.startsWith("article")) {
		const rest = key.slice("article".length);
		return `article:${rest.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase()}`;
	}
	return camelToKebab(key);
}

function buildRssTagNode(config: SiteConfig): SeoTagNode | null {
	if (!config.rss.enabled) return null;
	const path = config.rss.path ?? "/rss.xml";
	const title = config.rss.title ?? config.title;
	return {
		tag: "link",
		attrs: {
			rel: "alternate",
			type: "application/rss+xml",
			title,
			href: path,
		},
	};
}

function buildJsonLdFromInput(
	input: SeoMetaInput,
	config: SiteConfig,
): Record<string, unknown> | undefined {
	const url = String(input.ogUrl ?? input.canonical ?? input.url ?? config.site);

	if (input.ogType === "article") {
		return {
			"@context": "https://schema.org",
			"@type": "Article",
			headline: input.ogTitle ?? input.title,
			description: input.ogDescription ?? input.description ?? config.description,
			url,
			author: {
				"@type": "Person",
				name: input.articleAuthor?.[0] ?? input.author ?? config.author,
			},
			publisher: {
				"@type": "Organization",
				name: config.title,
			},
			datePublished: input.articlePublishedTime,
			dateModified: input.articleModifiedTime ?? input.articlePublishedTime,
			image: resolveOgImageUrl(input, config),
			mainEntityOfPage: {
				"@type": "WebPage",
				"@id": url,
			},
		};
	}

	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: config.title,
		description: config.description,
		url: config.site,
		author: {
			"@type": "Person",
			name: config.author,
		},
	};
}

function safeJsonLd(data: Record<string, unknown>): string {
	return JSON.stringify(data)
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026");
}

function serializeSeoTags(tags: SeoTagNode[]): string {
	return tags.map(serializeSeoTag).join("\n");
}

function serializeSeoTag(node: SeoTagNode): string {
	if (node.tag === "title") {
		return `<title>${escapeHtml(node.text ?? "")}</title>`;
	}
	if (node.tag === "script") {
		return `<script${formatAttrs(node.attrs)}>${node.text ?? ""}</script>`;
	}
	if (node.tag === "meta" && node.attrs?.charset) {
		return `<meta charset="${escapeAttr(node.attrs.charset)}" />`;
	}
	return `<${node.tag}${formatAttrs(node.attrs)} />`;
}

function formatAttrs(attrs?: Record<string, string>): string {
	if (!attrs) return "";
	return Object.entries(attrs)
		.map(([key, value]) => ` ${key}="${escapeAttr(value)}"`)
		.join("");
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
