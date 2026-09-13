# Contributing to KatanaKit

Thank you for considering contributing to `katanakit-js`! This document
describes the architecture, the conventions and the development workflow so you
can jump in quickly. It is the source of truth for how code lands in this
repository.

## The development contract

These rules keep the codebase consistent and maintainable. Please read
[Architecture](docs/Architecture.md) for the full context behind each rule.

1. **Hexagonal layering** — keep the pure `core` layer (`src/core/services/`)
   free of browser/runtime I/O. Adapters that own I/O live in
   `src/infrastructure/` (DOM, storage, viewport, sensors, observer, worker,
   theme). Framework-facing adapters live in `src/adapters/` (`astro/`,
   `express/`, `nuxt/`), site config/SEO in `src/config/`. Put new capabilities
   in the layer that matches their responsibility.
2. **Design patterns** — services are Singleton facades and use
   Strategy/Observer/Factory/Facade/Adapter where it makes sense. Preserve the
   pattern when extending a service. `adapters/nuxt` is the one deliberate
   exception: it exports pure functions, not a singleton.
3. **`use*` convention** — every public method (except `getInstance()`) uses the
   `use` prefix (like React hooks), e.g. `useInit`, `useFetch`, `useLogger`,
   `useCreateSignal`. This makes the API consistent and predictable.
4. **Pure ESM with `.js` extensions** — the package is `"type": "module"` and
   compiles with `module: nodenext`. All relative imports **must** use an
   explicit `.js` extension (e.g. `import { useLogger } from
   "./logger.service.js"`). Do not import without the extension and do not add
   new `@/`-aliased imports inside `src/`; the `@/` alias exists for the test
   suite and examples only.
5. **Destructured exports** — services expose their methods as arrow-function
   class fields and re-export them destructured at the bottom of the module
   (`export const { useLogger, ... } = LoggerService.getInstance();`) so consumers
   can tree-shake and call them without binding `this`. For modules whose
   consumers are expected to hold an instance (`ObserverService`,
   `SensorsUtils`, `WorkerService`), exporting the singleton instance or a
   stable `getInstance()` is acceptable — document the choice.
6. **Single source of truth for types** — every contract and shared domain type
   lives in `src/types/index.ts`. Services reference these interfaces (`I*`,
   `LogStrategy`, `StorageStrategy`, ...) instead of re-declaring shapes.
7. **Framework adapters as subpaths** — anything that imports a framework
   (`express`, `h3`/Nuxt, `vue`/`astro`) must not be re-exported from the main
   barrel `src/index.ts`. Expose it through the `exports` map in
   `package.json` (`katanakit-js/adapters/express`, `katanakit-js/adapters/nuxt`)
   so library consumers never pull those dependencies.
8. **Optional peer dependencies** — keep heavy/framework dependencies out of
   `dependencies`. Only add a runtime dependency when every consumer needs it.
   New optional integrations go to `peerDependencies` +
   `peerDependenciesMeta.optional` and are installed by developers/devDeps here.
9. **English only** — comments, identifiers, error messages and documentation
   are written in English.
10. **No side effects on import** — importing any public module must never
    trigger network calls, timers, storage writes or DOM mutations. Strategy
    objects and I/O are created lazily inside methods.
11. **SSR safety** — browser-only adapters must guard or fall back gracefully
    when `window`/`document`/`navigator` is unavailable (Node/Bun SSR).
12. **Safe Result for fallible async operations** — prefer returning a
    discriminated union `{ data, error, ok }` over throwing.
13. **Tests** — add or update a Vitest test under `tests/` for every new feature
    or bug fix, and keep the `@/` alias imports there.

## Getting started

```bash
# Prerequisites: Node.js >= 22.18 or Bun >= 1.0
git clone https://github.com/senseikatana/katanakit.git
cd katanakit
git checkout dev
bun install
```

Useful scripts:

| Command | Description |
| ------- | ----------- |
| `pnpm check` | ESLint + Prettier + typecheck + tests (gate before build/publish) |
| `pnpm fix` | Same as `check` with ESLint + Prettier auto-fix |
| `pnpm build` | `check` then compile to `dist/` |
| `pnpm release -- <patch\|minor\|major>` | `build` → version bump → publish |
| `pnpm docs -- <dev\|build\|serve>` | Docs site (`build` runs `check` + clear first) |
| `pnpm dev` | Express example server |

`build` and `release` never compile or publish unless `check` passes.

## Directory layout

- `src/types/` — single source of truth for all contracts and domain types.
- `src/core/services/` — pure domain services (no I/O).
- `src/infrastructure/` — adapters that own browser/runtime I/O.
- `src/adapters/` — framework adapters (`astro/`, `express/`, `nuxt/`).
- `src/config/` — `site.config.ts` + `seo.service.ts`.
- `src/index.ts` — main barrel (public API surface).
- `tests/` — Vitest unit tests (import from `src/` via the `@/` alias).
- `examples/` — runnable demos.
- `docs/` — user documentation (keep in sync with code changes).

## Updating documentation

The public documentation site lives at **[senseikatana.github.io/katanakit-js](https://senseikatana.github.io/katanakit-js)** and is built with [Astro Starlight](https://starlight.astro.build/). The source is in `docs-site/`.

When you change a public API:

- **API Reference is auto-generated** from JSDoc/TSDoc comments in `src/` by `starlight-typedoc`. Write good doc comments on your exported functions and types — they become the public API docs automatically on each build.
- Update the matching entry in the "Services at a glance" table in `README.md`.
- Reflect structural changes in `docs-site/src/content/docs/guides/architecture.md`.
- Note user-visible changes in `CHANGELOG.md` under `[Unreleased]`.
- Always use `katanakit-js` in example imports.

### Running the docs locally

```bash
pnpm docs -- dev    # starts Docusaurus dev server
pnpm docs -- build  # builds the static site (runs check + clear first)
pnpm docs -- serve  # serves the built site locally
```

### How versioning works

- On every push to `dev`, the docs site is rebuilt and deployed to GitHub Pages.
- On every release (tag), `.github/scripts/archive-docs-version.sh` snapshots the current docs into a versioned directory. The `starlight-versions` plugin provides a version selector dropdown in the header.
- The API Reference is regenerated from source on every build — no manual maintenance needed.

## Versioning and changelog

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
and keeps a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)-style
`CHANGELOG.md`. The current development version is **2.2.1** (unreleased). Use
the `release` script to cut a release:

```bash
pnpm release -- patch   # build (check + compile) + bump patch + publish
pnpm release -- minor   # same for minor
pnpm release -- major   # same for major
```

The release workflow on GitHub Actions creates a tag and GitHub release on every
push to `dev`. The docs site is automatically rebuilt and the current version is
archived for the version selector.

## Pull request checklist

- [ ] Code follows the development contract above.
- [ ] All new public methods use the `use*` prefix (except `getInstance`).
- [ ] Relative imports inside `src/` carry explicit `.js` extensions.
- [ ] New contracts/types were added to `src/types/` (not re-declared).
- [ ] New framework code is reachable via a subpath, not the main barrel.
- [ ] `bun run typecheck` passes with no errors.
- [ ] `bun run check` passes (ESLint + Prettier lint + format).
- [ ] `bun run test` passes.
- [ ] Tests added/updated for the change.
- [ ] Documentation and `CHANGELOG.md` updated if the public API changed.
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).
- [ ] Feature merged into `dev` first (`git checkout dev && git merge <branch>`); PRs to `main` come only from `dev`.
- [ ] Pre-commit hook ran clean (Husky + lint-staged autofixes staged files on commit).
