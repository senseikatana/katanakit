# KatanaKIT CSS

A lightweight, modular **SCSS mini-framework**: design tokens, utility classes
and layout mixins (grid, flex, breakpoints) with an `@apply`-style system.
Zero runtime overhead — it compiles to plain static CSS.

> `katanakit-css` is **version 0.1.0** (unreleased) and is a different,
> sibling project to the TypeScript library `katanakit-js`. Everything on this
> page refers to the **CSS/SCSS** framework in this repository.

---

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick start](#quick-start)
  - [Option A — precompiled CSS](#option-a--precompiled-css)
  - [Option B — full SCSS entry](#option-b--full-scss-entry)
  - [Option C — compose your own sheet](#option-c--compose-your-own-sheet)
- [Design tokens and how to override them](#design-tokens-and-how-to-override-them)
- [Colors](#colors)
- [Breakpoints](#breakpoints)
- [Grid and flex mixins](#grid-and-flex-mixins)
- [Utility classes](#utility-classes)
- [The apply system](#the-apply-system)
- [Dark theme](#dark-theme)
- [Example components](#example-components)
- [Run the demo locally](#run-the-demo-locally)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Documentation](#documentation)
- [Brand color reference](#brand-color-reference)
- [License](#license)

---

## Features

- **Design tokens as CSS custom properties** — fonts, shadows, containers,
  spacing, radius, z-layers, durations and easings exposed on `:root`
  (`--font-*`, `--shadow-*`, `--container-*`, `--spacing-*`, `--radius-*`,
  `--z-*`, `--duration-*`, `--ease-*`).
- **Color system** — six semantic palettes (`neutral`, `purple`, `info`,
  `warning`, `danger`, `success`) with **7 tones each** (100–700), plus four
  special colors (`white`, `black`, `transparent`, `current`). CSS variables,
  utility classes (text, background, border, hover) and theme support.
- **Utility class generation from maps** — padding and margin in every
  direction (`.p-*`, `.px-*`, `.py-*`, `.pt-*`, `.m-*`, `.mx-*`, `.my-*`, …),
  `gap-*`/`gap-x-*`/`gap-y-*`, text sizes (`.text-xs` … `.text-4xl`) and
  border widths (`.border`, `.border-0/2/4/8`) are active out of the box;
  sizing, flexbox, effects and layout generators are driven by `!default`
  maps.
- **`@apply`-style system** — a small registry that lets you compose utilities
  inside your own component rules (`@include a.apply(...)`), with a registry
  automatically kept in sync with the utility maps.
- **Layout mixins** — responsive grid (auto-fill/fit, fixed columns, areas,
  stacking, subgrid), flexbox container/item helpers and CSS Grid
  composition mixins.
- **Responsive system** — seven mobile-first breakpoints with a generic
  `breakpoint()` mixin (`up`/`down`/`only`/`between`), named aliases
  (`xs` … `xxxl`, `*-down`) and feature queries (portrait, landscape,
  reduced-motion, hoverable, touch, dark-mode, light-mode).
- **Pure functions** — unit conversion (`rem()`, `px()`, `to-unit()`,
  `strip-unit()`), fluid type (`fluid()` → `clamp()`) and color helpers
  (`tint()`, `shade()`, `contrast()`, …).
- **Tailwind-style preflight reset** — box-sizing, margin/padding zeroing,
  typography, lists, links, forms and media normalisation exposed as
  overrideable custom properties.
- **No runtime** — everything is resolved at build time by the Sass compiler.

---

## Requirements

- **Node.js + a Sass compiler** to consume the SCSS source (Dart Sass is the
  only compiler exercised; `sass` is a devDependency). The precompiled CSS in
  `dist/` needs no tooling at all.
- To run the local demo or the test suite you also need `yarn` (or npm).
- Compatible with any bundler/build that can run Sass; Vite is used for the
  demo but is **not** required to use the library.

---

## Installation

```bash
npm install katanakit-css
# or
yarn add katanakit-css
```

The package exposes two consumption entry points (see `package.json`):

| Field    | Value                            | Purpose                          |
| -------- | -------------------------------- | -------------------------------- |
| `style`  | `dist/css/katanakit.css`         | precompiled, minified full sheet |
| `sass`   | `src/scss/main.scss`             | SCSS entry for `@use`            |
| `files`  | `src/scss`, `dist/css`, `README` | what gets published              |

Published files include `src/scss`, `dist/css`, `README.md`, `LICENSE` and
`CHANGELOG.md`.

### CDN

Use the framework directly from jsDelivr without installing anything:

```html
<!-- Latest version (compressed, 119KB) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katanakit-css@latest/dist/css/katanakit.css" />

<!-- Specific version -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katanakit-css@0.9.1/dist/css/katanakit.css" />

<!-- Expanded (for development/debugging, 148KB) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katanakit-css@latest/dist/css/katanakit.expanded.css" />
```

You can also use unpkg:

```html
<link rel="stylesheet" href="https://unpkg.com/katanakit-css@latest/dist/css/katanakit.css" />
```

---

## Quick start

### Option A — precompiled CSS

Reference the bundled stylesheet directly:

```html
<link rel="stylesheet" href="/node_modules/katanakit-css/dist/css/katanakit.css" />
```

Or import it from your JavaScript entry (bundlers resolve the CSS file for
you):

```js
import "katanakit-css/dist/css/katanakit.css";
```

This sheet contains everything: the reset, all token custom properties, all
color utilities and all utility classes generated by
`generate-all-utilities()` (no components — components are opt-in SCSS).

### Option B — full SCSS entry

`src/scss/main.scss` is the public "full sheet" entry. Import it and you get
reset + tokens + color utilities + all utility generators:

```scss
// main.scss
@use "katanakit-css/src/scss/main";
```

If you use your own Sass entry you must configure tokens *before* loading the
sheet (see [override tokens](#design-tokens-and-how-to-override-them)).

### Option C — compose your own sheet

`main.scss` is deliberately tiny; every partial can be imported individually
(all `@use` calls are lowercase, modern module syntax):

```scss
// theme.scss — a custom sheet: reset + tokens + a few utilities
@use "katanakit-css/src/scss/reset";
@use "katanakit-css/src/scss/variables" as v;
@use "katanakit-css/src/scss/functions" as f;
@use "katanakit-css/src/scss/mixins" as m;
@use "katanakit-css/src/scss/utilities" as u;

// Tokens and color variables in :root
@include v.generate-css-tokens();
@include v.generate-css-vars();

// Color utilities only (text/bg/border + hover) — skip what you do not need
@include v.text-utilities();
@include v.bg-utilities();

// Opt-in utility generators, or nothing at all
@include u.generate-all-utilities();
```

Loading the `utilities` module already emits the spacing, text-size and
border-width classes automatically (`.p-*`, `.px-*`, `.py-*`, `.pt-*`, `.m-*`,
`.mx-*`, `.my-*`, `.gap-*`, `.gap-x-*`, `.gap-y-*`, `.text-xs` … `.text-4xl`,
`.border`, `.border-0/2/4/8`, plus `.gap`, `.shadow`, `.rounded`); everything
else is generated by the generators above. See
[Utility classes](#utility-classes).

> **Naming note.** Utility class keys are literal strings — dots and hyphens
> are kept as-is (`.p-05`, `.p-1-5`, `.p-2-5`, `.p-base`, `.w-screen`). There
> is no Tailwind-style bracket conversion.

---

## Design tokens and how to override them

Tokens live in `src/scss/_variables.scss` as `!default` maps, exposed
as CSS custom properties by `generate-css-tokens()`:

| Family                | Map                  | Keys                                                         | Example variables              |
| --------------------- | -------------------- | ------------------------------------------------------------ | ------------------------------ |
| Font families         | `$font-families`     | `sans-serif`, `serif`, `mono`                                | `--font-sans-serif`            |
| Shadows               | `$shadow-sizes`      | `default`, `sm`, `md`, `lg`, `xl`, `2xl`, `inner`            | `--shadow-md`                  |
| Container sizes       | `$container-sizes`   | `sm` … `6xl` (9 sizes)                                       | `--container-xl`               |
| Breakpoints           | `$breakpoint-sizes`  | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`                   | (used by breakpoints module)   |
| Spacing               | `$spacing-scale`     | `0`, `1` … `32` (rem steps)                                  | `--spacing-4`                  |
| Border radius         | `$radius`            | `default`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`      | `--radius-lg`                  |
| Z-index layers        | `$z-layers`          | `auto`, `0`–`50`, `dropdown`, `sticky`, `fixed`, `modal`, `popover`, `tooltip` | `--z-modal`       |
| Transition durations  | `$transition-durations` | `75`–`1000` (ms)                                          | `--duration-200`               |
| Transition easings    | `$transition-easings` | `linear`, `in`, `out`, `in-out`                             | `--ease-in-out`                |

Accessor functions let you read a token at build time and accept a string or a
number depending on the key type:

```scss
@use "katanakit-css/src/scss/variables" as v;

.demo {
  padding: v.spacing(4);            // 1rem
  border-radius: v.radius("lg");    // 0.5rem
  z-index: v.z(50);                 // 50  (number accepted)
  z-index: v.z("modal");            // 1040
  transition-duration: v.duration(200);      // 200ms
  transition-timing-function: v.ease("out"); // cubic-bezier(...)
  font-family: v.font-family("sans-serif");
  box-shadow: v.shadow("md");
  max-width: v.container("xl");
  @media (min-width: v.breakpoint("lg")) { /* … */ }
}
```

All token maps are `!default`, so you can override them with the standard Sass
`with` clause **before** the sheet loads the module:

```scss
// 1) Configure the tokens first — must be the first load of the variables
//    module in the compilation.
@use "katanakit-css/src/scss/variables" with (
  $font-families: ("sans-serif": (system-ui, sans-serif), "mono": (monospace)),
  $breakpoint-sizes: ("xs": 0, "sm": 600px, "md": 900px, "lg": 1200px, "xl": 1400px, "2xl": 1600px, "3xl": 1920px),
  $spacing-scale: ("0": 0, "1": 0.25rem, "2": 0.5rem, "3": 0.75rem, "4": 1rem, "6": 1.5rem, "8": 2rem)
);

// 2) Then load whatever consumes the module (the full sheet, or partials).
@use "katanakit-css/src/scss/main";
```

**Important:** a Sass module can only be configured once per compilation, so
the `with` clause must be the first usage of the `variables` module.

---

## Colors

Colors live in `src/scss/_variables.scss` (merged from the former `_colors.scss`). Six palettes of seven tones
each (100 is the lightest, 700 the darkest):

| Palette   | Hue / character              |
| --------- | ---------------------------- |
| `neutral` | gray scale, saturation 0%    |
| `purple`  | violet, ~269°                |
| `info`    | blue, ~215°                  |
| `warning` | yellow, ~49°                 |
| `danger`  | red, ~3°                     |
| `success` | green, ~147°                 |

Plus `$special-colors`: `black`, `white`, `transparent`, `current`
(currentColor).

Use the accessors from SCSS:

```scss
@use "katanakit-css/src/scss/variables" as v;

.box {
  color: v.get-color("neutral", 500);       // 7th shade
  color: v.get-color("info", 300, 0.5);     // with alpha
  background: v.get("info");                // shorthand for shade 500
  border-color: v.alpha("warning", 400, 0.25);
}
```

Generate custom properties and/or utility classes with the color mixins:

```scss
@include v.generate-css-vars();        // --neutral-100 … --success-700, --white, …
@include v.all-utilities();            // .text-*, .bg-*, .border-*, hover variants
```

```html
<body class="bg-neutral-100 text-neutral-500">
  <p class="text-info-500">Info</p>
  <button class="bg-white hover-bg-info-300 text-black">Hover me</button>
</body>
```

Color utilities can be filtered by palette and specials toggled off, e.g.
`@include v.all-utilities("info", false)` or
`@include v.text-utilities((neutral, success))`. See
[docs/API-Reference.md](docs/API-Reference.md#colors-as-v) for the full
signatures.

---

## Breakpoints

Breakpoints are defined in `_mixins.scss` (merged from the former
`_breakpoints.scss`):

`xs` 0 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536 · `3xl` 1920
(px).

Use the generic mixin for `up`, `down`, `only` and `between` (the alias `bp`
accepts the same arguments):

```scss
@use "katanakit-css/src/scss/mixins" as m;

.card {
  padding: 1rem;

  @include m.breakpoint("md", up) { padding: 2rem; }
  @include m.breakpoint("sm", down) { padding: 0.5rem; }
  @include m.breakpoint("md", only, "lg") { /* only md */ }
  @include m.breakpoint("sm", between, "lg") { /* sm ≤ viewport < lg */ }
}
```

Or use the named mixins (all mobile-first `up`, plus `*-down`):

```scss
@include m.md { /* ≥ 768px */ }
@include m.lg-down { /* < 1024px */ }

@include m.xxl { /* ≥ 1536px  (alias of the 2xl key) */ }
@include m.xxxl { /* ≥ 1920px  (alias of the 3xl key) */ }
@include m.x2l-down { /* < 1536px */ }
@include m.xxl-down { /* canonical alias of x2l-down */ }
```

Feature queries are first-class mixins: `m.portrait`, `m.landscape`,
`m.reduced-motion`, `m.hoverable`, `m.touch`, `m.dark-mode`,
`m.light-mode`.

---

## Grid and flex mixins

Mixins output the CSS you need without utility-class scaffolding.

**Grid** (`_mixins.scss`, namespace `as m`):

```scss
@use "katanakit-css/src/scss/mixins" as m;

.gallery {
  @include m.grid-responsive(240px, fill, 1fr, 1rem); // auto-fill columns
  @include m.grid-autofit(240px, 1fr);                 // auto-fit
}

.layout {
  @include m.grid-container(12, null, 1rem);           // 12 equal columns
  > main { @include m.grid-placement(1, 8, 1, null); } // place an item
  > aside { @include m.grid-span(4); }                 // span 4 columns
}
```

Other mixins: `grid-center`, `grid-gap`, `grid-areas`/`grid-area`,
`grid-item-center`, `grid-item-full`, `grid-breakpoint-columns`,
`grid-fixed-columns`, `subgrid`, `grid-masonry` (experimental), and the
`grid-stack`/`grid-stack-item` pair for stacking children in the same cell.

**Flex** (`_mixins.scss`, namespace `as m`):

```scss
@use "katanakit-css/src/scss/mixins" as m;

.nav {
  @include m.flex-container(row, nowrap, 0.5rem, center, space-between);
}
.hero { @include m.flex-center(1rem); }
.hero .title { @include m.flex-item(1, 1, auto); }
```

Also available: `flex-gap`, `flex-grow`, `flex-shrink`, `flex-basis`,
`flex-item`, `flex-item-center`, `flex-item-full`.

---

## Utility classes

Utility classes are generated from the maps in `_utilities.scss`.
They fall into three groups:

### 1. Automatic (emitted when the `utilities` module is loaded)

| Classes                | Property     | Source         |
| ---------------------- | ------------ | -------------- |
| `.p-*`, `.px-*`, `.py-*`, `.pt-*`, `.pr-*`, `.pb-*`, `.pl-*` (e.g. `p-0`, `p-05`, `p-base`, `p-1`, `p-1-5`, `p-4` … `p-96`) | `padding` (all directions) | `$spacing-map` |
| `.m-*`, `.mx-*`, `.my-*`, `.mt-*`, `.mr-*`, `.mb-*`, `.ml-*` | `margin` (all directions) | `$spacing-map` |
| `.gap-*`, `.gap-x-*`, `.gap-y-*` | `gap` / `column-gap` / `row-gap` | `$spacing-map` |
| `.text-xs` … `.text-4xl` | `font-size` | `$font-size-map` |
| `.border-0`, `.border-2`, `.border-4`, `.border-8`, `.border` | `border-width` (`1px solid` for `.border`) | `$border-width-map` |
| `.gap`                 | `gap: 1rem`  | hard-coded     |
| `.shadow`              | default `box-shadow` | hard-coded |
| `.rounded`             | `border-radius: 0.25rem` | hard-coded |

### 2. Color utilities (`colors.all-utilities()`)

`.text-{palette}-{shade}`, `.bg-{palette}-{shade}`,
`.border-{palette}-{shade}`, `.hover-text-{palette}-{shade}:hover`,
`.hover-bg-{palette}-{shade}:hover` for every palette × shade, plus
`.text-white`, `.bg-white`, `.hover-bg-transparent`, … for special colors.

### 3. Opt-in generators (invoked by `main.scss`)

`generate-all-utilities()` calls the four generators below. Include them
individually if you compose your own sheet.

| Generator            | Classes generated (from the utility maps)                                    |
| -------------------- | ------------------------------------------------------------------------ |
| `u.get-sizing-classes`   | `w-*`, `min-w-*`, `max-w-*`, `h-*`, `min-h-*`, `max-h-*` (keys of `$sizing-map`, e.g. `.w-full`, `.w-screen` = `100vw`, `.w-auto`) |
| `u.generate-flex-utilities` | `flex-row`, `flex-col`, `flex-row-reverse`, `flex-col-reverse`, `flex-wrap`, `flex-nowrap`, `items-start/center/end/stretch`, `justify-start/center/end/between/around/evenly`, `gap-0`…`gap-8` |
| `u.generate-effects-utilities` | `shadow-none/sm/md/lg/xl/2xl/inner`, `rounded-none/sm/md/lg/xl/2xl/3xl/full`, `z-auto/0/10/…/50/dropdown/sticky/fixed/modal/popover/tooltip`, `duration-75`…`duration-1000`, `ease-linear/in/out/in-out`, `opacity-0`…`opacity-100` |
| `u.generate-layout-utilities` | display (`.block`, `.inline-block`, `.inline`, `.flex`, `.inline-flex`, `.grid`, `.inline-grid`, `.table`, `.table-row`, `.table-cell`, `.hidden` = `display:none`, `.contents`), position (`.static`, `.fixed`, `.absolute`, `.relative`, `.sticky`), `.overflow-auto/hidden/scroll/visible`, `.text-left/center/right/justify`, `.font-thin`…`.font-black` (100–900), `.whitespace-nowrap/pre/normal`, `.wrap-break-word` |

**What is NOT generated as a CSS class** (you will not find them in the
compiled sheet, even though their names exist in the `@apply` registry —
see next section): `flex-1`, `flex-auto`, `flex-none`, `grid-cols-*`,
`col-span-full` and the `transition*` helpers.

> **Spacing naming.** Utility spacing comes from `$spacing-map`, whose keys
> are literal (`"05"` = `0.125rem`, `"1-5"` = `0.375rem`, `"2-5"` = `0.625rem`,
> `"3-5"` = `0.875rem`, `"base"` = `1px`). So the classes are `.p-05`,
> `.p-1-5`, `.p-2-5`, `.p-3-5` and `.p-base` — not `.p-0.5` or `.p-px`.

---

## The apply system

`_mixins.scss` implements a tiny `@apply` emulation for SCSS (merged from the
former `_apply.scss`). Register a named utility, then compose it inside any
rule:

```scss
@use "katanakit-css/src/scss/mixins" as m;

// Custom utility (registered once, module level)
@include m.register-utility("text-shadow-soft", (text-shadow: 0 1px 2px rgb(0 0 0 / 0.2)));

.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);

  &:hover {
    @include m.apply(shadow-lg);
  }
}
```

The registry is populated automatically at module load from the *same*
`_utilities.scss` source of truth that drives the class generators, plus a set
of handy hard-coded utilities. Available names include:

- **Display/flex/spacing** — `block`, `inline-flex`, `hidden`, `flex-row`,
  `flex-col`, `flex-wrap`, `items-center`, `justify-between`, and every
  combination over `$spacing-map` for `p/px/py/pt/pb/pl/pr`,
  `m/mx/my/mt/mb/ml/mr`, `gap/gap-x/gap-y` (e.g. `m-4`, `px-4`, `gap-2-5`).
- **Typography** — `text-xs`…`text-4xl` (font sizes), `text-left/center/right`,
  `font-thin`…`font-black`.
- **Sizing** — `w-full`, `w-screen`, `h-full`, `w-auto`, …
- **Borders/effects** — `rounded*`, `border`, `border-2`, `shadow*`,
  `opacity-*`, `z-*`, `duration-*`, `ease-*`.
- **Layout** — `static/fixed/absolute/relative/sticky`, `overflow-*`,
  `whitespace-*`, `wrap-break-word`.
- **Grid helpers** — `grid-cols-1/2/3/4/6/12`, `col-span-full`.
- **Colors** — `text-white`, `text-black`, `bg-white`, `bg-black`,
  `bg-transparent`.
- **Transitions** — `transition`, `transition-colors`, `transition-opacity`,
  `transition-transform`.

`apply()` throws a compile-time `@error` when a utility is not registered.

---

## Dark theme

The `theme` function in `variables` (merged from the former `_theme.scss`
partial) delegates to `v.theme()`. A dark theme inverts every palette so the darkest color lands on the lightest key
(100 ↔ 700, 200 ↔ 600, 300 ↔ 500) and emits the palette under
`:root[data-theme="dark"]`.

```scss
@use "katanakit-css/src/scss/variables" as v;

// Base (light) variables in :root
@include v.generate-css-vars();

// Dark overrides under :root[data-theme="dark"]
@include v.theme("dark");

// Or a custom theme with extra overrides
@include v.theme("dark", $overrides: ("info": (100: #dbeafe, 500: #2563eb)));
```

```html
<html data-theme="dark"> … </html>
```

The dark theme block only carries the six inverted palettes (special colors
keep their `:root` definitions from `generate-css-vars()`).

---

## Example components

Component styles are **not** part of the public sheet. Ready-to-adapt
examples built on `apply()` live in `src/scss/components/_index.scss` and are
used by the demo entry `src/scss/demo.scss`:

```scss
// demo.scss
@use "main";
@use "components/index";
```

```scss
// components/_index.scss
.card {
  @include a.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);
  &:hover { @include a.apply(shadow-lg); }
}
```

---

## Run the demo locally

```bash
yarn install
yarn dev          # Vite dev server on http://localhost:4321 (HMR over src/scss)
```

The demo page is `index.html`; `demo/main.js` imports `src/scss/demo.scss`
(full framework + example components) and starts the **version switcher**
(`demo/version-switcher.js`): the `<select>` at the top of the page toggles
between the live dev SCSS and published builds compiled by
`yarn build:versions` into `public/versions/<tag>.css`. `demo-dist/` is the
production build of the same page, purged by PurgeCSS.

---

## Scripts

| Script              | Command / effect                                                              |
| ------------------- | ----------------------------------------------------------------------------- |
| `yarn dev`          | `vite` — dev server on port 4321 with HMR                                     |
| `yarn build`        | `build:css && build:versions && build:demo`                                   |
| `yarn build:css`    | Sass CLI → `dist/css/katanakit.css` (compressed, no source map)               |
| `yarn build:versions` | Sass CLI → `public/versions/<tag>.css` for the demo version switcher        |
| `yarn build:demo`   | `vite build` → `demo-dist/` with PurgeCSS (`variables: false` keeps tokens)   |
| `yarn preview`      | `vite preview` — preview the `demo-dist` build                                |
| `yarn test`         | `vitest run` — 26 tests over fixtures in `test/fixtures/`                     |
| `yarn test:watch`   | `vitest` — watch mode                                                         |
| `yarn docs:dev`     | `astro dev --root site` — documentation site dev server                       |
| `yarn docs:build`   | `astro build --root site` — build the documentation site                      |

PostCSS runs **autoprefixer** during the Vite builds.

---

## Project structure

```
katanakit-css/
├── src/scss/
│   ├── main.scss              # Entry: base + tokens + generators
│   ├── demo.scss              # main + components (dev/demo)
│   ├── _reset.scss            # base (normaliza)
│   ├── _variables.scss        # tokens de diseño + paleta de colores (merged)
│   ├── _functions.scss        # funciones puras (unidades, color, fluid)
│   ├── _mixins.scss           # grid + flex + breakpoints + @apply + core generators + theme
│   ├── _utilities.scss        # maps + todos los generadores de clases (opt-in)
│   └── components/
│       └── _index.scss        # example components built with @apply
├── dist/css/katanakit.css        # npm artifact (compressed full sheet)
├── demo-dist/                    # production build of the demo (PurgeCSS)
├── public/versions/              # compiled per-version CSS for the demo switcher
├── index.html + demo/main.js     # local demo served by Vite
├── test/                         # vitest suite + fixtures (26 tests)
├── site/                         # Astro + Starlight documentation site
├── docs/                         # Getting-Started, API-Reference, Architecture, Roadmap
├── colors-palette.md             # author's brand palette (reference only)
├── package.json · vite.config.js · postcss.config.cjs · vitest.config.ts
```

---

## Documentation

- [Getting Started](docs/Getting-Started.md) — install, first styles, override tokens.
- [API Reference](docs/API-Reference.md) — every function, mixin and map, verified against the code.
- [Architecture](docs/Architecture.md) — layers, module graph and build flow.
- [Roadmap](docs/Roadmap.md) — what is done and what is planned.

Also see [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) and
[CHANGELOG.md](CHANGELOG.md).

---

## Brand color reference

`colors-palette.md` documents the **personal brand palette** of the author
(Sol Naciente, Sombra Acero, Oro Sensei, Pergamino, Tatami, Niebla Bambú,
Tinta Sumi-e). It is provided for reference **only** and is not wired into the
framework colors described above.

---

## License

[MIT](LICENSE) © 2026 Sergio Jurado
