# Architecture

How KatanaKIT CSS is organized and how the build pipeline works.

# Architecture

This document explains how `katanakit-css` is organised, how the modules
relate to each other and how a source `.scss` file becomes the artifacts you
ship.

> TL;DR — `katanakit-css` is **build-time SCSS**. There is no JavaScript
> runtime. Everything is produced by the Sass compiler from `!default` token
> maps.

---

## 1. Overview

The framework is a collection of Sass **modules** (partials) plus two
compilable entries:

| Entry | What it emits | Used for |
| --- | --- | --- |
| `src/scss/main.scss` | Public "full sheet": reset + token custom properties + color variables and utilities + all utility generators. **No components.** | npm artifact `dist/css/katanakit.css` and `@use "katanakit-css/src/scss/main"` consumers. |
| `src/scss/demo.scss` | `@use "main"` + `@use "components/index"` (example components built on `apply`). | Local demo only (Vite). |

Components intentionally stay out of `main.scss`: they are *example* styles,
not framework API.

---

## 2. Layer model

```
┌──────────────────────────────────────────────────────────────┐
│ ENTRY POINTS                                                 │
│   main.scss  ·  demo.scss                                    │
└───────────────┬──────────────────────────────────────────────┘
                │ @use
┌───────────────▼──────────────────────────────────────────────┐
│ CORE MODULES (src/scss/*.scss)                               │
│   reset · variables(v) · functions(f) · mixins(m)            │
│   utilities(u)                                               │
└───────┬───────────────────────────────┬──────────────────────┘
        │ @use/@forward                 │ @use
┌───────▼────────────────────────┐ ┌────▼──────────────────────────────┐
│ (merged into _mixins.scss)     │ │ COMPONENTS (demo only)            │
│  breakpoints · grid · flex     │ │   components/_index.scss          │
│  apply · theme · core          │ │   uses mixins                     │
└────────────────────────────────┘ └────────────────────────────────────┘
```

Modules never `@import` each other; they use modern `@use` (lowercase) with
explicit namespaces. The former `partials/` and `partials/utils/` layers have
been consolidated: `_variables.scss` absorbs colors and theme, `_mixins.scss`
absorbs breakpoints, grid, flex, apply and core generators, and
`_utilities.scss` absorbs all maps and class generators.

---

## 3. Responsibilities of each partial

| Partial | Namespace | Responsibility |
| --- | --- | --- |
| `_reset.scss` | — | Modern reset. Defaults are exposed as `:root` custom properties (`--m-reset`, `--box-sizing`, `--min-h-screen`, …) so a theme can change them without editing the reset. |
| `_variables.scss` | `as v` | `!default` token maps (fonts, shadows, containers, breakpoints, spacing, radius, z, durations, easings), accessor functions, `generate-css-tokens()`, color tokens/accessors (`get-color`/`get`/`alpha`), `generate-css-vars()`, color utilities, and `theme()`. |
| `_functions.scss` | `as f` | Pure helpers: unit conversion, `fluid()` → `clamp()`, color manipulation, `color-mix-var()`, `to-class()`. No CSS output. |
| `_mixins.scss` | `as m` | Breakpoint queries (`breakpoint()`/`bp()`, named aliases, feature queries), grid composition mixins, flex container/item mixins, `@apply` registry (`register-utility()`/`apply()`), core generators (`utils-classes`, `vars-list`/`vars-map`, centering helpers), and theme hook. |
| `_utilities.scss` | `as u` | Utility token maps (`$sizing-map`, `$font-size-map`, `$border-width-map`, etc.) plus all class generators (`get-sizing-classes`, `generate-flex-utilities`, `generate-effects-utilities`, `generate-layout-utilities`, `generate-all-utilities`). |

---

## 4. The utility engine

The utility system is deliberately map-driven so that tokens and generated
classes cannot drift apart.

### 4.1 Maps are the single source of truth

`_utilities.scss`, `_variables.scss` and `_mixins.scss` hold the utility
token maps. The sizing/font-size/border-width maps live in `_utilities.scss`;
`$spacing-map` lives in `_variables.scss` (shared by the class generator and
the `@apply` registry); the rest live in `_mixins.scss` next to the generic
class generator:

- `$sizing-map` (width/height values, incl. `full`, `screen`, `min`, `max`,
  `fit`),
- `$spacing-map` (padding/margin/gap scale; keys are literal: `"05"`,
  `"1-5"`, `"2-5"`, `"3-5"`, `"base"` …),
- `$font-size-map` (`.text-xs` … `.text-4xl`),
  `$border-width-map` (`.border-0/2/4/8`),
- `$flex-direction-map`, `$flex-wrap-list`, `$align-items-map`,
  `$justify-content-map`,
- `$shadow-map`, `$radius-map`, `$z-layers-map`, `$transition-duration-map`,
  `$transition-timing-map`, `$opacity-values`,
- `$font-weight-values`, `$text-align-values`, `$display-values`,
  `$position-values`, `$overflow-values`, `$white-space-list`,
  `$overflow-wrap-list`.

All maps are `!default`, so downstream projects can override them with the
Sass `with` clause.

### 4.2 From maps to CSS classes

```
_utilities.scss (maps) ─► generators (_utilities.scss)
                              │  use m.utils-classes($input, $property, $prefix)
                              ▼
                     .w-full { width: 100% }
                     .hidden { display: none }   // $display-values maps hidden → none
                     .font-normal { font-weight: 400 }
                     .gap-4 { gap: 1rem }
                     …
```

- `_mixins.scss` provides the generic `utils-classes()` / `utils-classes-hover()`
  mixins plus CSS-variable helpers (`vars-list`, `vars-map`) and centering
  helpers (`absolute-center`, `center-mx`, `center-my`).
- `_utilities.scss` emits, automatically at load time: padding and margin
  classes in every direction (`.p-*`, `.px-*`, `.py-*`, `.pt-*`, …, `.m-*`,
  `.mx-*`, `.my-*`, …), `gap-*`/`gap-x-*`/`gap-y-*` for every `$spacing-map`
  key, text sizes (`.text-xs` … `.text-4xl`), border widths (`.border`,
  `.border-0/2/4/8`), plus `.gap`, `.shadow` and `.rounded`. This means
  loading the module is enough to get the common spacing and typography
  classes.
- The rest is **opt-in**: `get-sizing-classes()`,
  `generate-flex-utilities()`, `generate-effects-utilities()` and
  `generate-layout-utilities()`. `generate-all-utilities()` calls them all,
  which `main.scss` invokes.

### 4.3 The apply registry mirrors the same maps

`_mixins.scss` builds its automatic registry with `@each` loops **over the
same utility maps that drive the class generators** — `$radius-map`,
`$shadow-map`, `$z-layers-map`, `$transition-duration-map`,
`$transition-timing-map`, `$opacity-values`, `$display-values`,
`$position-values`, `$overflow-values`, `$text-align-values`,
`$font-weight-values`, `$flex-direction-map`, `$flex-wrap-list`,
`$align-items-map`, `$justify-content-map` — plus the `$spacing-scale` token
map from `_variables.scss` for spacing names**. That keeps `apply(flex, p-4,
rounded-lg, …)` consistent with the generated `.flex`, `.p-4` and
`.rounded-lg` classes, and means a scale change propagates to both systems at
once.

The registry also carries hand-written helpers that are *not* generated as
classes (`flex-1`, `flex-auto`, `flex-none`, grid columns (`grid-cols-*`,
`col-span-full`), transitions, …). Those names are only available inside
`@include a.apply(...)`.

### 4.4 Color utilities

Color utilities do **not** go through the generic engine. `_variables.scss`
emits them with a dedicated helper that iterates `$colors` × `$shades` and
`$special-colors`:

```
.text-neutral-500  { color: hsl(0 0% 35%) }
.bg-info-300       { background-color: … }
.border-white      { border-color: … }
.hover-bg-success-600:hover { … }
```

The palette custom properties (`--neutral-500`, `--white`, …) are a parallel
output of `generate-css-vars()`; the utility classes keep **literal values**
so class-based CSS purging can remove them safely while the token variables
stay in `:root`.

---

## 5. Tokens and the `:root` block

`main.scss` calls, in order:

```scss
@use "./reset";            // reset emits its own :root defaults
@use "./variables" as v;
@use "./functions" as f;
@use "./mixins" as m;
@use "./utilities" as u;

@include v.generate-css-tokens();  // --font-*, --shadow-*, --spacing-*, …
@include v.generate-css-vars();    // --neutral-100…, --white, …
@include v.all-utilities();        // .text-*, .bg-*, .border-*, hover
@include u.generate-all-utilities();
```

The CSS custom properties are grouped under `:root`. Because every token map
is `!default`, a consumer can reconfigure the whole output by loading the
`variables` module with a `with` clause *before* anything else loads it (a
Sass module can only be configured once per compilation).

Dark themes do not edit `:root`: `theme("dark")` emits an *additional* block
under `:root[data-theme="dark"]` with each palette inverted (100 ↔ 700,
200 ↔ 600, 300 ↔ 500), leaving the light defaults untouched.

---

## 6. Build pipeline

Two independent pipelines produce the artifacts:

```
(1) npm artifact
    src/scss/main.scss
          │  yarn build:css
          │  sass src/scss/main.scss dist/css/katanakit.css
          │  --no-source-map --style=compressed
          ▼
    dist/css/katanakit.css            ◄── shipped, referenced by "style"

(2) local demo
    src/scss/demo.scss  +  index.html + demo/main.js
          │  yarn dev        →  vite dev server (HMR, port 4321)
          │  yarn build:demo →  vite build
          │                     PostCSS autoprefixer  +  PurgeCSS
          ▼
    demo-dist/ (index.html + assets/*.css + assets/*.js)
```

Notes on the demo build (`vite.config.js`):

- `publicDir: false` — there is no static folder; the CSS is compiled from the
  SCSS module graph.
- PurgeCSS content is `index.html` + `demo/**/*.{js,ts}`. A safelist keeps
  variant-looking tokens (`hover:*`, `md:*`, …) and keyframes/font-faces are
  preserved.
- `variables: false` — PurgeCSS keeps the custom properties in `:root` (the
  token/color variables) even though utility classes use literal values.
- Output goes to `demo-dist/`, intentionally **not** `dist/`, so the demo never
  overwrites the npm CSS artifact.
- The `dist/css/katanakit.css` artifact is produced by the Sass CLI alone; run
  your own PostCSS (e.g. autoprefixer) when you consume the SCSS source if you
  need prefixing for older browsers.

The test suite (`vitest`, `test/**/*.test.mjs`) compiles the entries and
fixtures in memory via the Sass JS API (`loadPaths: src/scss`) and
asserts on the compiled CSS — it never writes to `src/` or `dist/`.

---

## 7. Conventions that keep the architecture intact

1. **One responsibility per partial** — put new capabilities in the module
   that owns that concern (tokens and colors in `_variables.scss`, mixins in
   `_mixins.scss`, utility maps and generators in `_utilities.scss`, …).
2. **Modern module syntax only** — `@use`/`@forward`, never `@import`.
3. **Maps are `!default`** — any scale can be overridden without forks.
4. **Kebab-case literal keys** — utility keys (`.p-05`, `.p-1-5`, `.w-screen`)
   match the map keys exactly; no bracket conversion layer.
5. **Generated classes vs registry** — only mixins explicitly emit classes;
   registering a utility for `apply` never creates a class by itself.
6. **`main.scss` stays component-free** — example components live in
   `components/_index.scss` and are pulled in by `demo.scss`, never by the
   public sheet.
