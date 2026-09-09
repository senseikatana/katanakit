# Type Alias: SeoTagResult

> **SeoTagResult** = [`UseSeoMetaOptions`](UseSeoMetaOptions.md) & `object`

Defined in: [src/config/seo.service.ts:35](https://github.com/senseikatana/katanakit-js/blob/04891e89563504d7c59b2a5004ef20cbc07608ac/src/config/seo.service.ts#L35)

Result of [useSeoMeta](../functions/useSeoMeta.md): `html` / `tags` for the head, plus **one**
flat object of resolved fields (site + HTML + OG). No duplicate
`title` / `meta.title` / `config.title`.

- `title` = document title (page)
- `siteTitle` = brand / site name
- `html` / `tags` = what you inject into `<head>`

## Type Declaration

### html

> **html**: `string`

### jsonLd?

> `optional` **jsonLd?**: `Record`&lt;`string`, `unknown`&gt;

### tags

> **tags**: [`SeoTagNode`](../interfaces/SeoTagNode.md)[]
