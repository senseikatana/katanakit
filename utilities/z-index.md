# Z-Index

Utilities for controlling the stack order of an element.

# Z-Index

Utilities for controlling the stack order of an element, generated from the
`$z-layers-map`. Named layers (`dropdown` … `tooltip`) keep overlapping UI
consistent across a project.

## Quick reference

| Class | Properties |
| --- | --- |
| `.z-auto` | `z-index: auto;` |
| `.z-0` | `z-index: 0;` |
| `.z-10` | `z-index: 10;` |
| `.z-20` | `z-index: 20;` |
| `.z-30` | `z-index: 30;` |
| `.z-40` | `z-index: 40;` |
| `.z-50` | `z-index: 50;` |
| `.z-dropdown` | `z-index: 1000;` |
| `.z-sticky` | `z-index: 1020;` |
| `.z-fixed` | `z-index: 1030;` |
| `.z-modal` | `z-index: 1040;` |
| `.z-popover` | `z-index: 1050;` |
| `.z-tooltip` | `z-index: 1060;` |

## Basic usage

`z-index` only applies to positioned elements — pair it with the
[Position](/utilities/position/) utilities:

<div class="kk-demo">
  <div class="relative p-4 rounded-md" style="height: 7rem; width: 16rem">
    <div class="absolute z-10 p-4 bg-purple-300 text-purple-700 rounded-md" style="top: 0; left: 0">z-10</div>
    <div class="absolute z-20 p-4 bg-purple-500 text-white rounded-md" style="top: 1.5rem; left: 1.5rem">z-20</div>
    <div class="absolute z-30 p-4 bg-purple-700 text-white rounded-md" style="top: 3rem; left: 3rem">z-30</div>
  </div>
</div>

```html
<div class="relative">
  <div class="absolute z-10 ...">z-10</div>
  <div class="absolute z-20 ...">z-20</div>
  <div class="absolute z-30 ...">z-30</div>
</div>
```

## Using named layers

Named layers map to the semantic roles in the `$z-layers-map` — use them so
modals always sit above dropdowns, tooltips above popovers, and so on:

```html
<header class="sticky z-sticky">…</header>
<nav class="absolute z-dropdown">…</nav>
<div class="fixed z-modal">…</div>
<div class="absolute z-tooltip">…</div>
```

## Customizing

Override the layer map in the `mixins` module:

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $z-layers-map: (
    "auto": auto,
    "0": 0,
    "10": 10,
    "dropdown": 100,
    "modal": 200,
    "tooltip": 300
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-effects-utilities();
```
