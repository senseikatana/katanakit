# Type Alias: UseSeoMetaOptions&lt;OmitKeys&gt;

> **UseSeoMetaOptions**&lt;`OmitKeys`&gt; = `Omit`&lt;[`UseSeoMetaBase`](UseSeoMetaBase.md), `OmitKeys`&gt;

Defined in: [src/config/seo-meta.types.ts:160](https://github.com/senseikatana/katanakit-js/blob/cc7f6fdb267e50aa7f208b256d51e23ae72de919/src/config/seo-meta.types.ts#L160)

Public options for [useSeoMeta](../functions/useSeoMeta.md).
Only HTML + Open Graph (+ site fields). Omit keys you do not want in the type.

## Type Parameters

### OmitKeys

`OmitKeys` *extends* keyof [`UseSeoMetaBase`](UseSeoMetaBase.md) = `never`

## Example

```ts
// site = URL, siteTitle = brand, title = this page
useSeoMeta({
  site: "https://katanakit.dev",
  siteTitle: "KatanaKit",
  title: "Getting started", // → <title>Getting started | KatanaKit</title>
  description: "…",
  ogImage: "/og.png",
} satisfies UseSeoMetaOptions);

useSeoMeta({ title: "Home" } as UseSeoMetaOptions<"rss" | "nav">);
```
