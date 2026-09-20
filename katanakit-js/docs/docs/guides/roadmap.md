---
title: Roadmap
sidebar_position: 3
description: What is planned for KatanaKit. Contributions welcome.
---

A living list of what is planned for KatanaKit (`katanakit-js`). Contributions
are welcome — pick something and open a pull request.

Legend: `[x]` done · `[ ]` planned.

## Shipped (as of 2.2.1)

### Architecture and packaging

- [x] Hexagonal reorganization into `types/`, `core/services/`,
      `infrastructure/`, `adapters/`, `config/`.
- [x] Pure ESM: relative imports with explicit `.js` extensions,
      `module: nodenext`, `"type": "module"` and an `exports` map with subpaths
      (`katanakit-js/adapters/express`, `katanakit-js/adapters/nuxt`).
- [x] `use*` method convention across every service (only `getInstance()` is
      exempt).
- [x] Destructured, tree-shakeable exports from Singleton facades.
- [x] Single source of truth for contracts and domain types in `src/types/`.
- [x] No side effects on import; SSR-safe infrastructure adapters.
- [x] Removed TypeScript errors, import-time side effects and duplicate types.
- [x] Dependency restructure: only `@js-temporal/polyfill` as a runtime
      dependency; `express`, `cors`, `dotenv` and `vue` as
      optional peer dependencies.
- [x] Package renamed for publication as `katanakit-js` (previously developed
      as `katanakit-dev`).

### Services and adapters

- [x] Core services: HTTP client, logger, formatter, converter, errors,
      generator, dates (Temporal), geometry, timing, data/system utilities and
      the reactive signals kernel.
- [x] Infrastructure adapters: DOM, storage, viewport, sensors, observer
      (+ lazy loader), worker (+ pools) and theme.
- [x] Astro adapter (`AstroService`) for `getStaticPaths`.
- [x] RSS service (`RssService`) with raw XML generation and Astro `GET`
      endpoints — no external dependencies.
- [x] Site config (`SiteConfig`/`siteConfig`) and SEO module
      (`useHeadTags`, `useGenerateMetaTags`, `useTitle`, `useRssHeadLink`).
- [x] Nuxt adapter (`katanakit-js/adapters/nuxt`): `useUnwrap`,
      `useSafeResponse`, `useEventResponse`.
- [x] Vue adapter (`katanakit-js/adapters/vue`): `useRequest` composable
      (`data`, `error`, `loading`, `refetch`).
- [x] Express reference server (`katanakit-js/adapters/express`) with CORS
      restriction defaults and hardened headers.
- [x] Worker pool concurrency fixed by correlating tasks with a `taskId` echo.
- [x] `useEncrypt` generates a random salt when none is provided.

### Quality and tooling

- [x] Vitest suite: 60 tests across 8 files (http, logger, storage, core, rss,
      nuxt, seo, vue) with the `@/` alias.
- [x] ESLint + Prettier lint + format wired (`lint`, `check`, `format` scripts).
- [x] `release:patch|minor|major|beta` scripts with a `validate` gate
      (check + test + build).
- [x] English documentation: README, Getting Started, Architecture, API
      Reference, Roadmap, CONTRIBUTING, SECURITY, CHANGELOG.
- [x] Security fixes applied: URL scheme validation, DOM `on*` attribute block,
      JSON-LD `</script>` escaping, worker cleanup, generic server errors.

## Next

- [ ] **Publish `katanakit-js` 2.2.1 to npm** (the package is renamed and
      versioned but not yet released).
- [ ] HTTP client: request interceptors, retry with backoff, request
      cancellation (`AbortSignal`) and a caching layer (stale-while-revalidate).
- [ ] Reactive: automatic dependency tracking for
      `useCreateEffect`/`useCreateMemo`.
- [ ] More framework adapters: React hooks (`useApi`, `useSignal`) and Svelte
      stores.
- [ ] Structured/JSON logger strategy.
- [ ] Add Vitest coverage reporting and a CI pipeline (GitHub Actions) running
      `check`, `test` and `build` on the `dev` branch.

## Later

- [ ] UI kit (Katana UI) — tokens, headless primitives, layouts and app pages.
      See the [UI Kit section](../ui-kit/index.md).
- [ ] Deno / Cloudflare Workers compatibility pass.
- [ ] More geometry (3D solids) and unit-system conversions.
- [ ] i18n and relative-time output for `DatesService.useDiff`.
- [ ] E2E tests for the Express adapter.
- [ ] AbortController support in `useInterval`/timeout helpers.
