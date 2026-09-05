# Opacity

Utilities for controlling the opacity of an element.

# Opacity

Utilities for controlling the opacity of an element, generated from the
`$opacity-values` map. Unlike `hidden`, an element with `opacity-0` still
takes space and receives pointer events.

## Quick reference

| Class | Properties |
| --- | --- |
| `.opacity-0` | `opacity: 0;` |
| `.opacity-5` | `opacity: 0.05;` |
| `.opacity-10` | `opacity: 0.1;` |
| `.opacity-20` | `opacity: 0.2;` |
| `.opacity-25` | `opacity: 0.25;` |
| `.opacity-30` | `opacity: 0.3;` |
| `.opacity-40` | `opacity: 0.4;` |
| `.opacity-50` | `opacity: 0.5;` |
| `.opacity-60` | `opacity: 0.6;` |
| `.opacity-70` | `opacity: 0.7;` |
| `.opacity-75` | `opacity: 0.75;` |
| `.opacity-80` | `opacity: 0.8;` |
| `.opacity-90` | `opacity: 0.9;` |
| `.opacity-95` | `opacity: 0.95;` |
| `.opacity-100` | `opacity: 1;` |

## Basic usage

<div class="kk-demo">
  <div class="grid gap-1" style="grid-template-columns: repeat(5, 1fr)">
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-0">0</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-5">5</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-10">10</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-20">20</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-25">25</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-30">30</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-40">40</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-50">50</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-60">60</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-70">70</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-75">75</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-80">80</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-90">90</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-95">95</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-100">100</div>
  </div>
</div>

```html
<div class="opacity-50 ...">50</div>
<div class="opacity-100 ...">100</div>
```

## Combining with transitions

Opacity pairs with the
[Transitions](/utilities/transitions/) utilities for fade
effects:

```html
<button
  class="hover-bg-purple-500 bg-purple-300 duration-200 ease-out"
  style="transition-property: background-color"
>
  Fades via hover-bg
</button>
```

> Note: there is no `.hover-opacity-*` variant in this framework — the
> hover color variants are `.hover-text-*` and `.hover-bg-*` (see
> [Text Color](/utilities/text-color/) and
> [Background Color](/utilities/background-color/)).

## Customizing

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $opacity-values: (
    "0": 0,
    "25": 0.25,
    "50": 0.5,
    "75": 0.75,
    "100": 1
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-effects-utilities();
```
