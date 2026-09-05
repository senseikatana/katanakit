# Align Items

Utilities for controlling how flex items are aligned on the cross axis.

# Align Items

Utilities for controlling how flex items are positioned on the cross axis.
Requires a flex container (`.flex` or `.inline-flex`).

## Quick reference

| Class | Properties |
| --- | --- |
| `.items-start` | `align-items: flex-start;` |
| `.items-center` | `align-items: center;` |
| `.items-end` | `align-items: flex-end;` |
| `.items-stretch` | `align-items: stretch;` |

## Basic usage

Align items on the cross axis of a flex container. The demo container has a
fixed height so the difference is visible:

<div class="kk-demo">
  <div class="flex items-start gap-2 w-64 h-24 bg-neutral-100 rounded-md p-2">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">A</div>
    <div class="p-8 bg-purple-300 text-purple-700 rounded-md">B</div>
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">C</div>
  </div>
  <div class="flex items-center gap-2 w-64 h-24 bg-neutral-100 rounded-md p-2">
    <div class="p-4 bg-info-200 text-info-700 rounded-md">A</div>
    <div class="p-8 bg-info-300 text-info-700 rounded-md">B</div>
    <div class="p-2 bg-info-200 text-info-700 rounded-md">C</div>
  </div>
  <div class="flex items-end gap-2 w-64 h-24 bg-neutral-100 rounded-md p-2">
    <div class="p-4 bg-success-200 text-success-700 rounded-md">A</div>
    <div class="p-8 bg-success-300 text-success-700 rounded-md">B</div>
    <div class="p-2 bg-success-200 text-success-700 rounded-md">C</div>
  </div>
</div>

```html
<div class="flex items-start gap-2 h-24">…</div>
<div class="flex items-center gap-2 h-24">…</div>
<div class="flex items-end gap-2 h-24">…</div>
```

## Stretching

`items-stretch` (the CSS default) makes every item fill the cross axis:

```html
<div class="flex items-stretch h-24">
  <div>…</div>
  <div>…</div>
</div>
```

## Customizing

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $align-items-map: (
    "start": flex-start,
    "center": center,
    "end": flex-end,
    "stretch": stretch
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-flex-utilities();
```
