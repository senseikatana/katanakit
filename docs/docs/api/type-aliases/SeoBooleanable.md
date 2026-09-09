# Type Alias: SeoBooleanable

> **SeoBooleanable** = `boolean` \| `"true"` \| `"false"` \| `""` \| `0` \| `1`

<<<<<<< HEAD
Defined in: [src/config/seo-meta.types.ts:11](https://github.com/senseikatana/katanakit-js/blob/f3e8aa63995d22bcc8253b02a108a1169d9a2cb9/src/config/seo-meta.types.ts#L11)
=======
Defined in: [src/config/seo-meta.types.ts:11](https://github.com/senseikatana/katanakit-js/blob/9cd294dbd5fcacaa39e035a9611ee874df2bc442/src/config/seo-meta.types.ts#L11)
>>>>>>> dev

Slim SEO types: typical HTML meta + Open Graph (Facebook) only.
CamelCase keys map to `<title>` / `<meta>` / `<link rel="canonical">`.

Naming cheat-sheet for [UseSeoMetaOptions](UseSeoMetaOptions.md):
- `site` = base URL (`https://example.com`)
- `siteTitle` = brand / site name (`"My Site"`)
- `title` = **page** document title (`"Blog Post"` → often `"Blog Post | My Site"`)
