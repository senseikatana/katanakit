# Type Alias: UseSeoMetaBase

> **UseSeoMetaBase** = [`SeoMetaInput`](SeoMetaInput.md) & `object`

Defined in: [src/config/seo-meta.types.ts:112](https://github.com/senseikatana/katanakit-js/blob/a86a4ede2a0d7e81874bbd477970d7a9a311f35c/src/config/seo-meta.types.ts#L112)

Site + HTML + OG fields in one object (before Omit).

## Type Declaration

### lang?

> `optional` **lang?**: `string`

Language code (e.g. `"en"`, `"es-ES"`).

### nav?

> `optional` **nav?**: `object`[]

### rss?

> `optional` **rss?**: `Partial`&lt;\{ `description?`: `string`; `enabled`: `boolean`; `limit`: `number`; `path`: `string`; `title?`: `string`; \}&gt;

### seo?

> `optional` **seo?**: `Partial`&lt;\{ `canonical`: `boolean`; `jsonLd`: `boolean`; `noindex`: `boolean`; `openGraph`: `boolean`; \}&gt;

### site?

> `optional` **site?**: `string`

Site origin / base URL (no trailing slash), e.g. `"https://example.com"`.
Not a title — used for canonical, OG, RSS, and JSON-LD defaults.

### siteTitle?

> `optional` **siteTitle?**: `string`

Site brand / product name (e.g. `"KatanaKit"`).
Distinct from page [SeoMetaFlat.title](../interfaces/SeoMetaFlat.md#title).
Used as `<title>` suffix (`"Page | Brand"`), `og:site_name`, and RSS feed name.
