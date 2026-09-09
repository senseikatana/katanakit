# Function: useSeoMeta()

> **useSeoMeta**&lt;`OmitKeys`&gt;(`opts`, `defaults?`): [`SeoTagResult`](../type-aliases/SeoTagResult.md)

Defined in: [src/config/seo.service.ts:60](https://github.com/senseikatana/katanakit-js/blob/9cd294dbd5fcacaa39e035a9611ee874df2bc442/src/config/seo.service.ts#L60)

SEO helper: one flat object in → one flat object out (+ html/tags).

## Type Parameters

### OmitKeys

`OmitKeys` *extends* `"nav"` \| `"site"` \| keyof SeoMetaFlat \| `"siteTitle"` \| `"lang"` \| `"rss"` \| `"seo"` = `never`

## Parameters

### opts

[`UseSeoMetaOptions`](../type-aliases/UseSeoMetaOptions.md)&lt;`OmitKeys`&gt;

### defaults?

[`SiteConfig`](../interfaces/SiteConfig.md) = `defaultSiteConfig`

## Returns

[`SeoTagResult`](../type-aliases/SeoTagResult.md)

## Example

```ts
const seo = useSeoMeta({
  site: "https://example.com",
  siteTitle: "My Site",
  title: "Home",
  description: "…",
  ogImage: "https://example.com/image.png",
});
// seo.title, seo.site, seo.ogImage — once each
// seo.html / seo.tags — head injection
```
