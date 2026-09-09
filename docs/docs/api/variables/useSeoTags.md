# ~~Variable: useSeoTags~~

> `const` **useSeoTags**: (`config`, `meta`) => [`SeoTagResult`](../type-aliases/SeoTagResult.md) = `useSeoTag`

Defined in: [src/config/seo.service.ts:119](https://github.com/senseikatana/katanakit-js/blob/f3e8aa63995d22bcc8253b02a108a1169d9a2cb9/src/config/seo.service.ts#L119)

## Parameters

### config

[`SiteConfig`](../interfaces/SiteConfig.md)

### meta

[`SeoMeta`](../interfaces/SeoMeta.md)

## Returns

[`SeoTagResult`](../type-aliases/SeoTagResult.md)

## Deprecated

Prefer [useSeoMeta](../functions/useSeoMeta.md) with a unified flat object.
Legacy: `useSeoTag(siteConfig, { title, description, ... })`.

## Deprecated

Prefer [useSeoMeta](../functions/useSeoMeta.md).
