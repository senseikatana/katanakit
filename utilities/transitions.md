# Transitions

Utilities for controlling transition duration and timing functions.

# Transitions

Utilities for controlling the `transition-duration` and
`transition-timing-function` of an element, generated from the
`$transition-duration-map` and `$transition-timing-map`.

> These utilities set the duration and easing **only**. The framework does
> not emit a `.transition` class — declare `transition-property` yourself
> (e.g. `transition: color`), or use the `transition*` utilities inside
> [`@apply`](/core/apply/).

## Quick reference

| Class | Properties |
| --- | --- |
| `.duration-75` | `transition-duration: 75ms;` |
| `.duration-100` | `transition-duration: 100ms;` |
| `.duration-150` | `transition-duration: 150ms;` |
| `.duration-200` | `transition-duration: 200ms;` |
| `.duration-300` | `transition-duration: 300ms;` |
| `.duration-500` | `transition-duration: 500ms;` |
| `.duration-700` | `transition-duration: 700ms;` |
| `.duration-1000` | `transition-duration: 1000ms;` |

| Class | Properties |
| --- | --- |
| `.ease-linear` | `transition-timing-function: linear;` |
| `.ease-in` | `transition-timing-function: cubic-bezier(0.4, 0, 1, 1);` |
| `.ease-out` | `transition-timing-function: cubic-bezier(0, 0, 0.2, 1);` |
| `.ease-in-out` | `transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);` |

## Basic usage

Hover the button to see the transition in action:

<div class="kk-demo">
  <button class="hover-bg-purple-500 bg-purple-300 text-purple-700 p-2 px-4 rounded-md font-semibold duration-300 ease-out" style="transition-property: background-color, color">duration-300 ease-out</button>
</div>

```html
<button
  class="hover-bg-purple-500 bg-purple-300 duration-300 ease-out"
  style="transition-property: background-color"
>
  duration-300 ease-out
</button>
```

## Customizing

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $transition-duration-map: (
    "fast": 100ms,
    "normal": 300ms,
    "slow": 1000ms
  ),
  $transition-timing-map: (
    "linear": linear,
    "in-out": cubic-bezier(0.4, 0, 0.2, 1)
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-effects-utilities();
```
