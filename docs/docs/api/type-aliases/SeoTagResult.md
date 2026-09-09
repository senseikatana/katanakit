# Type Alias: SeoTagResult

> **SeoTagResult** = [`UseSeoMetaOptions`](UseSeoMetaOptions.md) & `object`

Defined in: [src/config/seo.service.ts:35](https://github.com/senseikatana/katanakit-js/blob/383d6a100560d2a9a7041d90cd0ed5082a876890/src/config/seo.service.ts#L35)

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
