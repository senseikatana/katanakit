# Contributing to KatanaKit

Thank you for considering contributing to `katanakit-js`! This document
describes the architecture, the conventions and the development workflow so you
can jump in quickly. It is the source of truth for how code lands in this
repository.

## The development contract

These rules keep the codebase consistent and maintainable. Please read
[Architecture](https://senseikatana.com/katanakit-js/docs/guides/architecture/) for the full context behind each rule.

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
# Prerequisites: Node.js >= 22.18, bun >= 12
git clone https://github.com/senseikatana/katanakit.git
cd katanakit-js
git checkout dev
bun install
```

Useful scripts:

| Command                 | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `bun run check`         | ESLint + typecheck + tests (gate before build/publish) |
| `bun run fix`           | Same as `check` with ESLint auto-fix                   |
| `bun run build`         | `check` then compile to `dist/`                        |
| `bun run release`       | `build` → version bump → publish to npm                |
| `bun run release:minor` | Same for minor release                                 |
| `bun run release:major` | Same for major release                                 |
| `bun run docs:dev`      | Docs site dev server                                   |
| `bun run docs:build`    | Docs site build                                        |
| `bun run dev`           | Express example server                                 |

`build` and `release` never compile or publish unless `check` passes.

## Directory layout

- `src/types/` — single source of truth for all contracts and domain types.
- `src/core/services/` — pure domain services (no I/O).
- `src/infrastructure/` — adapters that own browser/runtime I/O.
- `src/adapters/` — framework adapters (`astro/`, `express/`, `vue/`, `nuxt/`).
- `src/adapters/notion/` — Notion REST API adapter.
- `src/adapters/wordpress/` — WordPress REST API adapter.
- `src/config/` — `site.config.ts` + `seo.service.ts`.
- `src/prisma/` — Prisma schema and conversation store.
- `src/index.ts` — main barrel (public API surface).
- `tests/` — Vitest unit tests (import from `src/` via the `@/` alias).
- `examples/` — runnable demos for all adapters and frameworks.
- `docs/` — user documentation (keep in sync with code changes).

## Updating documentation

The public documentation site lives at
**[senseikatana.com/katanakit-js](https://senseikatana.com/katanakit-js/)** and
is built with Docusaurus. The source is in `docs/`.

When you change a public API:

- **API Reference is auto-generated** from JSDoc/TSDoc comments in `src/` by
  TypeDoc. Write good doc comments on your exported functions and types — they
  become the public API docs automatically on each build.
- Update the matching entry in the "Services at a glance" table in `README.md`.
- Note user-visible changes in `CHANGELOG.md` under `[Unreleased]`.
- Always use `katanakit-js` in example imports.

### Running the docs locally

```bash
bun run docs:dev    # starts Docusaurus dev server
bun run docs:build  # builds the static site (runs sync + clear first)
```

## Versioning and changelog

This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
and keeps a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)-style
`CHANGELOG.md`. The current version is **3.2.2**. Use the `release` script to
cut a release:

```bash
bun run release        # build (check + compile) + bump patch + publish
bun run release:minor  # same for minor
bun run release:major  # same for major
```

### Version synchronization

Versions must be synchronized across:

1. `package.json` — the source of truth
2. npm registry — published via `npm publish`
3. GitHub tags — created by the release script

To verify synchronization:

```bash
grep '"version"' package.json   # check local
npm view katanakit-js version   # check npm
git tag --sort=-creatordate     # check tags
```

## Pull request checklist

- [ ] Code follows the development contract above.
- [ ] All new public methods use the `use*` prefix (except `getInstance`).
- [ ] Relative imports inside `src/` carry explicit `.js` extensions.
- [ ] New contracts/types were added to `src/types/` (not re-declared).
- [ ] New framework code is reachable via a subpath, not the main barrel.
- [ ] `bun run check` passes (ESLint + typecheck + tests).
- [ ] Tests added/updated for the change.
- [ ] Documentation and `CHANGELOG.md` updated if the public API changed.
- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).
- [ ] Feature merged into `dev` first (`git checkout dev && git merge <branch>`); PRs to `main` come only from `dev`.
- [ ] Pre-commit hook ran clean (Husky + lint-staged autofixes staged files on commit).

## Code of Conduct

Be kind, respectful, and constructive. We're all here to build great software
and learn from each other. Harassment, discrimination, or toxic behavior will
not be tolerated.

## Questions?

- [Open an issue](https://github.com/senseikatana/katanakit/issues) for bugs
- [Start a discussion](https://github.com/senseikatana/katanakit/discussions) for questions
- [Read the docs](https://senseikatana.com/katanakit-js/) for guides and API reference
