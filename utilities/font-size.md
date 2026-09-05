# Font Size

Utilities for controlling the font size of an element.

# Font Size

Utilities for controlling the font size of an element, generated from the
`$font-size-map`. These classes are emitted automatically when the
`utilities` module is loaded — no generator call needed.

## Quick reference

| Class | Properties |
| --- | --- |
| `.text-xs` | `font-size: 0.75rem;` |
| `.text-sm` | `font-size: 0.875rem;` |
| `.text-base` | `font-size: 1rem;` |
| `.text-lg` | `font-size: 1.125rem;` |
| `.text-xl` | `font-size: 1.25rem;` |
| `.text-2xl` | `font-size: 1.5rem;` |
| `.text-3xl` | `font-size: 1.875rem;` |
| `.text-4xl` | `font-size: 2.25rem;` |

## Basic usage

<div class="kk-demo">
  <div class="grid gap-2 text-neutral-700">
    <p class="text-xs">The quick brown fox — text-xs</p>
    <p class="text-sm">The quick brown fox — text-sm</p>
    <p class="text-base">The quick brown fox — text-base</p>
    <p class="text-lg">The quick brown fox — text-lg</p>
    <p class="text-xl">The quick brown fox — text-xl</p>
    <p class="text-2xl">The quick brown fox — text-2xl</p>
    <p class="text-3xl">The quick brown fox — text-3xl</p>
    <p class="text-4xl">The quick brown fox — text-4xl</p>
  </div>
</div>

```html
<p class="text-xs ...">The quick brown fox — text-xs</p>
<p class="text-sm ...">The quick brown fox — text-sm</p>
<!-- … up to text-4xl -->
```

## Customizing

Override the `$font-size-map` in the `utilities` module before it loads:

```scss
@use "katanakit-css/src/scss/utilities" as u with (
  $font-size-map: (
    "sm": 0.75rem,
    "base": 1rem,
    "xl": 1.5rem
  )
);
```
