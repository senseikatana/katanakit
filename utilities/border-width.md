# Border Width

Utilities for controlling the width of an element's borders.

# Border Width

Utilities for controlling the width of an element's borders. `.border`
(1px solid) is emitted automatically with the `utilities` module; the other
widths come from the `$border-width-map`.

## Quick reference

| Class | Properties |
| --- | --- |
| `.border` | `border-width: 1px; border-style: solid;` |
| `.border-0` | `border-width: 0;` |
| `.border-2` | `border-width: 2px;` |
| `.border-4` | `border-width: 4px;` |
| `.border-8` | `border-width: 8px;` |

## Basic usage

<div class="kk-demo">
  <div class="grid gap-2" style="grid-template-columns: repeat(2, 1fr)">
    <div class="border border-purple-500 text-purple-600 rounded-md p-4">border</div>
    <div class="border-0 border-purple-500 text-purple-600 rounded-md p-4">border-0</div>
    <div class="border-2 border-purple-500 text-purple-600 rounded-md p-4">border-2</div>
    <div class="border-4 border-purple-500 text-purple-600 rounded-md p-4">border-4</div>
    <div class="border-8 border-purple-500 text-purple-600 rounded-md p-4">border-8</div>
  </div>
</div>

```html
<div class="border border-purple-500 ...">border</div>
<div class="border-2 border-purple-500 ...">border-2</div>
<div class="border-4 border-purple-500 ...">border-4</div>
```

Widths are separate from colors: add a color from
[Border Color](/utilities/border-color/) or the default
(`currentColor`) applies.

## Customizing

```scss
@use "katanakit-css/src/scss/utilities" as u with (
  $border-width-map: (
    "0": 0,
    "2": 2px,
    "4": 4px
  )
);
```
