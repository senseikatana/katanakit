# Grid

CSS Grid layout mixins — containers, placement, stacking and masonry.

# Grid

CSS Grid layout mixins in the `mixins` module. Configurable variables:
`$grid-gap-default: f.rem(10px) !default` and
`$grid-columns-default: 12 !default`.

```scss
@use "katanakit-css/src/scss/mixins" as m;
```

## Responsive columns

| Mixin | Behaviour |
| --- | --- |
| `m.grid-responsive($min-size, $mode: fill, $max-size: 1fr, $gap: null)` | `grid-template-columns: repeat(auto-fill|auto-fit, minmax(min, max))`. `$mode` is `fill` or `fit` (error otherwise). |
| `m.grid-autofill($min-size, $max-size: 1fr, $gap: null)` | Convenience for `fill`. |
| `m.grid-autofit($min-size, $max-size: 1fr, $gap: null)` | Convenience for `fit`. |
| `m.grid-fixed-columns($col-width, $gap: null)` | `repeat(auto-fill, <width>)` — fixed column width, no minmax. |
| `m.grid-breakpoint-columns($columns-map, $gap: $grid-gap-default, $align-items: stretch)` | Different column counts per breakpoint. `$columns-map` uses a `default` key (used below `sm`) plus one key per breakpoint. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.cards { @include m.grid-autofill(240px, 1fr, 1rem); }

.dashboard {
  @include m.grid-breakpoint-columns(("default": 1, "md": 2, "xl": 4), 1rem);
}
```

## Layout containers

| Mixin | Behaviour |
| --- | --- |
| `m.grid-container($cols: 12, $rows: null, $gap: $grid-gap-default, $place-items: center, $place-content: center, $align-items: null, $justify-content: null)` | Equal `1fr` columns. Uses `place-items`/`place-content`, or `align-items`/`justify-content` when the place-* parameters are `null`. |
| `m.grid-center($gap: null)` | Centering shorthand (`place-items`/`place-content: center`). |
| `m.grid-gap($value: $grid-gap-default, $var-name: --grid-gap)` | Sets a custom property and `gap: var(--grid-gap)`. |
| `m.grid-areas($areas, $gap: null)` | `grid-template-areas` with the display base. |
| `m.grid-area($name)` | Assigns an item to a template area. |
| `m.subgrid($axis: both)` | `grid-template-columns`/`rows: subgrid` for `column`/`row`/`both`. |
| `m.grid-masonry($axis: block, $gap: null)` | **Experimental** masonry via `grid-template-rows: masonry` (browser support is not universal). `$axis: inline` moves the masonry axis to columns. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.page {
  @include m.grid-areas(
    "header header"
    "sidebar main"
    "footer footer",
    1rem
  );

  .header  { @include m.grid-area("header"); }
  .sidebar { @include m.grid-area("sidebar"); }
  .main    { @include m.grid-area("main"); }
  .footer  { @include m.grid-area("footer"); }
}
```

## Grid items

| Mixin | Behaviour |
| --- | --- |
| `m.grid-span($cols: 1, $rows: null)` | `grid-column: span N` (+ `grid-row: span N` when `$rows` is set). |
| `m.grid-placement($col-start: 1, $col-end: -1, $row-start: null, $row-end: null)` | `grid-column: start / end` and, when both rows are provided, `grid-row`. |
| `m.grid-item-center` | `place-self: center center`. |
| `m.grid-item-full($col: "1 / -1", $row: null)` | Spans all columns (customizable via `$col`). |

```scss
@use "katanakit-css/src/scss/mixins" as m;

main   { @include m.grid-placement(2, 4, 1, 2); } // grid-column: 2/4; grid-row: 1/2
header { @include m.grid-item-full(); }            // grid-column: 1 / -1
.card  { @include m.grid-span(3); }
```

## Stacking items

| Mixin | Behaviour |
| --- | --- |
| `m.grid-stack($dp: grid, $parent: null, $children: ("*"), $col: 1, $row: 1)` | Makes the current element (or the named `.parent`) a grid and places every `$child` selector into the same cell at `($col, $row)`, so children overlap. |
| `m.grid-stack-item($col: 1, $row: 1)` | Places the current element into a stack cell. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.stack { @include m.grid-stack(grid, null, ("span", "div"), 2, 1); }
// .stack { display: grid }
// .stack > span, .stack > div { grid-column: 2 / 3; grid-row: 1 / 2; }
```

`grid-stack` requires unitless numbers `>= 1` and accepts `$parent` with or
without a leading dot.

## Dashboard example

A complete dashboard layout combining containers, spans and breakpoints:

```scss
@use "katanakit-css/src/scss/mixins" as m;
@use "katanakit-css/src/scss/variables" as v;

.dashboard {
  @include m.grid-container(12, $gap: 1rem, $place-items: stretch, $place-content: stretch);

  .sidebar {
    @include m.grid-span(3);
  }

  .content {
    @include m.grid-span(9);
  }

  @include m.md-down {
    grid-template-columns: 1fr;

    .sidebar,
    .content {
      @include m.grid-span(1);
    }
  }
}

.cards { @include m.grid-responsive(280px, fill, 1fr, 1.5rem); }

.pinned-card { @include m.grid-placement(2, 4, 1, 2); }

.modal-overlay {
  @include m.grid-center(0);

  .modal {
    @include m.grid-item-center;
    max-width: v.container("md");
  }
}
```

See [Examples](/reference/examples/) for the full
`grid-dashboard.scss` source.
