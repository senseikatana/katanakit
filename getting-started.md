# Getting Started

Install katanakit-css and write your first styles.

# Getting Started

This guide walks you through installing `katanakit-css` and writing your first
styles. It assumes basic familiarity with Sass module syntax (`@use`). If you
are new to the framework, skim the [Introduction](/) first —
this guide goes a bit deeper on concrete setup options.

The full, code-verified API surface lives in the
[API Reference](/reference/api-reference/).

---

## Prerequisites

- **Node.js** (>= 20 is a safe floor) to install the package.
- A **Sass compiler** (Dart Sass is what this project is tested against) when
  you consume the SCSS source. `sass` is a devDependency of the repo, but it
  is your responsibility in downstream projects.
- The **precompiled stylesheet** (`dist/css/katanakit.css`) needs no tooling.

There is **no runtime**: `katanakit-css` is pure build-time SCSS/CSS.

---

## Installation

```bash
npm install katanakit-css
# or
yarn add katanakit-css
```

### Choosing an entry point

| Entry                                   | What you get                                                          |
| --------------------------------------- | --------------------------------------------------------------------- |
| `dist/css/katanakit.css`                | Compiled, minified **full sheet** (reset + tokens + utilities).       |
| `katanakit-css/src/scss/main`           | Full sheet as SCSS you compile yourself (adds browser prefixes, custom purging, tree-shaking of SCSS modules). |
| `katanakit-css/src/scss/*`              | Individual modules you compose into a custom sheet.                   |

All SCSS imports are **lowercase `@use`** with an explicit namespace. There is
no legacy `@import` anywhere.

---

## Path 1 — precompiled CSS

Link it or import it:

```html
<link rel="stylesheet" href="/node_modules/dist/css/katanakit.css" />
```

Or import it from your JavaScript entry in a bundler-based app:

```js
import "katanakit-css/dist/css/katanakit.css";
```

The sheet already contains every utility class the framework can generate, so
you can start writing markup immediately:

```html
<body class="bg-neutral-100 text-neutral-500">
  <main class="p-8">
    <h1 class="text-2xl mb-4">Hello KatanaKIT</h1>
    <div class="card"><!-- styled by your own component CSS --></div>
  </main>
</body>
```

Trade-off: the full sheet is convenient, but ships every utility. For smaller
output, use Path 2 or 3 and let your build (or PurgeCSS, as the demo does)
remove unused classes.

---

## Path 2 — compile the full SCSS entry

```scss
// styles/main.scss
@use "katanakit-css/src/scss/main";
```

Add `styles/main.scss` to your Sass pipeline. This compiles the same contents
as the precompiled sheet: a Tailwind-style preflight reset, token custom
properties in `:root`, color custom properties and utilities, and all utility
generators.

To use the `@apply` registry or the mixins in your own SCSS, load the partials
too:

```scss
@use "katanakit-css/src/scss/mixins" as m;

.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);

  @include m.md {
    @include m.apply(flex-row, gap-6);
  }
}
```

---

## Path 3 — compose a custom sheet

You only pay for the modules you load. Every partial is importable; all token
maps are `!default`.

```scss
// styles/theme.scss
@use "katanakit-css/src/scss/reset";
@use "katanakit-css/src/scss/variables" as v;
@use "katanakit-css/src/scss/functions" as f;
@use "katanakit-css/src/scss/mixins" as m;
@use "katanakit-css/src/scss/utilities" as u;

// Tokens and color variables
@include v.generate-css-tokens();
@include v.generate-css-vars();

// Color utilities: text, backgrounds and hover text/bg
@include v.all-utilities();

// Utility generators (opt-in)
@include u.generate-all-utilities();
```

Remember: just loading the `utilities` module automatically emits spacing
classes — padding and margin in every direction (`.p-*`, `.px-*`, `.py-*`,
`.pt-*`, `.m-*`, `.mx-*`, `.my-*`, …) plus `gap-*`/`gap-x-*`/`gap-y-*` — text
sizes (`.text-xs` … `.text-4xl`) and border widths (`.border`,
`.border-0`/`2`/`4`/`8`), as well as `.gap`, `.shadow` and `.rounded`.
`generate-all-utilities()` adds sizing, flex, effects and layout classes.
Skip the generators you do not need.

---

## Overriding design tokens

Token maps are `!default`, so you override them with a Sass `with` clause.
Because a module can only be configured once per compilation, configure
`variables` **before** anything else loads it:

```scss
// styles/tokens.scss — configure first
@use "katanakit-css/src/scss/variables" with (
  $font-families: (
    "sans-serif": (system-ui, -apple-system, "Segoe UI", sans-serif),
    "serif": (Georgia, "Times New Roman", serif),
    "mono": (ui-monospace, "SFMono-Regular", Menlo, monospace),
  ),
  $spacing-scale: (
    "0": 0, "1": 0.25rem, "2": 0.5rem, "3": 0.75rem, "4": 1rem,
    "6": 1.5rem, "8": 2rem, "12": 3rem, "16": 4rem, "20": 5rem,
  ),
  $breakpoint-sizes: ("xs": 0, "sm": 600px, "md": 900px, "lg": 1200px, "xl": 1440px, "2xl": 1600px, "3xl": 1920px),
);

// styles/main.scss — then consume
@use "tokens";
@use "katanakit-css/src/scss/main";
```

Utility maps (`_utilities.scss`) are configured the same way if you
load them directly, e.g. `$sizing-map`, `$spacing-map`, `$radius-map`,
`$shadow-map`, `$z-layers-map`, `$opacity-values`, `$font-weight-values`, etc.

---

## Colors and dark theme

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-vars();
@include v.theme("dark"); // palettes inverted under :root[data-theme="dark"]
```

```html
<html data-theme="dark">
  <body class="bg-neutral-100 text-neutral-500">
    <!-- neutral 100 is now the darkest tone when the dark theme is active -->
  </body>
</html>
```

Functions give you the raw colors at build time: `v.get-color("info", 300)`,
`v.get("success")`, `v.alpha("danger", 500, 0.4)`.

---

## Where to go next

- [API Reference](/reference/api-reference/) — complete list of
  functions, mixins and maps per module.
- [Architecture](/reference/architecture/) — module graph and build flow.
- [Roadmap](/reference/roadmap/) — shipped and planned work.
- [Demo](https://github.com/senseikatana/katanakit-css#run-the-demo-locally) —
  run `yarn dev` and inspect `index.html` + `demo/main.js` for a working
  example of everything above.
