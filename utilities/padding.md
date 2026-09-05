# Padding

Utilities for controlling an element's padding.

# Padding

Utilities for controlling an element's padding.

## Quick reference

Every value of `$spacing-map` is emitted for the seven prefixes: `p-*`
(all sides), `px-*`/`py-*` (horizontal/vertical) and
`pt-*`/`pr-*`/`pb-*`/`pl-*` (one side).

| Scale | `p-*` | `px-*` | `py-*` | `pt-*` | `pr-*` | `pb-*` | `pl-*` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `0` → `0` | `.p-0` | `.px-0` | `.py-0` | `.pt-0` | `.pr-0` | `.pb-0` | `.pl-0` |
| `05` → `0.125rem` | `.p-05` | `.px-05` | `.py-05` | `.pt-05` | `.pr-05` | `.pb-05` | `.pl-05` |
| `base` → `1px` | `.p-base` | `.px-base` | `.py-base` | `.pt-base` | `.pr-base` | `.pb-base` | `.pl-base` |
| `1` → `0.25rem` | `.p-1` | `.px-1` | `.py-1` | `.pt-1` | `.pr-1` | `.pb-1` | `.pl-1` |
| `1-5` → `0.375rem` | `.p-1-5` | `.px-1-5` | `.py-1-5` | `.pt-1-5` | `.pr-1-5` | `.pb-1-5` | `.pl-1-5` |
| `2` → `0.5rem` | `.p-2` | `.px-2` | `.py-2` | `.pt-2` | `.pr-2` | `.pb-2` | `.pl-2` |
| `2-5` → `0.625rem` | `.p-2-5` | `.px-2-5` | `.py-2-5` | `.pt-2-5` | `.pr-2-5` | `.pb-2-5` | `.pl-2-5` |
| `3` → `0.75rem` | `.p-3` | `.px-3` | `.py-3` | `.pt-3` | `.pr-3` | `.pb-3` | `.pl-3` |
| `3-5` → `0.875rem` | `.p-3-5` | `.px-3-5` | `.py-3-5` | `.pt-3-5` | `.pr-3-5` | `.pb-3-5` | `.pl-3-5` |
| `4` → `1rem` | `.p-4` | `.px-4` | `.py-4` | `.pt-4` | `.pr-4` | `.pb-4` | `.pl-4` |
| `5` → `1.25rem` | `.p-5` | `.px-5` | `.py-5` | `.pt-5` | `.pr-5` | `.pb-5` | `.pl-5` |
| `6` → `1.5rem` | `.p-6` | `.px-6` | `.py-6` | `.pt-6` | `.pr-6` | `.pb-6` | `.pl-6` |
| `7` → `1.75rem` | `.p-7` | `.px-7` | `.py-7` | `.pt-7` | `.pr-7` | `.pb-7` | `.pl-7` |
| `8` → `2rem` | `.p-8` | `.px-8` | `.py-8` | `.pt-8` | `.pr-8` | `.pb-8` | `.pl-8` |
| `9` → `2.25rem` | `.p-9` | `.px-9` | `.py-9` | `.pt-9` | `.pr-9` | `.pb-9` | `.pl-9` |
| `10` → `2.5rem` | `.p-10` | `.px-10` | `.py-10` | `.pt-10` | `.pr-10` | `.pb-10` | `.pl-10` |
| `11` → `2.75rem` | `.p-11` | `.px-11` | `.py-11` | `.pt-11` | `.pr-11` | `.pb-11` | `.pl-11` |
| `12` → `3rem` | `.p-12` | `.px-12` | `.py-12` | `.pt-12` | `.pr-12` | `.pb-12` | `.pl-12` |
| `14` → `3.5rem` | `.p-14` | `.px-14` | `.py-14` | `.pt-14` | `.pr-14` | `.pb-14` | `.pl-14` |
| `16` → `4rem` | `.p-16` | `.px-16` | `.py-16` | `.pt-16` | `.pr-16` | `.pb-16` | `.pl-16` |
| `20` → `5rem` | `.p-20` | `.px-20` | `.py-20` | `.pt-20` | `.pr-20` | `.pb-20` | `.pl-20` |
| `24` → `6rem` | `.p-24` | `.px-24` | `.py-24` | `.pt-24` | `.pr-24` | `.pb-24` | `.pl-24` |
| `28` → `7rem` | `.p-28` | `.px-28` | `.py-28` | `.pt-28` | `.pr-28` | `.pb-28` | `.pl-28` |
| `32` → `8rem` | `.p-32` | `.px-32` | `.py-32` | `.pt-32` | `.pr-32` | `.pb-32` | `.pl-32` |
| `36` → `9rem` | `.p-36` | `.px-36` | `.py-36` | `.pt-36` | `.pr-36` | `.pb-36` | `.pl-36` |
| `40` → `10rem` | `.p-40` | `.px-40` | `.py-40` | `.pt-40` | `.pr-40` | `.pb-40` | `.pl-40` |
| `44` → `11rem` | `.p-44` | `.px-44` | `.py-44` | `.pt-44` | `.pr-44` | `.pb-44` | `.pl-44` |
| `48` → `12rem` | `.p-48` | `.px-48` | `.py-48` | `.pt-48` | `.pr-48` | `.pb-48` | `.pl-48` |
| `52` → `13rem` | `.p-52` | `.px-52` | `.py-52` | `.pt-52` | `.pr-52` | `.pb-52` | `.pl-52` |
| `56` → `14rem` | `.p-56` | `.px-56` | `.py-56` | `.pt-56` | `.pr-56` | `.pb-56` | `.pl-56` |
| `60` → `15rem` | `.p-60` | `.px-60` | `.py-60` | `.pt-60` | `.pr-60` | `.pb-60` | `.pl-60` |
| `64` → `16rem` | `.p-64` | `.px-64` | `.py-64` | `.pt-64` | `.pr-64` | `.pb-64` | `.pl-64` |
| `72` → `18rem` | `.p-72` | `.px-72` | `.py-72` | `.pt-72` | `.pr-72` | `.pb-72` | `.pl-72` |
| `80` → `20rem` | `.p-80` | `.px-80` | `.py-80` | `.pt-80` | `.pr-80` | `.pb-80` | `.pl-80` |
| `96` → `24rem` | `.p-96` | `.px-96` | `.py-96` | `.pt-96` | `.pr-96` | `.pb-96` | `.pl-96` |

See the [Design Tokens](/core/tokens/) page for the complete
spacing scale definition.

## Basic usage

Add padding to all sides of an element:

<div class="kk-demo">
  <div class="p-8 text-white" style="background: #2563eb; border-radius: .5rem">p-8</div>
</div>

```html
<div class="p-8 ...">p-8</div>
```

## Adding horizontal and vertical padding

Control the horizontal padding of an element with the `px-*` utilities and
the vertical padding with the `py-*` utilities:

<div class="kk-demo">
  <div class="px-8 py-4 text-white" style="background: #2563eb; border-radius: .5rem">px-8 py-4</div>
</div>

```html
<div class="px-8 py-4 ...">px-8 py-4</div>
```

## Padding on one side

Use `pt-*`, `pr-*`, `pb-*` and `pl-*` to add padding to one side only:

<div class="kk-demo">
  <div class="pt-8 pr-4 pb-2 pl-6 text-white" style="background: #2563eb; border-radius: .5rem">pt-8 · pr-4 · pb-2 · pl-6</div>
</div>

```html
<div class="pt-8 pr-4 pb-2 pl-6 ...">pt-8 · pr-4 · pb-2 · pl-6</div>
```

## Using logical properties

Every padding utility is a single `padding*` declaration, so they compose
freely with the rest of the framework:

```scss
// The classes are generated from $spacing-map in _utilities.scss:
@each $key, $value in $spacing-map {
  .p-#{$key}  { padding: $value; }
  .px-#{$key} { padding-left: $value; padding-right: $value; }
  // ...
}
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
