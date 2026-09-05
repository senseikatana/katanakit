# Display

Utilities for controlling the display type of an element.

# Display

Utilities for controlling the display box type of an element. Generated from
the `$display-values` map (a map so `hidden` can map to `none`).

## Quick reference

| Class | Properties |
| --- | --- |
| `.block` | `display: block;` |
| `.inline-block` | `display: inline-block;` |
| `.inline` | `display: inline;` |
| `.flex` | `display: flex;` |
| `.inline-flex` | `display: inline-flex;` |
| `.grid` | `display: grid;` |
| `.inline-grid` | `display: inline-grid;` |
| `.table` | `display: table;` |
| `.table-row` | `display: table-row;` |
| `.table-cell` | `display: table-cell;` |
| `.hidden` | `display: none;` |
| `.contents` | `display: contents;` |

## Basic usage

Set the display type of an element:

<div class="kk-demo">
  <div class="grid gap-2">
    <div class="block p-4 bg-purple-200 text-purple-700 rounded-md">block</div>
    <div class="inline-block p-4 bg-purple-200 text-purple-700 rounded-md">inline-block</div>
    <div class="inline p-4 bg-purple-200 text-purple-700 rounded-md">inline</div>
  </div>
</div>

```html
<div class="block ...">block</div>
<div class="inline-block ...">inline-block</div>
<div class="inline ...">inline</div>
```

## Using flex and grid

`flex` and `grid` create the containers that every flexbox and grid utility
works on:

<div class="kk-demo">
  <div class="flex gap-2">
    <div class="p-4 bg-info-200 text-info-700 rounded-md">A</div>
    <div class="p-4 bg-info-300 text-info-700 rounded-md">B</div>
    <div class="p-4 bg-info-200 text-info-700 rounded-md">C</div>
  </div>
  <div class="grid gap-2" style="grid-template-columns: repeat(3, 1fr)">
    <div class="p-4 bg-success-200 text-success-700 rounded-md">1</div>
    <div class="p-4 bg-success-200 text-success-700 rounded-md">2</div>
    <div class="p-4 bg-success-200 text-success-700 rounded-md">3</div>
  </div>
</div>

```html
<div class="flex gap-2">…</div>
<div class="grid gap-2" style="grid-template-columns: repeat(3, 1fr)">…</div>
```

## Hiding elements

Use `hidden` to remove an element from the document flow entirely:

<div class="kk-demo">
  <div class="flex gap-2">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">visible</div>
    <div class="hidden p-4 bg-purple-200 text-purple-700 rounded-md">hidden</div>
  </div>
</div>

```html
<div class="flex gap-2">
  <div class="p-4 ...">visible</div>
  <div class="hidden p-4 ...">hidden</div>
</div>
```

Unlike `opacity-0`, `hidden` takes no space and receives no pointer events.

## Using table displays

The `table-*` utilities let you apply table layout semantics to any
structure:

```html
<div class="table">
  <div class="table-row">
    <div class="table-cell p-2">Cell A</div>
    <div class="table-cell p-2">Cell B</div>
  </div>
</div>
```

## Customizing

Override the `$display-values` map in the `mixins` module before generating
layout utilities:

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $display-values: (
    block: block,
    flex: flex,
    grid: grid,
    hidden: none
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
