# Gap

Utilities for controlling the gutters between grid and flex items.

# Gap

Utilities for controlling the gutters between grid and flexbox items,
generated from `$spacing-map`. The bare `.gap` class is `gap: 1rem`.

## Quick reference

| Scale | `gap-*` | `gap-x-*` | `gap-y-*` |
| --- | --- | --- | --- |
| `0` → `0` | `.gap-0` | `.gap-x-0` | `.gap-y-0` |
| `05` → `0.125rem` | `.gap-05` | `.gap-x-05` | `.gap-y-05` |
| `base` → `1px` | `.gap-base` | `.gap-x-base` | `.gap-y-base` |
| `1` → `0.25rem` | `.gap-1` | `.gap-x-1` | `.gap-y-1` |
| `1-5` → `0.375rem` | `.gap-1-5` | `.gap-x-1-5` | `.gap-y-1-5` |
| `2` → `0.5rem` | `.gap-2` | `.gap-x-2` | `.gap-y-2` |
| `2-5` → `0.625rem` | `.gap-2-5` | `.gap-x-2-5` | `.gap-y-2-5` |
| `3` → `0.75rem` | `.gap-3` | `.gap-x-3` | `.gap-y-3` |
| `3-5` → `0.875rem` | `.gap-3-5` | `.gap-x-3-5` | `.gap-y-3-5` |
| `4` → `1rem` | `.gap-4` | `.gap-x-4` | `.gap-y-4` |
| `5` → `1.25rem` | `.gap-5` | `.gap-x-5` | `.gap-y-5` |
| `6` → `1.5rem` | `.gap-6` | `.gap-x-6` | `.gap-y-6` |
| `7` → `1.75rem` | `.gap-7` | `.gap-x-7` | `.gap-y-7` |
| `8` → `2rem` | `.gap-8` | `.gap-x-8` | `.gap-y-8` |
| `9` → `2.25rem` | `.gap-9` | `.gap-x-9` | `.gap-y-9` |
| `10` → `2.5rem` | `.gap-10` | `.gap-x-10` | `.gap-y-10` |
| `11` → `2.75rem` | `.gap-11` | `.gap-x-11` | `.gap-y-11` |
| `12` → `3rem` | `.gap-12` | `.gap-x-12` | `.gap-y-12` |
| `14` → `3.5rem` | `.gap-14` | `.gap-x-14` | `.gap-y-14` |
| `16` → `4rem` | `.gap-16` | `.gap-x-16` | `.gap-y-16` |
| `20` → `5rem` | `.gap-20` | `.gap-x-20` | `.gap-y-20` |
| `24` → `6rem` | `.gap-24` | `.gap-x-24` | `.gap-y-24` |
| `28` → `7rem` | `.gap-28` | `.gap-x-28` | `.gap-y-28` |
| `32` → `8rem` | `.gap-32` | `.gap-x-32` | `.gap-y-32` |
| `36` → `9rem` | `.gap-36` | `.gap-x-36` | `.gap-y-36` |
| `40` → `10rem` | `.gap-40` | `.gap-x-40` | `.gap-y-40` |
| `44` → `11rem` | `.gap-44` | `.gap-x-44` | `.gap-y-44` |
| `48` → `12rem` | `.gap-48` | `.gap-x-48` | `.gap-y-48` |
| `52` → `13rem` | `.gap-52` | `.gap-x-52` | `.gap-y-52` |
| `56` → `14rem` | `.gap-56` | `.gap-x-56` | `.gap-y-56` |
| `60` → `15rem` | `.gap-60` | `.gap-x-60` | `.gap-y-60` |
| `64` → `16rem` | `.gap-64` | `.gap-x-64` | `.gap-y-64` |
| `72` → `18rem` | `.gap-72` | `.gap-x-72` | `.gap-y-72` |
| `80` → `20rem` | `.gap-80` | `.gap-x-80` | `.gap-y-80` |
| `96` → `24rem` | `.gap-96` | `.gap-x-96` | `.gap-y-96` |

| Class | Properties |
| --- | --- |
| `.gap` | `gap: 1rem;` |

## Basic usage

Add gutters between flex items:

<div class="kk-demo">
  <div class="flex gap-4">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">A</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">B</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">C</div>
  </div>
</div>

```html
<div class="flex gap-4">
  <div>A</div>
  <div>B</div>
  <div>C</div>
</div>
```

## Using row and column gaps

`gap-x-*` sets the column gutter, `gap-y-*` the row gutter:

<div class="kk-demo">
  <div class="grid gap-x-8 gap-y-2" style="grid-template-columns: repeat(3, 1fr)">
    <div class="p-4 bg-info-200 text-info-700 rounded-md">1</div>
    <div class="p-4 bg-info-200 text-info-700 rounded-md">2</div>
    <div class="p-4 bg-info-200 text-info-700 rounded-md">3</div>
    <div class="p-4 bg-info-300 text-info-700 rounded-md">4</div>
    <div class="p-4 bg-info-300 text-info-700 rounded-md">5</div>
    <div class="p-4 bg-info-300 text-info-700 rounded-md">6</div>
  </div>
</div>

```html
<div class="grid gap-x-8 gap-y-2" style="grid-template-columns: repeat(3, 1fr)">
  <!-- 6 cells -->
</div>
```

## Using the bare gap class

`.gap` is a shortcut for `gap: 1rem` (the same value as `.gap-4`):

```html
<div class="flex gap">…</div>
```

## Customizing

Override `$spacing-map` before importing the utilities to change the whole
scale at once:

```scss
@use "katanakit-css/src/scss/variables" as v with (
  $spacing-map: (
    "0": 0,
    "1": 0.5rem,
    "2": 1rem,
    "4": 2rem
  )
);
```
