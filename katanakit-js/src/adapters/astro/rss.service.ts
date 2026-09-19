import type { SiteConfig } from "../../config/site.config.js";
import type { RssConfig, RssItem, RssResult } from "../../types/index.js";

/**
 * Escape special XML characters in a string.
 *
 * @param text - Raw text to escape
 * @returns XML-safe string
 */
function escapeXml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/**
 * Prevent CDATA section breakout (`]]>` ends a CDATA block early).
 *
 * @param content - Raw content string
 * @returns Sanitized content safe for CDATA
 */
function sanitizeCdata(content: string): string {
	return content.replace(/]]>/g, "]]]]><![CDATA[>");
}

/**
 * Sanitize raw XML fragments injected via `customData`.
 *
 * @param fragment - Raw XML fragment
 * @returns Sanitized XML string
 */
function sanitizeCustomXml(fragment: string): string {
	return fragment.replace(/]]>/g, "]]&gt;");
}

/**
 * Format a date as RFC-822 (required by RSS 2.0).
 *
 * @param date - Date object or ISO string
 * @returns RFC-822 formatted date string
 */
function toRfc822(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toUTCString();
}

/**
 * Build the RSS 2.0 XML string from a config object.
 *
 * @param config - RSS configuration with title, items, site URL, etc.
 * @returns Complete RSS 2.0 XML string
 */
function buildRssXml(config: RssConfig): string {
	const {
		title,
		description,
		site,
		items,
		language = "en",
		customData,
		xslUrl,
		lastBuildDate = true,
	} = config;

	const siteUrl = site.endsWith("/") ? site.slice(0, -1) : site;

	const xslProcessing = xslUrl
		? `<?xml-stylesheet type="text/xsl" href="${escapeXml(xslUrl)}" media="screen"?>\n`
		: "";

	const itemsXml = items
		.map((item) => {
			const link = item.link.startsWith("http") ? item.link : `${siteUrl}${item.link}`;
			const categories = (item.categories ?? [])
				.map((cat) => `      <category>${escapeXml(cat)}</category>`)
				.join("\n");

			return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(item.pubDate)}</pubDate>${item.description ? `\n      <description>${escapeXml(item.description)}</description>` : ""}${item.content ? `\n      <content:encoded><![CDATA[${sanitizeCdata(item.content)}]]></content:encoded>` : ""}${item.author ? `\n      <author>${escapeXml(item.author)}</author>` : ""}${categories ? `\n${categories}` : ""}${item.customData ? `\n      ${sanitizeCustomXml(item.customData)}` : ""}
    </item>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
${xslProcessing}<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>${escapeXml(language)}</language>
    <atom:link href="${escapeXml(siteUrl)}${config.xmlPath ?? "/rss.xml"}" rel="self" type="application/rss+xml" />${lastBuildDate ? `\n    <lastBuildDate>${toRfc822(new Date())}</lastBuildDate>` : ""}${customData ? `\n    ${sanitizeCustomXml(customData)}` : ""}
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Generate RSS 2.0 XML string from a config.
 * Returns a Safe Result (no throwing).
 *
 * @param config - RSS configuration
 * @returns Safe result with XML string or error
 *
 * @example
 * ```ts
 * const result = useAstroGenerateRss({
 *   title: "My Blog",
 *   description: "Posts about TypeScript",
 *   site: "https://example.com",
 *   items: [{ title: "Hello", pubDate: new Date(), link: "/blog/hello/" }],
 * });
 * if (result.ok) console.log(result.data); // XML string
 * ```
 */
export const useAstroGenerateRss = (config: RssConfig): RssResult => {
	try {
		if (!config.title || !config.site) {
			return {
				data: null,
				error: { message: "RSS config requires 'title' and 'site'." },
				ok: false,
			};
		}

		const xml = buildRssXml(config);
		return { data: xml, error: null, ok: true };
	} catch (err: unknown) {
		return {
			data: null,
			error: {
				message: "Failed to generate RSS feed.",
				details: err instanceof Error ? err.message : String(err),
			},
			ok: false,
		};
	}
};

/**
 * Generate an HTML `<link>` tag for the RSS feed.
 *
 * @param config - Config with title and optional xmlPath
 * @returns HTML link tag string
 *
 * @example
 * ```ts
 * const tag = useAstroRssLinkTag({ title: "My Blog" });
 * // <link rel="alternate" type="application/rss+xml" title="My Blog" href="/rss.xml" />
 * ```
 */
export const useAstroRssLinkTag = (config: Pick<RssConfig, "title" | "xmlPath">): string => {
	const xmlPath = config.xmlPath ?? "/rss.xml";
	return `<link rel="alternate" type="application/rss+xml" title="${escapeXml(config.title)}" href="${escapeXml(xmlPath)}" />`;
};

/**
 * Create an Astro-compatible GET endpoint handler for the RSS feed.
 *
 * @param config - RSS config with items (static array or async factory)
 * @returns Astro GET handler function
 *
 * @example
 * ```ts
 * // src/pages/rss.xml.ts
 * import { useAstroCreateRssEndpoint } from "katanakit-js/adapters/astro";
 * import { getCollection } from "astro:content";
 *
 * export const GET = useAstroCreateRssEndpoint({
 *   title: "My Blog",
 *   description: "Posts about TypeScript",
 *   site: "https://example.com",
 *   items: async () => {
 *     const posts = await getCollection("blog");
 *     return posts.map(post => ({
 *       title: post.data.title,
 *       pubDate: post.data.date,
 *       link: `/blog/${post.slug}/`,
 *     }));
 *   },
 * });
 * ```
 */
export const useAstroCreateRssEndpoint = (
	config: Omit<RssConfig, "items"> & {
		items: RssItem[] | (() => RssItem[] | Promise<RssItem[]>);
	},
): ((context: { site?: URL | string }) => Promise<Response>) => {
	return async (context: { site?: URL | string }): Promise<Response> => {
		try {
			const resolvedItems = typeof config.items === "function" ? await config.items() : config.items;

			const site = config.site || (context.site ? String(context.site) : "");
			if (!site) {
				return new Response(JSON.stringify({ error: "RSS feed requires a 'site' URL." }), {
					status: 500,
					headers: { "Content-Type": "application/json" },
				});
			}

			const result = useAstroGenerateRss({ ...config, site, items: resolvedItems });

			if (!result.ok) {
				return new Response(JSON.stringify({ error: result.error.message }), {
					status: 500,
					headers: { "Content-Type": "application/json" },
				});
			}

			return new Response(result.data, {
				status: 200,
				headers: {
					"Content-Type": "application/xml; charset=utf-8",
					"Cache-Control": "public, max-age=3600",
				},
			});
		} catch (err: unknown) {
			return new Response(
				JSON.stringify({
					error: err instanceof Error ? err.message : "Unknown error generating RSS.",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			);
		}
	};
};

/**
 * Create an RSS endpoint from a SiteConfig.
 * Reads title, description, site, and rss settings from the config.
 *
 * @param siteConfig - Site configuration object
 * @param items - RSS items or async factory
 * @returns Astro GET handler function
 *
 * @example
 * ```ts
 * // src/pages/rss.xml.ts
 * import { useAstroCreateRssEndpointFromConfig } from "katanakit-js/adapters/astro";
 * import { siteConfig } from "@/config/site.config";
 * import { getCollection } from "astro:content";
 *
 * export const GET = useAstroCreateRssEndpointFromConfig(siteConfig, async () => {
 *   const posts = await getCollection("blog");
 *   return posts.map(post => ({
 *     title: post.data.title,
 *     pubDate: post.data.date,
 *     link: `/blog/${post.slug}/`,
 *   }));
 * });
 * ```
 */
export const useAstroCreateRssEndpointFromConfig = (
	siteConfig: SiteConfig,
	items: RssItem[] | (() => RssItem[] | Promise<RssItem[]>),
): ((context: { site?: URL | string }) => Promise<Response>) => {
	return useAstroCreateRssEndpoint({
		title: siteConfig.rss.title ?? siteConfig.title,
		description: siteConfig.rss.description ?? siteConfig.description,
		site: siteConfig.site,
		items,
		xmlPath: siteConfig.rss.path,
		language: siteConfig.lang,
	});
};
