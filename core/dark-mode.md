# Dark Mode

Automatic dark theme with inverted palettes via data-theme.

# Dark Mode

KatanaKIT CSS generates a class-based dark theme for free: `v.theme("dark")`
takes the six palettes, **inverts each shade** (`100 ↔ 700`, `200 ↔ 600`,
`300 ↔ 500`), and publishes the result as custom properties under
`:root[data-theme="dark"]`.

The inversion applies to the **custom properties** (`--neutral-100`, …).
The color utility classes (`.bg-neutral-100`, `.text-neutral-500`, …) compile
to literal values and are theme-independent — use the variables in your own
rules when you need theme-aware styles.

## Enabling the dark theme

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-vars(); // light defaults on :root
@include v.theme("dark");       // inverted palettes on :root[data-theme="dark"]
```

```css
:root[data-theme="dark"] {
  --neutral-100: hsl(0, 0%, 12%);   /* was 700 */
  --neutral-200: hsl(0, 0%, 24%);   /* was 600 */
  /* … */
  --neutral-700: hsl(0, 0%, 93%);   /* was 100 */
}
```

Then toggle the theme by setting the attribute:

```html
<html data-theme="dark">
  <body class="surface text-body">
    <!-- .surface/.text-body are YOUR rules that consume
         var(--neutral-100) / var(--neutral-500): under the
         dark theme those variables now hold the inverted tones -->
  </body>
</html>
```

```js
// Flip between light and dark
document.documentElement.setAttribute("data-theme", "dark");
document.documentElement.removeAttribute("data-theme");
```

## How the inversion works

The inversion is a pure map transformation: `$inverted: 800 - $shade`.

| Light shade | Dark shade |
| --- | --- |
| `100` | `700` |
| `200` | `600` |
| `300` | `500` |
| `400` | `400` |
| `500` | `300` |
| `600` | `200` |
| `700` | `100` |

This is why the tonal vocabulary stays stable: `bg-neutral-100` is always
"the surface", `text-neutral-500` is always "the readable text" — the actual
HSL values swap underneath.

## Building on the variables

The dark-theme variables are ordinary custom properties, so compose freely:

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-vars();
@include v.theme("dark");

body {
  background-color: var(--neutral-100);
  color: var(--neutral-500);
}

.brand {
  color: var(--purple-400);
}
```

Note the color **utility classes** (`v.text-utilities()` etc.) compile to
literal values, not `var()` references. If you need theme-aware classes, use
the custom properties in your own rules, as above.

## Overriding the dark palette

`theme()` accepts an `$overrides` map merged over the inverted result:

```scss
@include v.theme(
  "dark",
  (
    "neutral": (
      100: hsl(0, 0%, 8%),
      500: hsl(0, 0%, 88%)
    )
  )
);
```

## Combining with the system preference

Pair the attribute-based theme with the `m.dark-mode` feature query to sync
`color-scheme` (scrollbars, form controls) with the system preference:

```scss
@use "katanakit-css/src/scss/variables" as v;
@use "katanakit-css/src/scss/mixins" as m;

@include v.generate-css-vars();
@include v.theme("dark");

@include m.dark-mode {
  :root {
    color-scheme: dark;
  }
}
```

To follow the system preference automatically, set `data-theme` from
JavaScript:

```js
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const apply = () =>
  document.documentElement.toggleAttribute("data-theme", mq.matches);

apply();
mq.addEventListener("change", apply);
```

## Related pages

- [Colors](/core/colors/) — palettes and `generate-css-vars()`.
- [Breakpoints](/core/breakpoints/) — the `m.dark-mode` feature query.
- [Text Color](/utilities/text-color/) and
  [Background Color](/utilities/background-color/) — the
  color utility classes.
