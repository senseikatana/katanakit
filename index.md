# KatanaKIT CSS

A lightweight, modular SCSS mini-framework — design tokens, utility classes and layout mixins with zero runtime overhead.

## Why KatanaKIT CSS

KatanaKIT CSS is a **pure SCSS** framework inspired by the utility-first
approach of Tailwind CSS, but without a build pipeline you don't control.
Everything is generated at compile time from `!default` design-token maps:

- **Design tokens** — fonts, spacing, radius, shadows, z-layers, durations
  and easings as SCSS maps, emitted as CSS custom properties.
- **Color system** — 6 palettes × 7 shades + special colors, with utility
  classes, hover variants and an automatic dark theme.
- **Layout mixins** — breakpoints (7 tiers, mobile-first), a full CSS Grid
  toolkit and flexbox helpers.
- **Utility classes** — spacing with directional padding and margin
  (`.p-*`, `.px-*`, `.py-*`, `.pt-*` … `.m-*`, `.mx-*`, `.my-*` …),
  `gap-*`/`gap-x-*`/`gap-y-*`, text sizes (`.text-xs` … `.text-4xl`) and
  border widths (`.border`, `.border-0`/`2`/`4`/`8`), plus sizing, flex,
  effects, typography and layout generated from `!default` maps.
- **Extended preflight** — a Tailwind-style reset that normalises
  typography, lists, links, forms and media on top of token-driven defaults.
- **`@apply`-style composition** — a tiny registry system so you can
  compose utilities inside your components.

## Quick install

```bash
npm install katanakit-css
```

```scss
// Full stylesheet (reset + tokens + utilities)
@use "katanakit-css/src/scss/main";

// Or compose your own from modules
@use "katanakit-css/src/scss/functions" as f;
@use "katanakit-css/src/scss/variables" as v;
@use "katanakit-css/src/scss/mixins" as m;
```

See [Getting Started](/getting-started/) for the full guide and
the [API Reference](/reference/api-reference/) for every function, mixin
and map.

## Playground

The repository ships with a Vite demo (`yarn dev` → http://localhost:4321)
with a **version switcher** button: it toggles between the live SCSS (HMR)
and published framework builds compiled by `yarn build:versions` into
`public/versions/`.
