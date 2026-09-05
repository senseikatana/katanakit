# Flex Wrap

Utilities for controlling whether flex items wrap.

# Flex Wrap

Utilities for controlling whether flex items wrap onto multiple lines.
Requires a flex container (`.flex` or `.inline-flex`).

## Quick reference

| Class | Properties |
| --- | --- |
| `.flex-wrap` | `flex-wrap: wrap;` |
| `.flex-nowrap` | `flex-wrap: nowrap;` |

## Basic usage

`flex-wrap` lets items break onto new lines when the container runs out of
space; `flex-nowrap` forces a single line:

<div class="kk-demo">
  <div class="flex flex-wrap gap-2 w-64">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">2</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">3</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">4</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">5</div>
  </div>
</div>

```html
<div class="flex flex-wrap gap-2 w-64">…</div>
```

## Preventing wrapping

```html
<div class="flex flex-nowrap">
  <span class="whitespace-nowrap">Never breaks</span>
  <span class="whitespace-nowrap">Stays on one line</span>
</div>
```

## Customizing

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $flex-wrap-list: (wrap, nowrap)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-flex-utilities();
```
