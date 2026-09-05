# Position

Utilities for controlling how an element is positioned.

# Position

Utilities for controlling how an element is positioned in the document.

## Quick reference

| Class | Properties |
| --- | --- |
| `.static` | `position: static;` |
| `.fixed` | `position: fixed;` |
| `.absolute` | `position: absolute;` |
| `.relative` | `position: relative;` |
| `.sticky` | `position: sticky;` |

## Basic usage

`relative` creates the positioning context; `absolute` removes the element
from the flow and anchors it to the nearest positioned ancestor:

<div class="kk-demo">
  <div class="relative p-8 bg-purple-100 rounded-md" style="height: 8rem; width: 16rem">
    <span class="absolute" style="top: .5rem; right: .5rem"><span class="p-2 bg-purple-500 text-white rounded-md">absolute</span></span>
    <span class="absolute" style="bottom: .5rem; left: .5rem"><span class="p-2 bg-purple-300 text-purple-700 rounded-md">absolute</span></span>
    <span class="p-2 bg-white text-purple-700 rounded-md">relative</span>
  </div>
</div>

```html
<div class="relative ...">
  <span class="absolute" style="top: .5rem; right: .5rem">…</span>
</div>
```

The framework does not emit `top`/`right`/`bottom`/`left` utilities, so pair
`absolute` with your own offsets.

## Fixed positioning

`fixed` anchors an element to the viewport — it stays in place when the page
scrolls:

```html
<header class="fixed" style="top: 0; left: 0; right: 0">…</header>
<main class="p-8"><!-- scrolls under the header --></main>
```

## Sticky positioning

`sticky` keeps an element in flow until it reaches the scroll edge, then
pins it:

```html
<nav class="sticky" style="top: 0">…</nav>
```

Use the `z-sticky` layer from [Z-Index](/utilities/z-index/)
when the sticky element needs to sit above other content.

## Customizing

Position classes are generated from the `$position-values` list in the
`mixins` module:

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $position-values: (static, fixed, absolute, relative, sticky)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
