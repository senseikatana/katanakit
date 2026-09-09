# Type Alias: SeoBooleanable

> **SeoBooleanable** = `boolean` \| `"true"` \| `"false"` \| `""` \| `0` \| `1`

Defined in: [src/config/seo-meta.types.ts:11](https://github.com/senseikatana/katanakit-js/blob/92c921f7b0035b6c7c6649923a868e4e42964772/src/config/seo-meta.types.ts#L11)

Slim SEO types: typical HTML meta + Open Graph (Facebook) only.
CamelCase keys map to `<title>` / `<meta>` / `<link rel="canonical">`.

Naming cheat-sheet for [UseSeoMetaOptions](UseSeoMetaOptions.md):
- `site` = base URL (`https://example.com`)
- `siteTitle` = brand / site name (`"My Site"`)
- `title` = **page** document title (`"Blog Post"` → often `"Blog Post | My Site"`)
