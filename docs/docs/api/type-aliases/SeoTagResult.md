# Type Alias: SeoTagResult

> **SeoTagResult** = [`UseSeoMetaOptions`](UseSeoMetaOptions.md) & `object`

<<<<<<< HEAD
Defined in: [src/config/seo.service.ts:35](https://github.com/senseikatana/katanakit-js/blob/f3e8aa63995d22bcc8253b02a108a1169d9a2cb9/src/config/seo.service.ts#L35)
=======
Defined in: [src/config/seo.service.ts:35](https://github.com/senseikatana/katanakit-js/blob/9cd294dbd5fcacaa39e035a9611ee874df2bc442/src/config/seo.service.ts#L35)
>>>>>>> dev

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
