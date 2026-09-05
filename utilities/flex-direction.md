# Flex Direction

Utilities for controlling the direction of flex items.

# Flex Direction

Utilities for controlling the direction of flex items. Requires a flex
container (`.flex` or `.inline-flex` — see [Display](/utilities/display/)).

## Quick reference

| Class | Properties |
| --- | --- |
| `.flex-row` | `flex-direction: row;` |
| `.flex-row-reverse` | `flex-direction: row-reverse;` |
| `.flex-col` | `flex-direction: column;` |
| `.flex-col-reverse` | `flex-direction: column-reverse;` |

## Basic usage

Lay items out in a row (the default) or a column:

<div class="kk-demo">
  <div class="flex flex-row gap-2">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">2</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">3</div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="p-4 bg-info-200 text-info-700 rounded-md">1</div>
    <div class="p-4 bg-info-300 text-info-700 rounded-md">2</div>
    <div class="p-4 bg-info-200 text-info-700 rounded-md">3</div>
  </div>
</div>

```html
<div class="flex flex-row gap-2">…</div>
<div class="flex flex-col gap-2">…</div>
```

## Reversing the direction

`flex-row-reverse` and `flex-col-reverse` keep the same layout axis but
flip the visual order of the items:

<div class="kk-demo">
  <div class="flex flex-row-reverse gap-2">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">2</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">3</div>
  </div>
</div>

```html
<div class="flex flex-row-reverse gap-2">…</div>
```

## Customizing

Direction classes are generated from the `$flex-direction-map` in the
`mixins` module:

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $flex-direction-map: (
    "row": row,
    "col": column
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-flex-utilities();
```
