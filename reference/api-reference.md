# API Reference

Complete reference of every function, mixin, map and generator.

# API Reference

Complete reference for `katanakit-css` **0.1.0** (unreleased). Every
signature, default and map key in this document was checked against the
source under `src/scss/`. This file is documentation only — it never changes
the code.

---

## Module namespaces

All modules are consumed with lowercase `@use` and an explicit namespace:

```scss
@use "katanakit-css/src/scss/functions"   as f;
@use "katanakit-css/src/scss/variables"   as v;
@use "katanakit-css/src/scss/mixins"      as m;
@use "katanakit-css/src/scss/utilities"   as u;
```

When the modules are part of your own source tree the paths become relative,
e.g. `@use "functions" as f;`. The public entry `src/scss/main.scss` loads
`reset`, `variables`, `functions`, `mixins` and `utilities`, then calls:

```scss
@include v.generate-css-tokens();
@include v.generate-css-vars();
@include v.all-utilities();
@include u.generate-all-utilities();
```

---

## Functions (`as f`)

Source: `_functions.scss`.

### Unit conversion

| Signature | Behaviour |
| --- | --- |
| `rem($size)` | Converts px or unitless numbers to rem using `$base-font-size` (default `16px`). `rem(16px)` and `rem(16)` both return `1rem`. |
| `px($size)` | Converts rem or unitless numbers to px. `px(1)` returns `16px`, `px(1.5rem)` returns `24px`. |
| `to-unit($value, $unit: "rem")` | Appends a unit (`rem`, `px`, `em` or `%`) to an already unitless number. Values that carry a unit are returned unchanged. Throws `@error` on an invalid unit. |
| `strip-unit($value)` | Removes the unit, e.g. `strip-unit(16px)` returns `16`. |

`$base-font-size: 16px !default` is the browser default. Only override it if
your project changes the root font size (it is a *px* baseline, not a 10px
"rem trick" baseline).

### Fluid typography

| Signature | Behaviour |
| --- | --- |
| `fluid($min, $max, $min-vw: 320px, $max-vw: 1920px)` | Returns a `clamp()` expression that interpolates `$min` → `$max` across `$min-vw` → `$max-vw`. Unitless inputs are treated as px. |

```scss
font-size: f.fluid(16px, 24px);
// clamp(16px, 0.5vw + 14.4px, 24px)

font-size: f.fluid(1rem, 2rem, 768px, 1280px);
// clamp(1rem, 0.1953125vw - 0.5px, 2rem)
```

### Color helpers

| Signature | Behaviour |
| --- | --- |
| `tint($color, $amount: 10%)` | Mixes `$color` with white. |
| `shade($color, $amount: 10%)` | Mixes `$color` with black. |
| `saturate-color($color, $amount: 10%)` | Increases saturation via `color.scale`. |
| `desaturate-color($color, $amount: 10%)` | Decreases saturation via `color.scale`. |
| `complement($color)` | Returns the hue complement. |
| `contrast($color, $light: white, $dark: black)` | Chooses a readable text color from the perceived brightness of `$color`: bright colors return `$dark`, dark colors return `$light`. |
| `color-mix-var($var-name, $amount: 10%, $mix-with: white)` | Emits `color-mix(in srgb, var(--name) <pct>, <mix-with>)`. Accepts a bare variable name (`"--info-500"`) or a full `var(...)` expression. |
| `to-class($key)` | Escapes a map key for use in a class selector. `.` becomes `\.`, `/` becomes `\/`, `%` becomes `\%`. `to-class("1-5")` returns the string `1-5` (the dots/hyphens of the *keys* themselves are used literally by the generators). |

All color functions that receive a non-color throw an `@error`.

---

## Variables / tokens (`as v`)

Source: `_variables.scss`.

### Token maps (all `!default`)

**`$font-families`**

| Key | Value |
| --- | --- |
| `sans-serif` | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| `serif` | `"Times New Roman", Trebuchet, Geneva, serif` |
| `mono` | `monospace` |

**`$shadow-sizes`**

| Key | Value |
| --- | --- |
| `default` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |
| `xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` |
| `2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` |
| `inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` |

**`$container-sizes`** — `sm` 24rem · `md` 28rem · `lg` 32rem · `xl` 36rem ·
`2xl` 42rem · `3xl` 48rem · `4xl` 56rem · `5xl` 64rem · `6xl` 72rem.

**`$breakpoint-sizes`** — `xs` 0 · `sm` 640px · `md` 768px · `lg` 1024px ·
`xl` 1280px · `2xl` 1536px · `3xl` 1920px.

**`$spacing-scale`**

`0` 0 · `1` 0.25rem · `2` 0.5rem · `3` 0.75rem · `4` 1rem · `5` 1.25rem ·
`6` 1.5rem · `8` 2rem · `10` 2.5rem · `12` 3rem · `16` 4rem · `20` 5rem ·
`24` 6rem · `32` 8rem.

**`$radius`**

`default` 0.25rem · `sm` 0.125rem · `md` 0.375rem · `lg` 0.5rem ·
`xl` 0.75rem · `2xl` 1rem · `3xl` 1.5rem · `full` 9999px.

**`$z-layers`**

`auto` auto · `0` 0 · `10` 10 · `20` 20 · `30` 30 · `40` 40 · `50` 50 ·
`dropdown` 1000 · `sticky` 1020 · `fixed` 1030 · `modal` 1040 ·
`popover` 1050 · `tooltip` 1060.

**`$transition-durations`** — `75` 75ms · `100` 100ms · `150` 150ms ·
`200` 200ms · `300` 300ms · `500` 500ms · `700` 700ms · `1000` 1000ms.

**`$transition-easings`**

`linear` linear · `in` `cubic-bezier(0.4, 0, 1, 1)` ·
`out` `cubic-bezier(0, 0, 0.2, 1)` ·
`in-out` `cubic-bezier(0.4, 0, 0.2, 1)`.

### Accessor functions

| Signature | Returns | Notes |
| --- | --- | --- |
| `font-family($name)` | font stack list | `sans-serif` / `serif` / `mono`. |
| `shadow($size: "default")` | shadow list/value | `default` … `inner`. |
| `container($size)` | length | `sm` … `6xl`. |
| `breakpoint($name)` | px length | `xs` … `3xl`. |
| `spacing($size)` | length | Accepts a number **or** a string key (`spacing(4)` = `spacing("4")`). |
| `radius($size: "default")` | length | `default` … `full`. |
| `z($layer)` | number/`auto` | Accepts a number or a string (`z(50)` = `z("50")`, plus named layers). |
| `duration($ms)` | duration | Accepts a number or string (`duration(200)` = `duration("200")`). |
| `ease($name: "in-out")` | timing function | `linear` / `in` / `out` / `in-out`. |

Every accessor raises a compile-time `@error` listing the valid keys when the
requested key is missing.

### `@mixin generate-css-tokens(...)`

```scss
@mixin generate-css-tokens(
  $fonts: true, $shadows: true, $containers: true, $spacing: true,
  $radius: true, $z: true, $durations: true, $easings: true
)
```

Emits the token families as custom properties in `:root`. Pass `false` to skip
a family.

```scss
:root {
  --font-sans-serif: ui-sans-serif, system-ui, …;
  --shadow-md: …;
  --container-xl: 36rem;
  --spacing-4: 1rem;
  --z-tooltip: 1060;
  --duration-200: 200ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Variable names carry no brand prefix: they are exactly `--font-*`,
`--shadow-*`, `--container-*`, `--spacing-*`, `--radius-*`, `--z-*`,
`--duration-*` and `--ease-*`.

---

## Colors (`as v`)

Source: `_variables.scss` (merged from the former `_colors.scss`).

### Palettes

`$colors` holds six palettes with **seven shades each** (100 lightest → 700
darkest), stored as `hsla(...)` and emitted as `hsl(...)`:

| Palette | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `neutral` | 0 0% 93% | 0 0% 86% | 0 0% 71% | 0 0% 50% | 0 0% 35% | 0 0% 24% | 0 0% 12% |
| `purple` | 269 60% 93% | 269 70% 86% | 269 70% 71% | 269 66% 50% | 269 66% 35% | 269 60% 24% | 269 50% 12% |
| `info` | 215 95% 93% | 215 95% 86% | 215 95% 71% | 215 95% 50% | 215 95% 35% | 215 95% 24% | 215 95% 12% |
| `warning` | 49 100% 93% | 49 100% 86% | 49 100% 71% | 49 100% 50% | 49 100% 35% | 49 90% 24% | 49 70% 12% |
| `danger` | 3 95% 93% | 3 95% 86% | 3 95% 71% | 3 95% 50% | 3 95% 35% | 3 95% 24% | 3 95% 12% |
| `success` | 147 95% 93% | 147 95% 86% | 147 95% 71% | 147 95% 50% | 147 95% 35% | 147 95% 24% | 147 95% 12% |

The cell values above are `hsl(hue, saturation, lightness)`. There are no
additional palettes and no brand-specific color names are wired into the
framework (see `colors-palette.md` for the personal brand palette, which is
reference material only).

**`$special-colors`** — `black` `hsl(0, 0%, 3%)` · `white` `hsl(0, 0%, 98%)` ·
`transparent` `transparent` · `current` `currentColor`.

**`$shades: (100, 200, 300, 400, 500, 600, 700) !default`** — iteration order
for tone-driven features.

### Accessor functions

| Signature | Returns |
| --- | --- |
| `get-color($name, $shade: 300, $alpha: 1)` | A palette shade (or a special color when `$name` is special). Applies alpha when `$alpha != 1`. |
| `get($name, $alpha: 1)` | Shorthand: `get-color($name, 500, $alpha)`. |
| `alpha($name, $shade: 500, $alpha: 0.5)` | Shorthand for transparent variants: `alpha("info", 300, 0.5)` → `hsla(215, 95%, 71%, 0.5)`. |

```scss
color: v.get-color("neutral", 500);  // hsl(0, 0%, 35%)
color: v.get("info");                // shade 500
border: 1px solid v.alpha("warning", 400, 0.25);
```

### `@mixin generate-css-vars($root: ":root", $palettes: null, $include-special: true)`

Emits one custom property per shade plus the special colors:

```scss
:root {
  --neutral-100: hsl(0, 0%, 93%);
  /* … every palette and shade … */
  --info-500: hsl(215, 95%, 35%);
  --white: hsl(0, 0%, 98%);
  --black: hsl(0, 0%, 3%);
  --transparent: transparent;
  --current: currentColor;
}
```

`$palettes` accepts:

- `null` — all palettes;
- a palette name or list of names — only those palettes (e.g. `"info"`,
  `(neutral, success)`);
- a **map** — emitted as-is. This is how `theme()` feeds the inverted
  palettes to a custom root selector.

### Utility mixins

| Mixin | Classes |
| --- | --- |
| `text-utilities($palettes: null, $special: true)` | `.text-{palette}-{shade}`, `.text-{special}` (e.g. `.text-white`, `.text-neutral-500`, `.text-info-400`) — property `color`. |
| `bg-utilities($palettes: null, $special: true)` | `.bg-{palette}-{shade}`, `.bg-{special}` — property `background-color`. |
| `border-utilities($palettes: null, $special: true)` | `.border-{palette}-{shade}`, `.border-{special}` — property `border-color`. |
| `hover-utilities($palettes: null, $special: true)` | `.hover-text-{palette}-{shade}:hover`, `.hover-bg-{palette}-{shade}:hover`, plus `.hover-text-{special}:hover` / `.hover-bg-{special}:hover`. |
| `all-utilities($palettes: null, $special: true)` | Calls the four mixins above. |

Utility classes use **literal color values**, not `var()` references. The
custom properties emitted by `generate-css-vars()` are there for your own
rules.

### `@mixin theme($mode, $overrides: ())`

Emits the palettes under `:root[data-theme="#{$mode}"]` (no special colors).
When `$mode: "dark"`, each palette is **inverted** so the lightest tone key
holds the darkest color and vice versa: shade `100 ↔ 700`, `200 ↔ 600`,
`300 ↔ 500`. `$overrides` is merged over the resulting map.

---

## Theme (`as v`)

Source: `_variables.scss` (merged from the former `_theme.scss`).

| Signature | Behaviour |
| --- | --- |
| `theme($mode: "dark", $overrides: ())` | Thin hook that delegates to `v.theme()`. |

```scss
@include v.theme("dark"); // inverts palettes, emits :root[data-theme="dark"]
```

---

## Breakpoints (`as m`)

Source: `_mixins.scss` (merged from the former `_breakpoints.scss`).

### `$breakpoints` (all `!default`)

`xs` 0 · `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px ·
`2xl` 1536px · `3xl` 1920px.

The keys containing digits (`2xl`, `3xl`) are first-class names — pass them as
strings.

### Generic mixin

| Signature | Behaviour |
| --- | --- |
| `breakpoint($from, $direction: up, $to: null)` | Opens a `@media` query. Accepts a key or a raw px number. |
| `bp($args...)` | Alias that forwards arguments to `breakpoint()`. |

Directions:

- `up` — `(min-width: X)`
- `down` — `(max-width: calc(X - 0.02px))`
- `only` — `(min-width: X) and (max-width: calc(Y - 0.02px))`, requires `$to`
- `between` — `(min-width: X) and (max-width: Y)`, requires `$to`

```scss
@use "katanakit-css/src/scss/mixins" as m;

@include m.breakpoint("lg", down) { … }
@include m.bp("md", up) { … } // the alias forwards to breakpoint("md", up)
```

### Named mixins

`up`: `xs`, `sm`, `md`, `lg`, `xl`, `xxl` (alias for the `2xl` key),
`xxxl` (alias for the `3xl` key).

`down`: `xs-down`, `sm-down`, `md-down`, `lg-down`, `xl-down`,
`x2l-down` / `x3l-down`, plus the canonical aliases
`xxl-down` (= `x2l-down`) and `xxxl-down` (= `x3l-down`).

```scss
@include m.xxl { … }      // @media (min-width: 1536px)
@include m.xxxl { … }     // @media (min-width: 1920px)
@include m.x2l-down { … } // @media (max-width: calc(1536px - 0.02px))
```

### Feature queries

`portrait` · `landscape` · `reduced-motion` · `hoverable`
(`(hover: hover) and (pointer: fine)`) · `touch`
(`(hover: none) and (pointer: coarse)`) · `dark-mode` · `light-mode`.

---

## Grid (`as m`)

Source: `_mixins.scss` (merged from the former `_grid.scss`).

Configurable variables: `$grid-gap-default: f.rem(10px) !default` and
`$grid-columns-default: 12 !default`.

### Responsive columns

| Mixin | Behaviour |
| --- | --- |
| `grid-responsive($min-size, $mode: fill, $max-size: 1fr, $gap: null)` | `grid-template-columns: repeat(auto-fill|auto-fit, minmax(min, max))`. `$mode` is `fill` or `fit` (error otherwise). |
| `grid-autofill($min-size, $max-size: 1fr, $gap: null)` | Convenience for `fill`. |
| `grid-autofit($min-size, $max-size: 1fr, $gap: null)` | Convenience for `fit`. |
| `grid-fixed-columns($col-width, $gap: null)` | `repeat(auto-fill, <width>)`. |
| `grid-breakpoint-columns($columns-map, $gap: $grid-gap-default, $align-items: stretch)` | Different column counts per breakpoint. `$columns-map` uses a `default` key (used below `sm`) and one key per breakpoint. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.cards { @include m.grid-autofill(240px, 1fr, 1rem); }

.dashboard {
  @include m.grid-breakpoint-columns(("default": 1, "md": 2, "xl": 4), 1rem);
}
```

### Layout containers

| Mixin | Behaviour |
| --- | --- |
| `grid-container($cols: 12, $rows: null, $gap: $grid-gap-default, $place-items: center, $place-content: center, $align-items: null, $justify-content: null)` | Equal `1fr` columns; `place-items`/`place-content`, or `align-items`/`justify-content` when the place-* params are `null`. |
| `grid-center($gap: null)` | Centering shorthand (`place-items`/`place-content: center`). |
| `grid-gap($value: $grid-gap-default, $var-name: --grid-gap)` | Sets a custom property and `gap: var(--grid-gap)`. |
| `grid-areas($areas, $gap: null)` | `grid-template-areas` with a display base. |
| `grid-area($name)` | Assigns an item to a template area. |
| `grid-masonry($axis: block, $gap: null)` | **Experimental** masonry layout via `grid-template-rows: masonry` (browser support is not universal). `$axis: inline` moves the masonry axis to columns. |

### Grid items

| Mixin | Behaviour |
| --- | --- |
| `grid-span($cols: 1, $rows: null)` | `grid-column: span N` (+ `grid-row: span N`). |
| `grid-placement($col-start: 1, $col-end: -1, $row-start: null, $row-end: null)` | `grid-column: start / end` and, when provided, `grid-row`. |
| `grid-item-center` | `place-self: center center`. |
| `grid-item-full($col: "1 / -1", $row: null)` | Spans all columns (customize with the `$col` string). |

```scss
main { @include m.grid-placement(2, 4, 1, 2); }  // grid-column: 2/4; grid-row: 1/2
header { @include m.grid-item-full(); }           // grid-column: 1 / -1
```

### Stacking

| Mixin | Behaviour |
| --- | --- |
| `grid-stack($dp: grid, $parent: null, $children: ("*"), $col: 1, $row: 1)` | Makes the current (or a `.parent` named) element a grid and places every `$child` selector into the same cell at `($col, $row)` so children overlap. |
| `grid-stack-item($col: 1, $row: 1)` | Places the current element into a stack cell. |

```scss
.stack { @include m.grid-stack(grid, null, ("span", "div"), 2, 1); }
// .stack { display: grid } and .stack > span, .stack > div placed at 2/3 × 1/2
```

`grid-stack` requires unitless, `>= 1` numbers and accepts `$parent` with or
without a leading dot.

---

## Flex (`as m`)

Source: `_mixins.scss` (merged from the former `_flex.scss`).

| Mixin | Behaviour |
| --- | --- |
| `flex-container($direction: row, $wrap: nowrap, $gap: null, $align-items: stretch, $justify-content: flex-start, $align-content: normal, $place-items: null, $place-content: null)` | Display flex with direction/wrap; `place-items` wins over `align-items`, `place-content` wins over `justify-content`/`align-content`. |
| `flex-center($gap: null)` | Centering shorthand. |
| `flex-gap($value: 1rem, $var-name: --flex-gap)` | Sets a custom property and `gap: var(--flex-gap)`. |
| `flex-grow($grow: 1)` | `flex-grow`. |
| `flex-shrink($shrink: 1)` | `flex-shrink`. |
| `flex-basis($basis: auto)` | `flex-basis`. |
| `flex-item($grow: 1, $shrink: 1, $basis: auto)` | `flex: <grow> <shrink> <basis>`. |
| `flex-item-center` | `align-self: center`. |
| `flex-item-full` | `flex: 1 1 100%`. |

```scss
.toolbar { @include m.flex-container(row, nowrap, 0.5rem, center, space-between); }
.logo    { @include m.flex-item(0, 0, auto); }
```

---

## Utilities (`as u`)

Source: `_utilities.scss`. Consolidates the former `partials/utils/` submodules
(maps, spacing, sizing, flex, effects, layout, core) into a single module.

### Utility token maps (all `!default`)

`sizing`, `spacing`, `gap`, `font-size` and `border-width` maps live in
`_utilities.scss`. The remaining maps (`$shadow-map`, `$radius-map`,
`$z-layers-map`, `$transition-duration-map`, `$transition-timing-map`,
`$opacity-values`, `$font-weight-values`, `$text-align-values`,
`$display-values`, `$position-values`, `$overflow-values`,
`$white-space-list`, `$overflow-wrap-list`, `$flex-direction-map`,
`$flex-wrap-list`, `$align-items-map`, `$justify-content-map`) live in
`_mixins.scss`, where they are shared with the `@apply` registry.

**`$sizing-map`** — `width`/`height`/min/max values:

`0` 0 · `base` 1px · `05` 0.125rem · `1` 0.25rem · `2` 0.5rem · `3` 0.75rem ·
`4` 1rem · `5` 1.25rem · `6` 1.5rem · `8` 2rem · `10` 2.5rem · `12` 3rem ·
`16` 4rem · `20` 5rem · `24` 6rem · `32` 8rem · `40` 10rem · `48` 12rem ·
`64` 16rem · `auto` `auto` · `full` `100%` · `screen` `100vw` · `min`
`min-content` · `max` `max-content` · `fit` `fit-content`.

**`$spacing-map`** — padding/margin/gap values (shared by the class generator
and the `@apply` registry):

`0` 0 · `05` 0.125rem · `base` 1px · `1` 0.25rem · `1-5` 0.375rem ·
`2` 0.5rem · `2-5` 0.625rem · `3` 0.75rem · `3-5` 0.875rem · `4` 1rem ·
`5` 1.25rem · `6` 1.5rem · `7` 1.75rem · `8` 2rem · `9` 2.25rem ·
`10` 2.5rem · `11` 2.75rem · `12` 3rem · `14` 3.5rem · `16` 4rem ·
`20` 5rem · `24` 6rem · `28` 7rem · `32` 8rem · `36` 9rem · `40` 10rem ·
`44` 11rem · `48` 12rem · `52` 13rem · `56` 14rem · `60` 15rem ·
`64` 16rem · `72` 18rem · `80` 20rem · `96` 24rem.

**`$font-size-map`** — `xs` 0.75rem · `sm` 0.875rem · `base` 1rem ·
`lg` 1.125rem · `xl` 1.25rem · `2xl` 1.5rem · `3xl` 1.875rem · `4xl` 2.25rem.
Emitted automatically as `.text-xs` … `.text-4xl`.

**`$border-width-map`** — `0` 0 · `2` 2px · `4` 4px · `8` 8px. Emitted
automatically as `.border-0`/`.border-2`/`.border-4`/`.border-8`; `.border`
(`1px solid`) is also emitted.

**`$flex-direction-map`** — `row`, `row-reverse`, `col`, `col-reverse`.
**`$flex-wrap-list`** — `wrap`, `nowrap`.
**`$align-items-map`** — `start` (flex-start), `center`, `end` (flex-end),
`stretch`.
**`$justify-content-map`** — `start`, `center`, `end`, `between`
(space-between), `around` (space-around), `evenly` (space-evenly).

**`$shadow-map`** (effects) — `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `inner`.
**`$radius-map`** — `none` 0 · `sm` 0.125rem · `md` 0.375rem · `lg` 0.5rem ·
`xl` 0.75rem · `2xl` 1rem · `3xl` 1.5rem · `full` 9999px.
**`$z-layers-map`** — `auto`, `0`, `10`, `20`, `30`, `40`, `50`, `dropdown`,
`sticky`, `fixed`, `modal`, `popover`, `tooltip`.
**`$transition-duration-map`** — `75`, `100`, `150`, `200`, `300`, `500`,
`700`, `1000` (ms).
**`$transition-timing-map`** — `linear`, `in`, `out`, `in-out`.
**`$opacity-values`** — `0`, `5`, `10`, `20`, `25`, `30`, `40`, `50`, `60`,
`70`, `75`, `80`, `90`, `95`, `100`.

**`$font-weight-values`** — `thin` 100 · `extralight` 200 · `light` 300 ·
`normal` 400 · `medium` 500 · `semibold` 600 · `bold` 700 · `extrabold` 800 ·
`black` 900.
**`$text-align-values`** — `left`, `center`, `right`, `justify`.

**`$display-values`** (a map so `hidden` can map to `none`) — `block`,
`inline-block`, `inline`, `flex`, `inline-flex`, `grid`, `inline-grid`,
`table`, `table-row`, `table-cell`, `hidden` (`none`), `contents`.
**`$position-values`** — `static`, `fixed`, `absolute`, `relative`, `sticky`.
**`$overflow-values`** — `auto`, `hidden`, `scroll`, `visible`.
**`$white-space-list`** — `nowrap`, `pre`, `normal`.
**`$overflow-wrap-list`** — `break-word`.

### Core mixins — `_mixins.scss`

| Mixin | Behaviour |
| --- | --- |
| `vars-list($list, $prefix: null)` | Emits `--{prefix}-{value}: {value}` (or `--{value}`) for each item of a list. |
| `vars-map($map, $prefix: null)` | Emits `--{prefix}-{key}: {value}` (or `--{key}`) for each pair of a map. |
| `absolute-center($pos: absolute, $y: 50%, $x: 50%)` | `position`, `top: $y`, `left: $x`, `transform: translate(-50%, -50%)`. |
| `center-mx($xvalue: auto)` | `margin-inline: $xvalue`. |
| `center-my($yvalue: auto)` | `margin-block: $yvalue`. |
| `utils-classes($input, $property, $prefix: null)` | Generates `.prefix-value { property: value }` (or unprefixed) from a list or a map. The class suffix is the *key* for a map, the *value* for a list. |
| `utils-classes-hover($input, $property, $prefix: null)` | Same, but emits `.prefix-key:hover`. |

```scss
@include m.utils-classes((auto, hidden), overflow, "overflow");
// .overflow-auto, .overflow-hidden

@include m.utils-classes((auto: auto, hidden: hidden), overflow, "overflow");
// identical output

@include m.utils-classes((flex, grid), display);
// .flex, .grid (no prefix)
```

### Class generators (opt-in, invoked by `generate-all-utilities()`)

| Generator | Classes |
| --- | --- |
| `u.get-sizing-classes($map: u.$sizing-map)` | `.w-*`, `.min-w-*`, `.max-w-*`, `.h-*`, `.min-h-*`, `.max-h-*`. |
| `u.generate-flex-utilities($direction: …, $wrap: …, $align: …, $justify: …, $gap: …)` | `.flex-row` / `.flex-col` / reverses, `.flex-wrap` / `.flex-nowrap`, `.items-*`, `.justify-*`, `.gap-0` … `.gap-8`. |
| `u.generate-effects-utilities()` | `.shadow-*`, `.rounded-*`, `.z-*`, `.duration-*`, `.ease-*`, `.opacity-*`. |
| `u.generate-layout-utilities()` | display, position, `.overflow-*`, `.text-left/center/right/justify`, `.font-*`, `.whitespace-*`, `.wrap-break-word`. |
| `u.generate-all-utilities()` | Sizing + flex + effects + layout. |

Spacing, text-size and border-width classes are **not** part of these
generators — they are emitted automatically when the module loads (see
below).

### Automatic output when the module is loaded

Loading `utilities` executes the automatic rules at the top level. The
compiled sheet therefore always contains:

- **Spacing** — for every key of `$spacing-map`: `.p-*`, `.px-*`, `.py-*`,
  `.pt-*`, `.pr-*`, `.pb-*`, `.pl-*`, `.m-*`, `.mx-*`, `.my-*`, `.mt-*`,
  `.mr-*`, `.mb-*`, `.ml-*`, `.gap-*`, `.gap-x-*`, `.gap-y-*`.
- **Typography** — `.text-xs` … `.text-4xl` from `$font-size-map`.
- **Border widths** — `.border-0`, `.border-2`, `.border-4`, `.border-8`
  from `$border-width-map`, plus `.border { border-width: 1px;
  border-style: solid }`.
- **Base effects** — `.gap { gap: 1rem; }`, `.shadow` (default shadow) and
  `.rounded { border-radius: 0.25rem; }`.

```css
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.my-8 { margin-top: 2rem; margin-bottom: 2rem; }
.gap-x-4 { column-gap: 1rem; }
.text-lg { font-size: 1.125rem; }
.border-2 { border-width: 2px; }
.border { border-width: 1px; border-style: solid; }
```

Everything else is opt-in via the generators above (or `main.scss`).

### Notes on naming

- Keys are literal strings, kept kebab-style: `.p-05`, `.p-1-5`, `.p-2-5`,
  `.p-3-5`, `.p-base`, `.w-screen { width: 100vw }`, `.hidden { display: none }`,
  `.font-normal { font-weight: 400 }`.
- `generate-layout-utilities` emits `.hidden` because `$display-values`
  maps `hidden` → `none`.

---

## The apply system (`as m`)

Source: `_mixins.scss` (merged from the former `_apply.scss`).

### `@mixin register-utility($name, $styles)`

Registers a named utility. `$styles` is a map of CSS declarations.

### `@mixin apply($utilities...)`

Emits every registered declaration for each utility name, in order. Throws an
`@error` listing the offending name when a utility is not registered.

```scss
@use "katanakit-css/src/scss/mixins" as m;

@include m.register-utility("fade-in", (animation: fade-in 300ms ease));
.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);
}
```

### Automatic registry

`_mixins.scss` registers a large set of utilities when loaded. Most of the
registry is derived from the **same maps** that drive the class generators
(`$radius-map`, `$shadow-map`, `$z-layers-map`, `$transition-duration-map`,
`$transition-timing-map`, `$opacity-values`, `$display-values`,
`$position-values`, `$overflow-values`, `$text-align-values`,
`$font-weight-values`, `$flex-direction-map`, `$flex-wrap-list`,
`$align-items-map`, `$justify-content-map`), so the names match the map keys
exactly (`p-4`, `m-2`, `gap-4`, `rounded-lg`, `shadow-md`, `z-10`,
`duration-200`, `ease-out`, `opacity-50`, …). Spacing names follow the
`$spacing-scale` token map from `_variables.scss` — the class set from
`$spacing-map` is wider than the registered set.

Categories:

- **Display** — `block`, `inline-block`, `inline`, `flex`, `inline-flex`,
  `grid`, `hidden`, plus every key of `$display-values`.
- **Flexbox** — `flex-row`, `flex-col`, `flex-row-reverse`,
  `flex-col-reverse`, `flex-wrap`, `flex-nowrap`, `flex-1`, `flex-auto`,
  `flex-none`, `items-*`, `justify-*`.
- **Spacing** — for every key of `$spacing-scale` (variables): `p-*`, `px-*`,
  `py-*`, `pt-*`, `pb-*`, `pl-*`, `pr-*`, `m-*`, `mx-*`, `my-*`, `mt-*`,
  `mb-*`, `ml-*`, `mr-*`, `gap-*`, `gap-x-*`, `gap-y-*`.
- **Typography** — `text-xs` (0.75rem) … `text-4xl` (2.25rem), `text-left`,
  `text-center`, `text-right`, `font-thin` … `font-black`.
- **Sizing** — `w-full`, `w-screen`, `w-auto`, `h-full`, `h-screen`,
  `h-auto`.
- **Borders** — `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`,
  `rounded-full`, `border`, `border-0`, `border-2`, plus every key of
  `$radius-map` (`rounded-none` … `rounded-full`).
- **Effects** — `shadow`, `shadow-sm` … `shadow-2xl` (every key of
  `$shadow-map`), `opacity-0` … `opacity-100` (every key of
  `$opacity-values`), `z-*`, `duration-*`, `ease-*`.
- **Grid helpers** — `grid-cols-1`, `grid-cols-2`, `grid-cols-3`,
  `grid-cols-4`, `grid-cols-6`, `grid-cols-12`, `col-span-full`.
- **Position/overflow** — `static`, `fixed`, `absolute`, `relative`,
  `sticky`, `overflow-auto/hidden/scroll/visible`.
- **Colors** — `text-white`, `text-black`, `bg-white`, `bg-black`,
  `bg-transparent`.
- **Transitions** — `transition`, `transition-colors`,
  `transition-opacity`, `transition-transform`.
- **White space / wrapping** — `whitespace-nowrap/pre/normal`,
  `wrap-break-word`.

**Important.** Registering a utility for `apply` does **not** create a CSS
class. Because spacing, text sizes and border widths are now generated as
classes automatically, the registry-only names are limited to `flex-1`,
`flex-auto`, `flex-none`, `grid-cols-1/2/3/4/6/12`, `col-span-full` and the
`transition*` helpers — those exist only inside `apply()` and must never be
assumed to exist as classes in the compiled CSS.

---

## Error handling

Invalid keys, wrong argument types and unsupported directions raise
compile-time `@error` messages that name the offending value and, when
applicable, the valid options. There is no silent fallback.
