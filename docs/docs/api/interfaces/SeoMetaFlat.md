# Interface: SeoMetaFlat

Defined in: [src/config/seo-meta.types.ts:48](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L48)

Flat meta: HTML head essentials + Facebook Open Graph.

## Extends

- [`SeoMetaArticle`](SeoMetaArticle.md)

## Properties

### articleAuthor?

> `optional` **articleAuthor?**: readonly `string`[]

Defined in: [src/config/seo-meta.types.ts:38](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L38)

#### Inherited from

[`SeoMetaArticle`](SeoMetaArticle.md).[`articleAuthor`](SeoMetaArticle.md#articleauthor)

***

### articleModifiedTime?

> `optional` **articleModifiedTime?**: `string`

Defined in: [src/config/seo-meta.types.ts:39](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L39)

#### Inherited from

[`SeoMetaArticle`](SeoMetaArticle.md).[`articleModifiedTime`](SeoMetaArticle.md#articlemodifiedtime)

***

### articlePublishedTime?

> `optional` **articlePublishedTime?**: `string`

Defined in: [src/config/seo-meta.types.ts:40](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L40)

#### Inherited from

[`SeoMetaArticle`](SeoMetaArticle.md).[`articlePublishedTime`](SeoMetaArticle.md#articlepublishedtime)

***

### articleSection?

> `optional` **articleSection?**: `string`

Defined in: [src/config/seo-meta.types.ts:41](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L41)

#### Inherited from

[`SeoMetaArticle`](SeoMetaArticle.md).[`articleSection`](SeoMetaArticle.md#articlesection)

***

### articleTag?

> `optional` **articleTag?**: readonly `string`[]

Defined in: [src/config/seo-meta.types.ts:42](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L42)

#### Inherited from

[`SeoMetaArticle`](SeoMetaArticle.md).[`articleTag`](SeoMetaArticle.md#articletag)

***

### author?

> `optional` **author?**: `string`

Defined in: [src/config/seo-meta.types.ts:63](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L63)

Meta author.

***

### canonical?

> `optional` **canonical?**: `string`

Defined in: [src/config/seo-meta.types.ts:68](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L68)

Explicit canonical URL → `<link rel="canonical">`.
Prefer this over `url` when you know the preferred address.

***

### charset?

> `optional` **charset?**: `string`

Defined in: [src/config/seo-meta.types.ts:74](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L74)

***

### description?

> `optional` **description?**: `string`

Defined in: [src/config/seo-meta.types.ts:59](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L59)

Page summary → `<meta name="description">`.
Prefer this for the page; use `ogDescription` only to override the share preview.

***

### keywords?

> `optional` **keywords?**: `string`

Defined in: [src/config/seo-meta.types.ts:61](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L61)

Meta keywords (legacy; optional).

***

### ogDescription?

> `optional` **ogDescription?**: `string`

Defined in: [src/config/seo-meta.types.ts:90](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L90)

Open Graph description (`og:description`). Defaults to `description` when omitted.

***

### ogImage?

> `optional` **ogImage?**: `string` \| [`SeoArrayable`](../type-aliases/SeoArrayable.md)&lt;[`SeoOgImageObject`](SeoOgImageObject.md)&gt;

Defined in: [src/config/seo-meta.types.ts:97](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L97)

***

### ogImageAlt?

> `optional` **ogImageAlt?**: `string`

Defined in: [src/config/seo-meta.types.ts:103](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L103)

***

### ogImageHeight?

> `optional` **ogImageHeight?**: `string` \| `number`

Defined in: [src/config/seo-meta.types.ts:102](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L102)

***

### ogImageSecureUrl?

> `optional` **ogImageSecureUrl?**: `string`

Defined in: [src/config/seo-meta.types.ts:99](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L99)

***

### ogImageType?

> `optional` **ogImageType?**: `string`

Defined in: [src/config/seo-meta.types.ts:100](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L100)

***

### ogImageUrl?

> `optional` **ogImageUrl?**: `string`

Defined in: [src/config/seo-meta.types.ts:98](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L98)

***

### ogImageWidth?

> `optional` **ogImageWidth?**: `string` \| `number`

Defined in: [src/config/seo-meta.types.ts:101](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L101)

***

### ogLocale?

> `optional` **ogLocale?**: `string`

Defined in: [src/config/seo-meta.types.ts:92](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L92)

***

### ogSiteName?

> `optional` **ogSiteName?**: `string`

Defined in: [src/config/seo-meta.types.ts:96](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L96)

Open Graph site name (`og:site_name`). Defaults to `siteTitle` when omitted.

***

### ogTitle?

> `optional` **ogTitle?**: `string`

Defined in: [src/config/seo-meta.types.ts:86](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L86)

Open Graph title (`og:title`). Defaults to the resolved page `title` when omitted.

***

### ogType?

> `optional` **ogType?**: `string`

Defined in: [src/config/seo-meta.types.ts:91](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L91)

***

### ogUrl?

> `optional` **ogUrl?**: `string`

Defined in: [src/config/seo-meta.types.ts:82](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L82)

Open Graph page URL (`og:url`).
Falls back to `canonical` → `url` → `site`.

***

### robots?

> `optional` **robots?**: `string` \| [`SeoRobotsObject`](SeoRobotsObject.md)

Defined in: [src/config/seo-meta.types.ts:76](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L76)

***

### title?

> `optional` **title?**: `string`

Defined in: [src/config/seo-meta.types.ts:54](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L54)

Page document title → `<title>`.
Not the site brand (`siteTitle`). When both differ, the helper usually
renders `"Page | Brand"`.

***

### url?

> `optional` **url?**: `string`

Defined in: [src/config/seo-meta.types.ts:73](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L73)

Absolute page URL. Fallback for canonical / `og:url` when those are omitted
(resolution order: `ogUrl` → `canonical` → `url` → `site`).

***

### viewport?

> `optional` **viewport?**: `string` \| `Record`&lt;`string`, `string` \| `number` \| `undefined`&gt;

Defined in: [src/config/seo-meta.types.ts:75](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/config/seo-meta.types.ts#L75)
