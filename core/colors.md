# Colors

Color palettes, accessor functions and CSS variable generation.

# Colors

KatanaKIT CSS ships **6 palettes with 7 shades each** (`100` lightest → `700`
darkest) plus four special colors. Everything lives in the `variables` module
and is emitted as utility classes, CSS custom properties and hover variants.

```scss
@use "katanakit-css/src/scss/variables" as v;
```

## Palettes

Each palette follows the same lightness ramp: `100`–`300` are background
tones, `400` is the vivid brand tone, `500`–`700` are text tones.

### Neutral

<div class="kk-swatches">
  <div class="kk-swatch bg-neutral-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-neutral-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-neutral-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-neutral-400">400</div>
  <div class="kk-swatch bg-neutral-500">500</div>
  <div class="kk-swatch bg-neutral-600">600</div>
  <div class="kk-swatch bg-neutral-700">700</div>
</div>

### Purple

<div class="kk-swatches">
  <div class="kk-swatch bg-purple-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-purple-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-purple-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-purple-400">400</div>
  <div class="kk-swatch bg-purple-500">500</div>
  <div class="kk-swatch bg-purple-600">600</div>
  <div class="kk-swatch bg-purple-700">700</div>
</div>

### Info

<div class="kk-swatches">
  <div class="kk-swatch bg-info-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-info-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-info-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-info-400">400</div>
  <div class="kk-swatch bg-info-500">500</div>
  <div class="kk-swatch bg-info-600">600</div>
  <div class="kk-swatch bg-info-700">700</div>
</div>

### Warning

<div class="kk-swatches">
  <div class="kk-swatch bg-warning-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-warning-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-warning-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-warning-400 kk-swatch--light">400</div>
  <div class="kk-swatch bg-warning-500">500</div>
  <div class="kk-swatch bg-warning-600">600</div>
  <div class="kk-swatch bg-warning-700">700</div>
</div>

### Danger

<div class="kk-swatches">
  <div class="kk-swatch bg-danger-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-danger-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-danger-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-danger-400">400</div>
  <div class="kk-swatch bg-danger-500">500</div>
  <div class="kk-swatch bg-danger-600">600</div>
  <div class="kk-swatch bg-danger-700">700</div>
</div>

### Success

<div class="kk-swatches">
  <div class="kk-swatch bg-success-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-success-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-success-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-success-400">400</div>
  <div class="kk-swatch bg-success-500">500</div>
  <div class="kk-swatch bg-success-600">600</div>
  <div class="kk-swatch bg-success-700">700</div>
</div>

### Special colors

<div class="kk-swatches">
  <div class="kk-swatch bg-black">black</div>
  <div class="kk-swatch bg-white kk-swatch--light">white</div>
  <div class="kk-swatch bg-transparent kk-swatch--light">transparent</div>
</div>

`current` is also a special color (`currentColor`), but it has no visible
swatch of its own — it resolves to the element's `color` value.

## Tone values

Stored as `hsl(hue, saturation%, lightness%)`:

| Palette | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `neutral` | 0 0% 93% | 0 0% 86% | 0 0% 71% | 0 0% 50% | 0 0% 35% | 0 0% 24% | 0 0% 12% |
| `purple` | 269 60% 93% | 269 70% 86% | 269 70% 71% | 269 66% 50% | 269 66% 35% | 269 60% 24% | 269 50% 12% |
| `info` | 215 95% 93% | 215 95% 86% | 215 95% 71% | 215 95% 50% | 215 95% 35% | 215 95% 24% | 215 95% 12% |
| `warning` | 49 100% 93% | 49 100% 86% | 49 100% 71% | 49 100% 50% | 49 100% 35% | 49 90% 24% | 49 70% 12% |
| `danger` | 3 95% 93% | 3 95% 86% | 3 95% 71% | 3 95% 50% | 3 95% 35% | 3 95% 24% | 3 95% 12% |
| `success` | 147 95% 93% | 147 95% 86% | 147 95% 71% | 147 95% 50% | 147 95% 35% | 147 95% 24% | 147 95% 12% |

Special colors: `black` `hsl(0, 0%, 3%)` · `white` `hsl(0, 0%, 98%)` ·
`transparent` `transparent` · `current` `currentColor`.

## Accessor functions

| Signature | Returns |
| --- | --- |
| `v.get-color($name, $shade: 300, $alpha: 1)` | A palette shade (or a special color when `$name` is special). Applies alpha when `$alpha != 1`. |
| `v.get($name, $alpha: 1)` | Shorthand: `get-color($name, 500, $alpha)`. |
| `v.alpha($name, $shade: 500, $alpha: 0.5)` | Shorthand for transparent variants. |

```scss
@use "katanakit-css/src/scss/variables" as v;

color: v.get-color("neutral", 500);  // hsl(0, 0%, 35%)
color: v.get("info");                // shade 500: hsl(215, 95%, 35%)
border: 1px solid v.alpha("warning", 400, 0.25);
background: v.alpha("purple", 100, 0.4);
```

Invalid palette or shade names raise a compile-time `@error`.

## Generating CSS variables

`generate-css-vars()` emits one custom property per shade plus the specials:

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-vars();
```

```css
:root {
  --neutral-100: hsl(0, 0%, 93%);
  /* … every palette and shade … */
  --info-500: hsl(215, 95%, 35%);
  --black: hsl(0, 0%, 3%);
  --white: hsl(0, 0%, 98%);
  --transparent: transparent;
  --current: currentColor;
}
```

```scss
// Only the info palette, no specials:
@include v.generate-css-vars($palettes: "info", $include-special: false);

// A custom root selector:
@include v.generate-css-vars($root: ".theme-brand");
```

`$palettes` accepts `null` (all), a name, a list of names, or a map emitted
as-is — the mechanism the [dark theme](/core/dark-mode/) uses to
publish inverted palettes.

## Utility classes

The color mixins generate the classes you use in markup:

| Mixin | Classes |
| --- | --- |
| `v.text-utilities()` | `.text-{palette}-{100…700}` + `.text-black` `.text-white` `.text-transparent` `.text-current` |
| `v.bg-utilities()` | `.bg-{palette}-{100…700}` + `.bg-black` `.bg-white` `.bg-transparent` `.bg-current` |
| `v.border-utilities()` | `.border-{palette}-{100…700}` + the four specials |
| `v.hover-utilities()` | `.hover-text-*:hover` and `.hover-bg-*:hover` |
| `v.all-utilities()` | All four mixins at once (called by `main.scss`). |

See [Text Color](/utilities/text-color/),
[Background Color](/utilities/background-color/) and
[Border Color](/utilities/border-color/) for the complete
class tables.
