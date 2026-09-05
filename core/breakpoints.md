# Breakpoints

Responsive breakpoint tiers, direction mixins and feature queries.

# Breakpoints

Breakpoints drive the responsive mixins. The tiers live in two places that
must stay in sync: `v.$breakpoint-sizes` (token accessor) and `m.$breakpoints`
(mixin engine). Both are `!default` maps with the same defaults.

| Tier | Width |
| --- | --- |
| `xs` | `0` |
| `sm` | `640px` |
| `md` | `768px` |
| `lg` | `1024px` |
| `xl` | `1280px` |
| `2xl` | `1536px` |
| `3xl` | `1920px` |

```scss
@use "katanakit-css/src/scss/mixins" as m;
@use "katanakit-css/src/scss/variables" as v;

// The token accessor returns raw values for your own media queries:
$tablet: v.breakpoint("md"); // 768px
```

The keys containing digits (`2xl`, `3xl`) are first-class names — always pass
them as strings.

## The generic mixin

`breakpoint($from, $direction: up, $to: null)` opens a `@media` query.
`$from` (and `$to`) accept a tier name or a raw px number. `bp()` is an alias
that forwards its arguments.

| Direction | Media query | Requires `$to` |
| --- | --- | --- |
| `up` | `(min-width: X)` | no |
| `down` | `(max-width: calc(X - 0.02px))` | no |
| `only` | `(min-width: X) and (max-width: calc(Y - 0.02px))` | yes |
| `between` | `(min-width: X) and (max-width: Y)` | yes |

```scss
@use "katanakit-css/src/scss/mixins" as m;

@include m.breakpoint("md", up) {
  .card { display: grid; }
}

@include m.bp("lg", down) { /* alias, same as breakpoint("lg", down) */ }

@include m.breakpoint("sm", only, "md") { /* tablets only */ }

@include m.breakpoint(900px, between, 1200px) { /* raw values work too */ }
```

## Direction mixins (mobile-first)

Shortcut mixins for the `up` direction, including `xxl` / `xxxl` aliases for
the digit keys:

```scss
@include m.xs   { /* ≥ 0     */ }
@include m.sm   { /* ≥ 640px */ }
@include m.md   { /* ≥ 768px */ }
@include m.lg   { /* ≥ 1024px */ }
@include m.xl   { /* ≥ 1280px */ }
@include m.xxl  { /* ≥ 1536px (2xl) */ }
@include m.xxxl { /* ≥ 1920px (3xl) */ }
```

## Down mixins (desktop-first)

```scss
@include m.xs-down   { /* ≤ 0 */ }
@include m.sm-down   { /* ≤ 639.98px */ }
@include m.md-down   { /* ≤ 767.98px */ }
@include m.lg-down   { /* ≤ 1023.98px */ }
@include m.xl-down   { /* ≤ 1279.98px */ }
@include m.x2l-down  { /* ≤ 1535.98px (2xl) */ }
@include m.x3l-down  { /* ≤ 1919.98px (3xl) */ }

// Canonical aliases for the digit keys:
@include m.xxl-down  { /* = x2l-down */ }
@include m.xxxl-down { /* = x3l-down */ }
```

## Combining both directions

A typical responsive card grid, mobile-first then constrained at the top end:

```scss
@use "katanakit-css/src/scss/mixins" as m;

.grid {
  display: grid;
  grid-template-columns: 1fr;

  @include m.sm { grid-template-columns: repeat(2, 1fr); }
  @include m.lg { grid-template-columns: repeat(4, 1fr); }
}
```

See the [Breakpoints mixin reference](/mixins/breakpoints/) for
the complete technical reference of the generic mixin.

## Feature queries

Beyond widths, the module ships media-feature shortcuts:

| Mixin | Media query |
| --- | --- |
| `m.portrait` | `(orientation: portrait)` |
| `m.landscape` | `(orientation: landscape)` |
| `m.reduced-motion` | `(prefers-reduced-motion: reduce)` |
| `m.hoverable` | `(hover: hover) and (pointer: fine)` |
| `m.touch` | `(hover: none) and (pointer: coarse)` |
| `m.dark-mode` | `(prefers-color-scheme: dark)` |
| `m.light-mode` | `(prefers-color-scheme: light)` |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.hero-animation {
  animation: slide-up 300ms ease;

  @include m.reduced-motion {
    animation: none;
  }

  @include m.touch {
    // Larger hit targets on touch devices
    padding: 1.5rem;
  }
}
```

`m.dark-mode` and `m.light-mode` follow the **system** preference. For the
class-based theme, see [Dark Mode](/core/dark-mode/).

## Overriding the tiers

Because both maps are `!default`, configure them before first use:

```scss
@use "katanakit-css/src/scss/variables" as v with (
  $breakpoint-sizes: (
    "xs": 0,
    "sm": 600px,
    "md": 900px,
    "lg": 1200px,
    "xl": 1440px,
    "2xl": 1600px
  )
);
@use "katanakit-css/src/scss/mixins" as m with (
  $breakpoints: (
    "xs": 0,
    "sm": 600px,
    "md": 900px,
    "lg": 1200px,
    "xl": 1440px,
    "2xl": 1600px
  )
);
```
