/**
 * Astro convenience re-exports of the framework-agnostic SEO helpers.
 * Prefer importing from `katanakit-js` directly.
 *
 * Inside Nuxt apps use Nuxt's own `useSeoMeta` / `useHead` instead.
 */
export type {
	SeoMeta,
	SeoMetaFlat,
	SeoMetaInput,
	SeoTagNode,
	SeoTagResult,
	SeoTagsResult,
	UseSeoMetaBase,
	UseSeoMetaOptions,
} from "../../config/seo.service.js";
export {
	useApplySeoTag,
	useGenerateMetaTags,
	useHeadTags,
	useRssHeadLink,
	useSeoMeta,
	useSeoTag,
	useSeoTags,
	useTitle,
} from "../../config/seo.service.js";
export { type SiteConfig, siteConfig } from "../../config/site.config.js";
