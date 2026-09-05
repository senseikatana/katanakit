# Design Tokens

Token maps, accessor functions and custom property generation.

# Design Tokens

Every design decision in KatanaKIT CSS lives in a set of `!default` SCSS maps
under `src/scss/_variables.scss`. Because the maps are `!default`, you override
them **once per compilation** with a Sass `with` clause, and both the token
accessors and the generated CSS update accordingly.

All token maps are consumed through the `variables` module:

```scss
@use "katanakit-css/src/scss/variables" as v;
```

## Token maps

| Map | Keys | Feeds |
| --- | --- | --- |
| `$font-families` | `sans-serif`, `serif`, `mono` | `v.font-family()` |
| `$shadow-sizes` | `default`, `sm`, `md`, `lg`, `xl`, `2xl`, `inner` | `v.shadow()` |
| `$container-sizes` | `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl` | `v.container()` |
| `$breakpoint-sizes` | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` | `v.breakpoint()` |
| `$spacing-scale` | `0`, `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`, `32` | `v.spacing()` |
| `$spacing-map` | full scale incl. fractions (`05`, `1-5`, `2-5`, `3-5`, `base`, `9`, `11`, `14`, … `96`) | `.p-*` `.m-*` `.gap-*` classes |
| `$radius` | `default`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full` | `v.radius()` |
| `$z-layers` | `auto`, `0`, `10`, `20`, `30`, `40`, `50`, `dropdown`, `sticky`, `fixed`, `modal`, `popover`, `tooltip` | `v.z()` |
| `$transition-durations` | `75`, `100`, `150`, `200`, `300`, `500`, `700`, `1000` | `v.duration()` |
| `$transition-easings` | `linear`, `in`, `out`, `in-out` | `v.ease()` |

Two spacing maps coexist on purpose:

- `$spacing-scale` is the **semantic scale** used by the `v.spacing()` accessor
  and exposed as `--spacing-*` custom properties.
- `$spacing-map` is the **class scale** — the single source of truth for the
  `.p-*`, `.m-*` and `.gap-*` utility classes. It adds fractional steps
  (`05`, `1-5`, `2-5`, `3-5`), `base` (1px) and the intermediate steps
  (`7`, `9`, `11`, `14`, `28`, … `96`) that the class generators emit.

## Accessor functions

Every accessor validates its key at compile time and raises an `@error` that
lists the valid keys when you miss.

| Signature | Returns | Example |
| --- | --- | --- |
| `v.font-family($name)` | font stack list | `v.font-family("sans-serif")` |
| `v.shadow($size: "default")` | shadow list | `v.shadow("md")` |
| `v.container($size)` | length | `v.container("lg")` → `32rem` |
| `v.breakpoint($name)` | px length | `v.breakpoint("md")` → `768px` |
| `v.spacing($size)` | length (number or string key) | `v.spacing(4)` → `1rem` |
| `v.radius($size: "default")` | length | `v.radius("xl")` → `0.75rem` |
| `v.z($layer)` | number or `auto` | `v.z("modal")` → `1040` |
| `v.duration($ms)` | duration | `v.duration(200)` → `200ms` |
| `v.ease($name: "in-out")` | timing function | `v.ease("out")` |

```scss
@use "katanakit-css/src/scss/variables" as v;

.card {
  padding: v.spacing(4);
  border-radius: v.radius("default");
  box-shadow: v.shadow("lg");
  font-family: v.font-family("sans-serif");
}

.overlay {
  z-index: v.z("modal");
  transition: opacity v.duration(200) v.ease("out");
}
```

## Generating CSS custom properties

`generate-css-tokens()` emits the token families as custom properties in
`:root`. Pass `false` to skip a family:

```scss
@mixin generate-css-tokens(
  $fonts: true, $shadows: true, $containers: true, $spacing: true,
  $radius-tokens: true, $z: true, $durations: true, $easings: true
)
```

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-tokens();

// Only fonts and shadows:
@include v.generate-css-tokens($containers: false, $spacing: false);
```

Compiled output:

```css
:root {
  --font-sans-serif: ui-sans-serif, system-ui, -apple-system, …;
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --container-xl: 36rem;
  --spacing-4: 1rem;
  --radius-full: 9999px;
  --z-tooltip: 1060;
  --duration-200: 200ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

The variable names carry no brand prefix: `--font-*`, `--shadow-*`,
`--container-*`, `--spacing-*`, `--radius-*`, `--z-*`, `--duration-*` and
`--ease-*`.

## Overriding tokens

Configure the module with `with` **before** anything else loads it — a module
can only be configured once per compilation:

```scss
// styles/tokens.scss — configure first
@use "katanakit-css/src/scss/variables" as v with (
  $spacing-scale: (
    "0": 0,
    "1": 0.5rem,
    "2": 1rem,
    "3": 1.5rem,
    "4": 2rem
  ),
  $radius: (
    "default": 0.5rem,
    "full": 9999px
  ),
  $breakpoint-sizes: (
    "xs": 0,
    "sm": 600px,
    "md": 900px,
    "lg": 1200px,
    "xl": 1440px
  )
);

// styles/main.scss — then consume
@use "tokens";
@use "katanakit-css/src/scss/main";
```

The accessors, the `--spacing-*` custom properties and the utility classes
that derive from the configured maps all pick up the new values.

## Related pages

- [Colors](/core/colors/) — the color palettes and their accessors.
- [Breakpoints](/core/breakpoints/) — responsive breakpoint tiers.
- [Functions](/reference/functions/) — pure helper functions.
