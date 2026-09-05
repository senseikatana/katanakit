# Breakpoints

Technical reference of the breakpoint mixin engine.

# Breakpoints

Technical reference of the responsive mixin engine in the `mixins` module.
For a conceptual overview and the feature queries, see
[Breakpoints](/core/breakpoints/).

```scss
@use "katanakit-css/src/scss/mixins" as m;
```

## Configuration

`m.$breakpoints` (all `!default`):

| Tier | Width |
| --- | --- |
| `xs` | `0` |
| `sm` | `640px` |
| `md` | `768px` |
| `lg` | `1024px` |
| `xl` | `1280px` |
| `2xl` | `1536px` |
| `3xl` | `1920px` |

## `breakpoint($from, $direction: up, $to: null)`

Opens a `@media` query. `$from` and `$to` accept a tier name (string) or a
raw px number (unitless numbers are treated as px). `bp($args...)` is an
alias that forwards its arguments.

| Direction | Media query |
| --- | --- |
| `up` | `(min-width: X)` |
| `down` | `(max-width: calc(X - 0.02px))` |
| `only` | `(min-width: X) and (max-width: calc(Y - 0.02px))` — requires `$to` |
| `between` | `(min-width: X) and (max-width: Y)` — requires `$to` |

```scss
@include m.breakpoint("sm", up)      { /* ≥ 640px */ }
@include m.breakpoint("md", down)    { /* ≤ 767.98px */ }
@include m.breakpoint("sm", only, "md") { /* 640px–767.98px */ }
@include m.breakpoint("md", between, "xl") { /* 768px–1280px */ }
@include m.breakpoint(500px, up)     { /* raw value */ }
@include m.bp("lg", down)            { /* alias */ }
```

An invalid direction or a missing `$to` raises a compile-time `@error`.

## Named mixins — `up` direction

| Mixin | Equivalent |
| --- | --- |
| `m.xs` | `breakpoint("xs", up)` |
| `m.sm` | `breakpoint("sm", up)` |
| `m.md` | `breakpoint("md", up)` |
| `m.lg` | `breakpoint("lg", up)` |
| `m.xl` | `breakpoint("xl", up)` |
| `m.xxl` | `breakpoint("2xl", up)` |
| `m.xxxl` | `breakpoint("3xl", up)` |

```scss
.sidebar {
  display: none;

  @include m.lg { display: block; }
}
```

## Named mixins — `down` direction

| Mixin | Equivalent |
| --- | --- |
| `m.xs-down` | `breakpoint("xs", down)` |
| `m.sm-down` | `breakpoint("sm", down)` |
| `m.md-down` | `breakpoint("md", down)` |
| `m.lg-down` | `breakpoint("lg", down)` |
| `m.xl-down` | `breakpoint("xl", down)` |
| `m.x2l-down` | `breakpoint("2xl", down)` |
| `m.x3l-down` | `breakpoint("3xl", down)` |
| `m.xxl-down` | alias of `m.x2l-down` |
| `m.xxxl-down` | alias of `m.x3l-down` |

```scss
.grid {
  grid-template-columns: repeat(4, 1fr);

  @include m.md-down { grid-template-columns: 1fr; }
  @include m.xxl-down { padding-inline: 2rem; }
}
```

## Feature query mixins

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
.menu {
  @include m.touch { padding: 1rem; }   // bigger targets on touch devices
  @include m.reduced-motion { transition: none; }
}
```
