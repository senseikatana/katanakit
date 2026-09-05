# White Space

Utilities for controlling text wrapping and white space handling.

# White Space

Utilities for controlling how white space inside an element is handled and
how long words break. Generated from `$white-space-list` and
`$overflow-wrap-list`.

## Quick reference

| Class | Properties |
| --- | --- |
| `.whitespace-nowrap` | `white-space: nowrap;` |
| `.whitespace-pre` | `white-space: pre;` |
| `.whitespace-normal` | `white-space: normal;` |
| `.wrap-break-word` | `overflow-wrap: break-word;` |

## Basic usage

`whitespace-nowrap` prevents text from wrapping. Combined with an
`overflow-*` utility it produces single-line truncation:

<div class="kk-demo">
  <div class="grid gap-2 w-64 text-neutral-700">
    <p class="whitespace-nowrap overflow-hidden bg-neutral-100 rounded-md p-2">The quick brown fox jumps over the lazy dog — nowrap</p>
    <p class="whitespace-normal bg-neutral-100 rounded-md p-2">The quick brown fox jumps over the lazy dog — normal</p>
  </div>
</div>

```html
<p class="whitespace-nowrap overflow-hidden ...">…</p>
<p class="whitespace-normal ...">…</p>
```

## Preserving formatting

`whitespace-pre` preserves every space and line break exactly as written in
the markup:

<div class="kk-demo">
  <pre class="whitespace-pre bg-neutral-100 text-neutral-700 rounded-md p-2 w-64">line one
  line two (kept indent)
line three</pre>
</div>

```html
<pre class="whitespace-pre ...">line one
  line two (kept indent)
line three</pre>
```

## Breaking long words

`wrap-break-word` lets unbreakably long words (URLs, tokens) wrap instead of
overflowing:

<div class="kk-demo">
  <p class="wrap-break-word w-64 bg-neutral-100 text-neutral-700 rounded-md p-2">
    https://example.com/supercalifragilisticexpialidocious/verylong/path
  </p>
</div>

```html
<p class="wrap-break-word w-64 ...">https://example.com/very/long/path</p>
```

## Customizing

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $white-space-list: (nowrap, pre, normal),
  $overflow-wrap-list: (break-word,)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
