# Contributing to KatanaKit CSS

Thank you for considering contributing to `katanakit-css`! This document
describes the architecture, conventions and development workflow so you can
jump in quickly.

Please also read:

- [docs/docs/reference/architecture.mdx](docs/docs/reference/architecture.mdx) — module graph and build flow.
- [docs/docs/reference/api-reference.mdx](docs/docs/reference/api-reference.mdx) — the public API surface.
- [CHANGELOG.md](CHANGELOG.md) — how changes are recorded.

---

## The development contract

These rules keep the codebase consistent. Follow them for any contribution.

1. **Modular layering** — keep SCSS modules separated by responsibility:
   `_variables.scss` (design tokens + colors + theme), `_functions.scss`
   (pure functions), `_mixins.scss` (breakpoints, grid, flex, apply registry,
   core generators), `_reset.scss` (base reset) and `_utilities.scss`
   (utility maps + class generators). Put new capabilities in the module that
   owns that concern.

2. **Modern module syntax only** — use `@use` (always lowercase) and
   `@forward`. Never add new `@import`. Namespace imports explicitly:
   `@use "functions" as f;`. Existing convention for the public namespaces is
   `f`, `v`, `m`, `u`.

3. **Maps are `!default`** — token and utility scales live in Sass maps that
   downstream projects can override with the `with` clause. A new scale means
   a `!default` map plus an accessor function and (when relevant) token
   emission.

4. **Literal kebab-case keys** — utility class names are the literal map keys
   (`.p-05`, `.p-1-5`, `.p-base`, `.w-screen`, `.hidden`). Do not introduce
   bracket conversion or aliasing layers.

5. **Generated classes vs `@apply` registry** — only mixins explicitly emit
   CSS classes. Adding a name to the `@apply` registry does not create a
   class. Keep the registry synchronised with `_utilities.scss` (it already
   iterates those maps); hand-written registrations must stay minimal.

6. **`main.scss` stays component-free** — the public entry never includes
   `components/_index.scss`; components belong to the demo only.

7. **Partials use a leading underscore** — `_name.scss` inside `src/scss/`,
   consumed with a namespace.

---

## Setting up

```bash
git clone git@github.com:senseikatana/katanakit-css.git
cd katanakit-css
pnpm install
```

Recommended: Node.js 20+ and pnpm. Dart Sass is the only
compiler the suite runs against.

---

## Running the tests

```bash
pnpm test
```

This runs the Vitest test runner over `test/**/*.test.ts`
(`vitest run`). The tests compile SCSS **in memory** through the Sass JS API
and assert on the generated CSS:

- `test/core.test.ts` — compiles `src/scss/main.scss` and
  `src/scss/demo.scss`; checks tokens, generated classes and demo components.
- `test/api-smoke.test.ts` — compiles `test/fixtures/api-smoke.scss` and
  asserts on the public API surface (breakpoint aliases, grid placement and
  stacking, dark-theme inversion).
- `test/functions.test.ts` — compiles
  `test/fixtures/functions-regression.scss` and asserts exact function
  outputs.

### When you add a feature

Add a fixture under `test/fixtures/` and assertions to the matching test file
(or a new one). Two project rules for fixtures:

- Fixtures must be **deterministic and read-only**: no network, no git, no
  writes to `src/` or `dist/`.
- A fixture file must **not be named after a partial** (`functions.scss`,
  `variables.scss`, …). Sass resolves `@use` relative to the importing file
  before consulting `loadPaths`, so such a name shadows the real partial and
  triggers a module-loop error.

Code review is manual and follows the conventions above; there is no
automated style gate in the repo scripts.

---

## Building

```bash
pnpm build
```

Runs:

1. `pnpm build:css` — Sass CLI compiles `src/scss/main.scss` into
   `dist/css/globals.min.css` (compressed, no source map). This is the npm
   artifact.
2. `pnpm build:expanded` — Sass CLI compiles `src/scss/main.scss` into
   `dist/css/globals.css` (expanded, for development/debugging).
3. `pnpm build:demo` — Vite builds the demo into `demo-dist/` (PostCSS +
   PurgeCSS).

For local iteration:

```bash
pnpm dev       # Vite dev server on http://localhost:4321 (HMR)
pnpm preview   # preview demo-dist/
```

`dist/css/globals.min.css`, `dist/css/globals.css` and `demo-dist/` are gitignored build outputs.
The npm artifact reaches consumers through the package `files` field
(`dist/css`), so re-run `pnpm build:css` whenever the SCSS output changes.

---

## Documentation

Public API changes must be mirrored in the docs:

- Add/adjust signatures, maps and generated classes in
  `docs/docs/reference/api-reference.mdx` (verify values against the compiled output).
- Update the README feature list, quick start and the "generated vs registry"
  tables when the surface changes.
- Record user-visible changes under `[Unreleased]` in
  `CHANGELOG.md` (Added / Fixed / Changed sections, Keep a Changelog format).

If a doc example contains SCSS, compile it before committing — every example
in the docs is expected to build with the real code.

---

## Pull-request workflow

1. Create a feature branch from `main`:
   `git checkout -b feat/my-change`.
2. Make the change. Keep the diff focused; if a feature touches several
   modules, consider splitting it.
3. Add or update tests and fixtures.
4. Run `pnpm test` and `pnpm build`.
5. Update the CHANGELOG and any affected docs in the same PR.
6. Open the PR against `main`. In the description, explain the change, link
   the issue you address and list which modules/docs/tests were touched.

Suggested commit messages (not enforced, but appreciated):

- `feat: add hover-border-* color utilities`
- `fix: resolve container() for numeric keys`
- `docs: document utils/_maps.scss overrides`
- `test: cover grid-stack with overlapping children`
- `refactor: forward layout utilities from the utils facade`

The maintainer reviews, may request changes, and merges once tests pass and
the documentation is in sync.
