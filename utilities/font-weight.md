# Font Weight

Utilities for controlling the font weight of an element.

# Font Weight

Utilities for controlling the font weight of an element, generated from the
`$font-weight-values` map.

## Quick reference

| Class | Properties |
| --- | --- |
| `.font-thin` | `font-weight: 100;` |
| `.font-extralight` | `font-weight: 200;` |
| `.font-light` | `font-weight: 300;` |
| `.font-normal` | `font-weight: 400;` |
| `.font-medium` | `font-weight: 500;` |
| `.font-semibold` | `font-weight: 600;` |
| `.font-bold` | `font-weight: 700;` |
| `.font-extrabold` | `font-weight: 800;` |
| `.font-black` | `font-weight: 900;` |

## Basic usage

<div class="kk-demo">
  <div class="grid gap-2 text-neutral-700">
    <p class="font-thin">The quick brown fox — font-thin</p>
    <p class="font-extralight">The quick brown fox — font-extralight</p>
    <p class="font-light">The quick brown fox — font-light</p>
    <p class="font-normal">The quick brown fox — font-normal</p>
    <p class="font-medium">The quick brown fox — font-medium</p>
    <p class="font-semibold">The quick brown fox — font-semibold</p>
    <p class="font-bold">The quick brown fox — font-bold</p>
    <p class="font-extrabold">The quick brown fox — font-extrabold</p>
    <p class="font-black">The quick brown fox — font-black</p>
  </div>
</div>

```html
<p class="font-thin ...">The quick brown fox — font-thin</p>
<!-- … every weight from 100 to 900 -->
```

Note: the rendered weight depends on the font actually loaded — a variable
font or a family with all nine faces is required to see every step.

## Customizing

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $font-weight-values: (
    "normal": 400,
    "medium": 500,
    "bold": 700
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
