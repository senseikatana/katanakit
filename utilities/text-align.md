# Text Align

Utilities for controlling the alignment of text.

# Text Align

Utilities for controlling the alignment of text, generated from the
`$text-align-values` list.

## Quick reference

| Class | Properties |
| --- | --- |
| `.text-left` | `text-align: left;` |
| `.text-center` | `text-align: center;` |
| `.text-right` | `text-align: right;` |
| `.text-justify` | `text-align: justify;` |

## Basic usage

<div class="kk-demo">
  <div class="grid gap-2 w-64 text-neutral-700">
    <p class="text-left bg-neutral-100 rounded-md p-2">So I started to walk into the water — text-left</p>
    <p class="text-center bg-neutral-100 rounded-md p-2">So I started to walk into the water — text-center</p>
    <p class="text-right bg-neutral-100 rounded-md p-2">So I started to walk into the water — text-right</p>
    <p class="text-justify bg-neutral-100 rounded-md p-2">So I started to walk into the water. I won't lie to you boys, I was terrified — text-justify</p>
  </div>
</div>

```html
<p class="text-left ...">…</p>
<p class="text-center ...">…</p>
<p class="text-right ...">…</p>
<p class="text-justify ...">…</p>
```

## Customizing

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $text-align-values: (left, center, right)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
