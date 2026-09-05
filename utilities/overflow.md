# Overflow

Utilities for controlling how content overflows an element.

# Overflow

Utilities for controlling how an element handles content that does not fit
in its box. Generated from the `$overflow-values` list.

## Quick reference

| Class | Properties |
| --- | --- |
| `.overflow-auto` | `overflow: auto;` |
| `.overflow-hidden` | `overflow: hidden;` |
| `.overflow-scroll` | `overflow: scroll;` |
| `.overflow-visible` | `overflow: visible;` |

## Basic usage

Clip content that exceeds a fixed height or width:

<div class="kk-demo">
  <div class="w-64 h-24 overflow-hidden bg-purple-100 text-purple-700 rounded-md p-2">
    This is a very long text that does not fit inside the fixed box. Everything
    beyond the edge gets clipped by overflow-hidden.
  </div>
  <div class="w-64 h-24 overflow-auto bg-info-100 text-info-700 rounded-md p-2">
    This is a very long text that does not fit inside the fixed box. overflow-auto
    adds scrollbars only when the content needs them.
  </div>
</div>

```html
<div class="w-64 h-24 overflow-hidden ...">…</div>
<div class="w-64 h-24 overflow-auto ...">…</div>
```

- `overflow-hidden` clips with no scrolling.
- `overflow-auto` shows scrollbars only when needed.
- `overflow-scroll` always reserves scrollbar space.
- `overflow-visible` (the browser default) lets content spill out.

## Combining with sizing utilities

`overflow-*` pairs with the [Width & Height](/utilities/sizing/)
utilities to create scrollable regions:

```html
<div class="max-h-64 overflow-auto">
  <!-- long list -->
</div>
```

## Customizing

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $overflow-values: (auto, hidden, scroll, visible)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
