# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **CSS dev build** — `yarn build:css:dev` generates `dist/css/katanakit.dev.css`
  (expanded, 11351 lines) for development in VSCode alongside the compressed
  production build (`katanakit.css`, 119KB).

## [0.2.0] - 2026-09-05

### Added

- **Aspect ratio utilities** — `.aspect-square`, `.aspect-video`, `.aspect-auto`
  (from `$aspect-ratio-map`).
- **Object fit/position utilities** — `.object-contain/cover/fill/none/scale-down`
  and `.object-center/top/right/bottom/left/...` (9 positions).
- **Cursor utilities** — 22 cursor values: `.cursor-pointer`, `.cursor-grab`,
  `.cursor-not-allowed`, `.cursor-wait`, `.cursor-text`, etc.
- **Visibility utilities** — `.visible`, `.invisible`, `.collapse`.
- **Text transform** — `.uppercase`, `.lowercase`, `.capitalize`, `.normal-case`.
- **Text decoration** — `.underline`, `.overline`, `.line-through`, `.no-underline`.
- **Text overflow** — `.truncate` (ellipsis + overflow hidden), `.text-ellipsis`,
  `.text-clip`.
- **Line height** — `.leading-none` (1), `.leading-tight` (1.25), `.leading-snug`
  (1.375), `.leading-normal` (1.5), `.leading-relaxed` (1.625), `.leading-loose` (2).
- **Letter spacing** — `.tracking-tighter` (-0.05em) through `.tracking-widest` (0.1em).
- **Font family** — `.font-sans`, `.font-serif`, `.font-mono` with system font stacks.
- **Extended font size** — `.text-5xl` (3rem), `.text-6xl` (3.75rem), `.text-7xl`
  (4.5rem), `.text-8xl` (6rem), `.text-9xl` (8rem).
- **List style** — `.list-none/disc/decimal`, `.list-inside/outside`.
- **Interactivity** — `.pointer-events-none/auto`, `.resize-none/both/x/y`,
  `.select-none/text/all/auto`, `.scroll-auto/smooth`, `.appearance-none/auto`.
- **Border style** — `.border-solid/dashed/dotted/double/hidden/none`.
- **Float/clear** — `.float-left/right/none/start/end`, `.clear-left/right/both/start/end/none`.
- **Isolation** — `.isolate`, `.isolation-auto`.
- **Box sizing** — `.box-border`, `.box-content`.
- **Table utilities** — `.table-auto/fixed`, `.border-collapse/separate`.
- **Grid CSS classes** — `.grid-cols-1` … `.grid-cols-12`, `.grid-cols-none`,
  `.col-span-1` … `.col-span-12`, `.col-span-full`, `.row-span-1` … `.row-span-6`,
  `.row-span-full`, `.grid-flow-row/col/dense/row-dense/col-dense`.
- **Flex CSS classes** — `.flex-1/auto/initial/none`, `.grow/.grow-0`, `.shrink/.shrink-0`,
  `.order-first/last/none/1` … `.order-12`.
- **Container** — `.container` (width 100%, max-width 80rem, centered).
- **Position utilities** — `.top-*/right-*/bottom-*/left-*` (0, 1-12, auto, full, px),
  `.inset-0/auto/full/px`, `.inset-x-0/auto`, `.inset-y-0/auto`.
- **Overflow directional** — `.overflow-x-auto/hidden/clip/visible/scroll`,
  `.overflow-y-auto/hidden/clip/visible/scroll`.
- **Extended sizing** — viewport units `.w-svw/dvw/lvw/dvh/svh/lvh`,
  fractions `.w-1-2/1-3/2-3/1-4/2-4/3-4`.
- **20 new color palettes** (11 tones each: 50, 100-900, 950): slate, gray,
  zinc, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan,
  sky, blue, indigo, violet, pink, rose, fuchsia. Total: 220 new color values.
- **Extended original palettes** — neutral, purple, info, warning, danger, success
  now have 11 tones (50, 100-900, 950) instead of 7.
- **Dark mode 11-tone inversion** — `theme("dark")` inverts all 11 shades
  (50↔950, 100↔900, 200↔800, 300↔700, 400↔600, 500↔500) with fallback
  for palettes that don't have all tones.
- **Docusaurus documentation site** — `docs/` with 15+ pages covering all
  utilities, mixins, functions and architecture. Deployed to GitHub Pages.
- **Expanded CSS artifact** — `katanakit.dev.css` (expanded, ~11K lines) for
  development alongside the compressed `katanakit.css`.

### Changed

- **CSS output grew from ~42KB to ~119KB** (compressed) with ~2650 unique classes.
- **`$shades` expanded** from `(100-700)` to `(50, 100-900, 950)` for
  Tailwind-compatible 11-tone scales.
- **`generate-all-utilities()`** now emits 18 generators instead of 4.
- **`$sizing-map` extended** with viewport units and fraction values.
- **`$font-size-map` extended** with 5xl-9xl.

## [0.4.3] - 2026-09-05

### Added

- **Lotus theme migration** — migrated documentation from Starlight to
  `@prosefly/astro-theme-lotus` (Astro 7 + Tailwind v4) for improved
  design and functionality.
- **DOCX export script** — added script to export documentation to DOCX
  format with updated table of contents.
- **GitHub Pages deployment** — automated deployment to gh-pages branch
  for GitHub Pages hosting at `https://senseikatana.github.io/katanakit-css/`.

### Changed

- **Dependencies** — updated to Astro 7, Tailwind CSS v4, and latest
  versions of all dependencies.
- **Build configuration** — optimized build process with separate output
  directory to avoid permission conflicts.

### Fixed

- **CI configuration** — removed old Starlight `astro.config.mjs` that
  was causing CI errors during deployment.
- **Starlight components** — removed remaining Starlight components that
  were incompatible with the new Lotus theme.

### Removed

- **Starlight theme** — completely removed Starlight theme and all
  related components in favor of Lotus theme.

## [0.1.0] - Unreleased

Initial release of `katanakit-css` — a lightweight, modular SCSS
mini-framework: design tokens, utility classes and layout mixins (grid, flex,
breakpoints) with an `@apply`-style system. Zero runtime overhead.

### Added

- **Modular SCSS architecture** — modern `@use`/`@forward` partials with
  explicit namespaces and a component-free public entry
  (`src/scss/main.scss`). Partial modules: `functions`, `variables`, `reset`,
  `breakpoints`, `theme`, `colors`, `grid`, `flex`, `apply`; utility engine
  under `partials/utils/` (`index`, `core`, `maps`, `spacing`, `sizing`,
  `flex`, `effects`, `layout`); example components under `components/`.
- **Design-token system** — `!default` maps for font families, shadows,
  containers, breakpoints, spacing, radius, z-index layers, transition
  durations and easings. `generate-css-tokens()` emits them as CSS custom
  properties in `:root` (`--font-*`, `--shadow-*`, `--container-*`,
  `--spacing-*`, `--radius-*`, `--z-*`, `--duration-*`, `--ease-*`), each
  family independently toggleable.
- **Color system** — six semantic palettes (`neutral`, `purple`, `info`,
  `warning`, `danger`, `success`) with **seven tones each** (100–700) plus
  four special colors (`white`, `black`, `transparent`, `current`). Accessor
  functions (`get-color`, `get`, `alpha`), `generate-css-vars()`, utility
  mixins (`text`, `bg`, `border`, `hover`, `all`) and `theme()` dark-mode
  inversion.
- **Modern CSS reset** — box-sizing, margin/padding zeroing and media
  defaults, all exposed as overrideable custom properties.
- **Responsive breakpoints** — mobile-first system with seven tiers
  (`xs` … `3xl`), a generic `breakpoint()`/`bp()` mixin supporting `up`,
  `down`, `only` and `between`, named `up`/`down` aliases
  (`xs` … `xxxl`, `xs-down` … `x3l-down`, with canonical `xxl-down` and
  `xxxl-down`) and feature queries (portrait, landscape, reduced-motion,
  hoverable, touch, dark-mode, light-mode).
- **CSS Grid mixins** — `grid-responsive` (auto-fill/fit),
  `grid-autofill`, `grid-autofit`, `grid-fixed-columns`,
  `grid-breakpoint-columns`, `grid-container`, `grid-center`, `grid-gap`,
  `grid-areas`/`grid-area`, `grid-span`, `grid-placement`,
  `grid-item-center`, `grid-item-full`, `subgrid`, `grid-masonry`
  (experimental), `grid-stack` and `grid-stack-item`.
- **Flexbox mixins** — `flex-container`, `flex-center`, `flex-gap`,
  `flex-grow`, `flex-shrink`, `flex-basis`, `flex-item`, `flex-item-center`,
  `flex-item-full`.
- **Pure functions** — `rem()`, `px()`, `to-unit()`, `strip-unit()`,
  `fluid()` (returns `clamp()`), `tint()`, `shade()`, `saturate-color()`,
  `desaturate-color()`, `complement()`, `contrast()`, `color-mix-var()`,
  `to-class()`.
- **Utility engine** — map-driven generators for sizing (`w`/`h`/min/max),
  flexbox, effects (shadows, radius, z-index, durations, easings, opacity)
  and layout (display, position, overflow, text alignment, font weights,
  white space, wrapping). Padding classes (`.p-*`) plus `.gap`, `.shadow`
  and `.rounded` are emitted automatically when the module loads;
  `generate-all-utilities()` exposes the opt-in generators.
- **`@apply`-style system** — `register-utility()` and `apply()` mixins with
  an automatic registry derived from the same `utils/_maps.scss` maps that
  drive the class generators.
- **Theme hook** — `theme()` delegates to the color system and emits inverted
  palettes under `:root[data-theme="dark"]`, with optional overrides.
- **Example components** — `components/_index.scss` demonstrates the `apply`
  system (`.card`, `.button`, responsive containers/hero) and is only pulled
  in by the demo entry.
- **Vite demo** — `index.html` + `demo/main.js` import `src/scss/demo.scss`
  with hot reload (port 4321); production build outputs to `demo-dist/` with
  PostCSS autoprefixer and PurgeCSS (custom properties preserved).
- **npm artifact** — `yarn build:css` compiles `src/scss/main.scss` to
  `dist/css/katanakit.css` (compressed, no source map), referenced by the
  package `style` field.
- **Test suite** — deterministic in-memory compilation tests
  (`node --test`) covering the public entries, the API surface and function
  regression fixtures (26 tests).
- **English documentation** — README (root), Getting Started, API Reference,
  Architecture, Roadmap, CONTRIBUTING, SECURITY and this changelog.

### Changed

- **Restructured SCSS architecture from 21 files to 8** (Tailwind-like:
  base/components/utils pattern). Merged `_colors` into `_variables`, merged
  `_breakpoints`/`_grid`/`_flex`/`_apply`/`_theme`/`_core` into `_mixins`,
  merged `_maps`/`_spacing`/`_sizing`/`_flex`/`_effects`/`_layout`/`_index`
  into `_utilities`. Simplified load paths from `src/scss/partials` to
  `src/scss`.

### Fixed

Corrections applied during the development of `0.1.0` so the public API
matches what the code actually generates:

- **Neutral palette** — reworked as a true gray scale (saturation 0%).
- **Breakpoints `2xl`/`3xl`** — restored the two high tiers and their named
  mixins (`xxl`, `xxxl`, `x2l-down`, `x3l-down`, and the canonical
  `xxl-down`/`xxxl-down` aliases) in both the map and the emitted media
  queries.
- **Grid placement** — the item-placement API is provided by
  `grid-placement`, `grid-item-full` and the `grid-stack`/`grid-stack-item`
  pair; no other placement mixin names exist in the code.
- **`rem()` base** — unit-safe conversion on a **16px** base; both
  `rem(16px)` and `rem(16)` return `1rem`, and `px(1)` returns `16px`.
- **`fluid()`** — corrected interpolation so it returns a proper `clamp()`
  expression (e.g. `fluid(16px, 24px)` →
  `clamp(16px, 0.5vw + 14.4px, 24px)`).
- **Dark theme** — inverts all **seven** tones of every palette
  (100 ↔ 700, 200 ↔ 600, 300 ↔ 500) under `:root[data-theme="dark"]`.
- **`.hidden`** — emits `display: none` via the `$display-values` map.
- **`.w-screen`** — emits `width: 100vw` from the `$sizing-map`.
- **Font weights** — utility and registry values now use the correct numeric
  weights (`thin` 100 … `black` 900), including `extralight` 200.
- **`to-unit()`** — restricted to the units `rem`, `px`, `em` and `%`, with a
  compile-time error for anything else; values that already carry a unit pass
  through unchanged.
- **`@apply` registry** — rewired to iterate `utils/_maps.scss` so the
  registered names stay synchronised with the generated classes (single
  source of truth).
- **Reset** — cleaned up so it only emits the documented reset defaults; no
  leftover identity palette tones are wired into it.
