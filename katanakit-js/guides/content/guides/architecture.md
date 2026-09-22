---
title: Architecture
sidebar_position: 2
description: Hexagonal architecture, layer breakdown, design patterns and conventions.
---

KatanaKit follows **hexagonal architecture** (ports and adapters). The goal is a
pure, framework-agnostic core surrounded by adapters that talk to the outside
world (browser APIs, HTTP, frameworks) and a shared kernel of contracts.

```
               src/
               │
   ┌───────────▼───────────┐
   │        index.ts       │   main barrel — the public API surface
   └───────────┬───────────┘
               │
   ┌───────────▼───────────┐
   │        types/         │   shared kernel — contracts, domain types,
   │   (single source of   │   facades interfaces (I*), strategy contracts
   │        truth)         │
   └───────────┬───────────┘
               │  implements / consumes contracts
   ┌───────────▼──────────────────────────────────────┐
   │                   core/services/                 │  pure domain services
   │  logger · http · formatter · converter · error   │  (no I/O: no window,
   │  generator · dates · geometry · timing · utils   │   document, fetch, fs)
   │  reactive                                         │
   └───────────┬──────────────────────────────────────┘
               │  owned I/O lives one layer out
   ┌───────────▼──────────────────────────────────────┐
   │              infrastructure/                      │  browser/runtime adapters
   │  dom · storage · viewport · sensors              │  (guard or fall back in SSR)
   │  observer · worker · theme                        │
   └───────────┬──────────────────────────────────────┘
               │  framework-facing entry points
   ┌───────────▼──────────────────────────────────────┐
   │                  adapters/                       │  framework adapters
   │   astro/  (AstroService, RssService)            │
   │   express/ (ServerExpress reference)            │
   │   nuxt/    (pure Nuxt helpers)                  │
   │   vue/     (useRequest composable)          │
   └──────────────────────────────────────────────────┘
   │
   ├── config/   siteConfig (typed SiteConfig) + SEO helpers (seo.service.ts)
   ├── prisma/   Prisma schema, generated contract types, db client
```

## Layer-by-layer

### `types/` — the shared kernel

`src/types/index.ts` is the single source of truth for every contract and domain
type in the library. It contains the strategy contracts (`StorageStrategy`,
`ICryptoStrategy`, `IUuidStrategy`), the facade interfaces
(`IFetchApiManager`, `IFormatterService`, `IConverterService`, `IErrorFactory`,
`IReactiveService`, `IDomService`, `IThemeService`, `IAstroService`,
`IRssService`, `DatesServiceTypes`, `IDataUtils`, `ISystemUtils`,
`IAppUtils`) and every shared type (`LogLevel`, `Locale`, `Currency`,
`HttpMethod`, `QueryParams`, `FetchResult`, `ApiError`, `RssConfig`,
`ObserverConfig`, `ThemeOptions`, ...).

Services implement these contracts; adapters consume them. Domain rules never
reach for concrete `window`/`fetch` globals directly.

### `core/services/` — the pure layer

Ten service modules with pure logic. This layer never touches `window`,
`document`, `fetch`, the filesystem or any framework, with two pragmatic
exceptions that are clearly documented in code: `http.service.ts` wraps the
global `fetch` (available in Node 18+/Bun/browsers) and `reactive.service.ts`
persists via injected storage functions from `infrastructure`.

| File                   | Exports (public facade)                     |
| ---------------------- | ------------------------------------------- |
| `logger.service.ts`    | `useLogger`, `useLoggerTable`, `useLoggerClear` |
| `http.service.ts`      | `FetchApiManager`                           |
| `formatter.service.ts` | `FormatterService`, `ConverterService`      |
| `error.service.ts`     | `ErrorFactoryService`, `AppError`           |
| `generator.service.ts` | `GeneratorService`, `LazyNodeCryptoStrategy`, `NativeUuidStrategy` |
| `dates.service.ts`     | `DatesService` (Temporal polyfill adapter)  |
| `geometry.service.ts`  | `GeometryUtils` (`area`/`perimeter`/`volume`) |
| `timing.service.ts`    | `TimingService`                             |
| `utils.service.ts`     | `DataUtils`, `SystemUtils`, `AppUtils`      |
| `reactive.service.ts`  | `ReactiveService` (signals kernel)          |

Every service is a Singleton facade (`getInstance()`), exposes arrow-function
methods and re-exports them **destructured** at the bottom of the module
(`export const { useLogger, ... } = LoggerService.getInstance();`), which keeps
`this` bound and lets bundlers tree-shake unused methods.

### `infrastructure/` — the adapter layer

Adapters that own browser/runtime I/O. Each is SSR-safe: it guards or falls back
gracefully when `window`/`document`/`navigator` is absent.

- `dom/` — `DomService` (query, classes, attributes, events, HTML/text setting)
  plus the `DOM_SERVICE` singleton instance.
- `storage/` — `StorageService` over `localStorage`/`sessionStorage` with
  `LocalStorageStrategy`, `SessionStorageStrategy` and an in-memory
  `MemoryStorageStrategy` SSR fallback.
- `viewport/` — `ViewportService` (dimensions, scroll, media queries,
  fullscreen, visibility, title).
- `sensors/` — `SensorsUtils` (camera/microphone, geolocation, motion,
  vibration, battery) exported as the `sensorsUtils` instance.
- `observer/` — `ObserverService` and `LazyLoaderService` wrappers around
  `IntersectionObserver`.
- `worker/` — `WorkerService` (one-shot workers and worker pools with an
  SSR/main-thread fallback).
- `theme/` — `ThemeService` (mode switching over DOM + storage + a
  media-query listener), exported as `THEME_SERVICE`.

`infrastructure/index.ts` re-exports every module and gives stable named exports
to the default-exported classes (`StorageService`, `ViewportService`,
`WorkerService`).

### `adapters/` — the framework layer

- `astro/` — `AstroService` (converts collections into `getStaticPaths`
  payloads, Safe Result style), `RssService` (RSS 2.0 XML generation and
  Astro `GET` endpoints), and SEO re-exports (`useSeoTag`, `useHeadTags`,
  …) for Layout frontmatter. Published as `katanakit-js/adapters/astro`
  (Astro + RSS also available from the main barrel).
- `express/` — a reference Express server (`ServerExpress`), a demo
  `ProductController` and a `router`. Published only as the
  `katanakit-js/adapters/express` subpath so the main bundle never pulls in
  Express. Requires the `express` optional peer dependency.
- `nuxt/` — three **pure exported functions**, not singletons:
  `useUnwrap(result, context?)`, `useSafeResponse(result)` and
  `useEventResponse(event, result)`. They bridge KatanaKit `FetchResult` values
  to Nuxt/Nitro server routes without importing `h3`. Published only as the
  `katanakit-js/adapters/nuxt` subpath.
- `vue/` — `useRequest`, a Vue 3 composable that wraps `useGet` with the
  reactivity system (`data`, `error`, `loading`, `refetch`). It imports `vue`
  directly and is published only as the `katanakit-js/adapters/vue` subpath;
  `vue` is an optional peer dependency.

### `config/` — site configuration and SEO

- `site.config.ts` — the `SiteConfig` interface and a default `siteConfig`
  instance (site URL, title, description, language, author, RSS options, SEO
  toggles and optional nav).
- `seo.service.ts` — pure Nuxt-inspired `useSeoMeta(input, config?)` flat object
  API (`SeoMetaInput` / `SeoMetaFlat`: OG, Twitter, article, robots, canonical,
  …), plus `useApplySeoTag` (Vanilla), legacy `useSeoTag`, and helpers
  `useGenerateMetaTags`, `useTitle`, `useRssHeadLink`, `useHeadTags`. Prefer
  Nuxt's own head APIs inside Nuxt.

Both are re-exported from the main barrel (`import { siteConfig, type
SiteConfig, useSeoMeta } from "katanakit-js"`) and from
`katanakit-js/adapters/astro`.

### `prisma/` — database layer (optional)

- `schema.prisma` — the Prisma schema (`User`, `Post` models,
  Prisma ORM contract-first syntax).
- `schema.json` / `schema.d.ts` — generated contract artifacts
  (**do not edit**; regenerate with `prisma contract emit`).
- `db.ts` — the typed database client built with `@prisma/orm-postgres` from
  the contract and `DATABASE_URL` (read from `dotenv`).
- `prisma.config.ts` (repo root) — Prisma CLI/ORM configuration.

This layer is optional: `@prisma/orm-postgres` is an optional peer dependency
and the client is not exported from the main barrel.

## Package layout and ESM

- **Pure ESM.** `package.json` has `"type": "module"`, `"module":
  "nodenext"` and `"exports"`. Source imports are relative and always carry an
  explicit `.js` extension (e.g. `import { useLogger } from
  "./logger.service.js"`) so the emitted `dist/` resolves identically under
  Node's ESM loader and bundlers.
- **Exports map.**

  | Import specifier                  | What it exposes                               |
  | --------------------------------- | --------------------------------------------- |
  | `katanakit-js`                    | astro (Astro + RSS), config (site + SEO), core, infrastructure, types |
  | `katanakit-js/adapters/astro`     | `AstroService`, `RssService`, SEO re-exports (`useSeoTag`, …) |
  | `katanakit-js/adapters/express`   | Express reference adapter                     |
  | `katanakit-js/adapters/nuxt`      | Nuxt helpers                                  |
  | `katanakit-js/adapters/vue`       | Vue 3 composable                              |

- **`@/` alias** maps to `src/` in `tsconfig.json` and `vitest.config.ts`. It is
  used by the test suite and the examples, not by library source files.
- **No side effects on import.** Barrel files only re-export; strategy
  instantiation happens lazily inside services. `db.ts` is the only module that
  reads the environment, and it is never part of the public barrel.

## Design patterns in use

| Pattern    | Where                                                              |
| ---------- | ------------------------------------------------------------------ |
| Singleton  | every service (`FetchApiManager`, `LoggerService`, ...)            |
| Facade     | `FetchApiManager`, `DomService`, `AstroService`, `RssService`, `AppUtils` |
| Strategy   | logger output, storage backends, generator crypto/UUID, worker     |
| Factory    | `ErrorFactoryService`; debounce/throttle/timeout factories in `TimingService` |
| Observer   | `ReactiveService` signals, `ObserverService`, theme media query    |
| Decorator  | `ConverterService` decorating `FormatterService`                   |
| Adapter    | `DatesService` (Temporal), infrastructure layer, framework adapters |

## Conventions

- **`use*` methods** — every public method (except `getInstance()`) uses the
  `use` prefix, mirroring React hooks. This makes the API consistent and
  predictable.
- **Destructured exports** — services expose their methods as arrow-function
  class fields and re-export them destructured (`useLogger`, `useGetStorage`,
  `useFetch`, ...) for `this`-safe calls and tree-shaking. `ObserverService`,
  `LazyLoaderService`, `SensorsUtils` and `WorkerService` are exceptions that
  you call through an instance (`ObserverService.getInstance()` or the exported
  `sensorsUtils`).
- **Safe Result** — fallible operations return a discriminated union
  `{ data, error, ok }` instead of throwing: `FetchResult<T>`,
  `AstroServiceResult<T>`, `RssResult`.
- **Single source of truth** — all contracts and shared types live in
  `src/types/`.
- **English only** — comments, identifiers and messages are written in English.

## Development tooling

- `bun run check` — ESLint + Prettier + typecheck + tests (gate before build/publish).
- `bun run fix` — same as `check` with ESLint + Prettier auto-fix.
- `bun run build` — `check` then `tsc` → `dist/`.
- `bun run release -- <patch|minor|major>` — `build` → version bump → publish.
- `bun run docs -- <dev|build|serve>` — docs site (`build` runs `check` + clear first).
- `bun run dev` — the bundled Express example server.

See [CONTRIBUTING.md](https://github.com/senseikatana/katanakit/blob/dev/CONTRIBUTING.md) for the full development contract.
