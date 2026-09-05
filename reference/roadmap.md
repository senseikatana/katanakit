# Roadmap

What is shipped and what is planned.

# Roadmap

A living list of where `katanakit-css` (SCSS mini-framework) is heading.
Contributions are welcome — pick an item, discuss it in an issue and open a
pull request.

Legend: `[x]` done · `[ ]` planned (no commitment to an order).

---

## Current status

The framework is at **0.1.0 (unreleased)**. The shipped scope is documented in
[CHANGELOG.md](https://github.com/senseikatana/blob/main/CHANGELOG.md); the API in the
[API Reference](/reference/api-reference/).

## Shipped for 0.1.0

- [x] Modular SCSS architecture with modern `@use`/`@forward` partials and a
      component-free public entry (`src/scss/main.scss`).
- [x] Design-token system — `!default` maps for fonts, shadows, containers,
      breakpoints, spacing, radius, z-index, transition durations and easings,
      emitted as CSS custom properties (`--font-*`, `--shadow-*`, `--spacing-*`,
      `--radius-*`, `--z-*`, `--duration-*`, `--ease-*`, …).
- [x] Color system — six semantic palettes (`neutral`, `purple`, `info`,
      `warning`, `danger`, `success`) with **7 tones each** (100–700) plus four
      special colors; CSS variables, utility classes (`text`/`bg`/`border`/
      hover) and dark-theme inversion via `:root[data-theme="dark"]`.
- [x] Responsive breakpoints — 7 tiers (`xs` … `3xl`), generic
      `breakpoint()`/`bp()` with `up`/`down`/`only`/`between`, named `up` and
      `down` aliases (`xxl`/`xxxl`, `xxl-down`/`xxxl-down`) and feature
      queries.
- [x] CSS Grid mixins — responsive auto-fill/fit, fixed columns,
      per-breakpoint columns, containers, areas, placement, stacking,
      item helpers, subgrid and (experimental) masonry.
- [x] Flexbox mixins — container, centering, gap and item helpers.
- [x] Pure functions — `rem()`, `px()`, `to-unit()`, `strip-unit()`,
      `fluid()` → `clamp()`, `tint()`, `shade()`, `saturate-color()`,
      `desaturate-color()`, `complement()`, `contrast()`, `color-mix-var()`,
      `to-class()`.
- [x] Utility engine driven by `_utilities.scss` maps — padding and margin
      classes in every direction (`.p-*`, `.px-*`, `.py-*`, `.pt-*`, `.m-*`,
      `.mx-*`, `.my-*`, …), `gap-*`/`gap-x-*`/`gap-y-*`, text sizes
      (`.text-xs` … `.text-4xl`) and border widths (`.border`,
      `.border-0/2/4/8`) active by default; sizing/flex/effects/layout
      generators opt-in.
- [x] `@apply`-style registry (`register-utility` + `apply`) kept in sync with
      the utility maps.
- [x] Extended Tailwind-style preflight reset whose defaults are overrideable
      custom properties.
- [x] Vite demo (`index.html` + `demo/main.js`) with HMR, a **version
      switcher** (`demo/version-switcher.js`, `yarn build:versions` →
      `public/versions/`) and a PurgeCSS production build into `demo-dist/`.
- [x] Example components built on `@apply` (`components/_index.scss`).
- [x] Test suite (vitest, 26 tests over fixtures) and full English
      documentation (README + `docs/` + CONTRIBUTING/SECURITY/CHANGELOG), plus
      the Astro + Starlight documentation site under `site/`.

## Planned

### Utilities as real classes

- [ ] Extract directional `gap`/`margin`/`padding` class generation into a
      dedicated loop so future scales can add keys without touching the
      auto-emit block.

### Token architecture

- [ ] **Unify the two spacing scales**: `$spacing-scale` (token variables and
      the `@apply` registry) and `$spacing-map` (utility classes) currently
      hold different key sets. Unifying them would make `--spacing-*`
      variables, `.p-*` classes and `apply()` names one source of truth.
- [ ] Configurable prefix for the generated CSS custom properties (an optional
      `$prefix` on `generate-css-tokens()`/`generate-css-vars()`).
- [ ] Evaluate a third scale tier (`3xl`/`4xl` sizes) and named opacity/weight
      aliases.

### Colors

- [ ] Extend the palette system beyond 7 shades (e.g. 50 and 800/900 tones)
      without breaking existing 100–700 consumers.
- [ ] Hover variants for `border-*` (`hover-border-*`), mirroring
      `hover-text-*`/`hover-bg-*`.
- [ ] Documentation for the personal brand palette (`colors-palette.md`) as a
      start-point theme, still kept separate from the framework palettes.

### Components & extras

- [ ] Ship an opt-in `components` module on npm (only the mixins/registry it
      needs), keeping the public sheet component-free.
- [ ] Container/`max-w` helper mixins layered on the `--container-*` tokens.

### DX & tooling

- [ ] Continuous integration with GitHub Actions (test on multiple Dart Sass
      versions, build both artifacts, cache Yarn).
- [ ] Document the sibling TypeScript library `katanakit-js` next to this repo
      so the two projects are clearly distinguished.

---

## Contributing to the roadmap

If you want to tackle a planned item, open an issue first so the approach is
agreed (some items touch breaking API decisions). See
[CONTRIBUTING.md](https://github.com/senseikatana/blob/main/CONTRIBUTING.md) for the development workflow.
