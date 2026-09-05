# Functions

Pure helper functions — units, fluid typography and color manipulation.

# Functions

Pure helper functions in the `functions` module
(`src/scss/_functions.scss`). All of them raise compile-time `@error`s on
invalid input instead of failing silently.

```scss
@use "katanakit-css/src/scss/functions" as f;
```

`$base-font-size: 16px !default` is the px baseline used by `rem()`/`px()`.

## Unit conversion

| Signature | Behaviour |
| --- | --- |
| `f.rem($size)` | Converts px or unitless numbers to rem using `$base-font-size`. `f.rem(16px)` and `f.rem(16)` both return `1rem`. |
| `f.px($size)` | Converts rem or unitless numbers to px. `f.px(1)` returns `16px`, `f.px(1.5rem)` returns `24px`. |
| `f.to-unit($value, $unit: "rem")` | Appends a unit (`rem`, `px`, `em` or `%`) to a unitless number. Values with a unit are returned unchanged. Throws `@error` on an invalid unit. |
| `f.strip-unit($value)` | Removes the unit: `f.strip-unit(16px)` returns `16`. |

```scss
@use "katanakit-css/src/scss/functions" as f;

.card {
  padding: f.rem(24);      // 1.5rem
  margin: f.px(1);         // 16px
  width: f.to-unit(50, "%"); // 50%
}
```

## Fluid typography

| Signature | Behaviour |
| --- | --- |
| `f.fluid($min, $max, $min-vw: 320px, $max-vw: 1920px)` | Returns a `clamp()` expression that interpolates `$min` → `$max` across `$min-vw` → `$max-vw`. Unitless inputs are treated as px. |

```scss
font-size: f.fluid(16px, 24px);
// clamp(16px, 0.5vw + 14.4px, 24px)

font-size: f.fluid(1rem, 2rem, 768px, 1280px);
// clamp(1rem, 0.1953125vw - 0.5px, 2rem)
```

```scss
h1 { font-size: f.fluid(2rem, 4rem); }
```

## Color helpers

| Signature | Behaviour |
| --- | --- |
| `f.tint($color, $amount: 10%)` | Mixes `$color` with white. |
| `f.shade($color, $amount: 10%)` | Mixes `$color` with black. |
| `f.saturate-color($color, $amount: 10%)` | Increases saturation via `color.scale`. |
| `f.desaturate-color($color, $amount: 10%)` | Decreases saturation via `color.scale`. |
| `f.complement($color)` | Returns the hue complement. |
| `f.contrast($color, $light: white, $dark: black)` | Chooses a readable text color from the perceived brightness of `$color`: bright colors return `$dark`, dark colors return `$light`. |
| `f.color-mix-var($var-name, $amount: 10%, $mix-with: white)` | Emits `color-mix(in srgb, var(--name) <pct>, <mix-with>)`. Accepts a bare variable name (`"--info-500"`) or a full `var(...)` expression. |
| `f.to-class($key)` | Escapes a map key for use in a class selector: `.` → `\.`, `/` → `\/`, `%` → `\%`. |

```scss
@use "katanakit-css/src/scss/functions" as f;

.card {
  background: f.tint(#7d2bd4, 20%);
  border-color: f.shade(#7d2bd4, 15%);
  color: f.contrast(#7d2bd4); // white — the color is dark
}

.alert {
  background: f.color-mix-var("--danger-500", 10%);
  // background: color-mix(in srgb, var(--danger-500) 90%, white);
}

.surface {
  color: f.desaturate-color(#066bf9, 30%);
}
```

All color functions throw an `@error` when they receive a non-color.
