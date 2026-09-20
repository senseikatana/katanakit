# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [4.0.0] - 2026-09-20

### Added

- **Framework adapters for React, Solid, Svelte and Angular** — new optional subpaths (`katanakit-js/adapters/react`, `katanakit-js/adapters/solid`, `katanakit-js/adapters/svelte`, `katanakit-js/adapters/angular`) exposing `useQuery`, `useMutation`, `useRequest`, and `useWatch` over the core `QueryClient` and HTTP layer, each with the framework's native reactivity: React hooks (`useState`/`useEffect`), Solid signals, Svelte readable stores, and Angular signals (injection-context aware via `DestroyRef`). All adapters share the global query cache, so data is shared across frameworks.
- **`useRequest` renamed from `useKatanaFetch`** — the Vue reactive-fetch composable is now `useRequest` for brevity and consistency across adapters. `useKatanaFetch` remains as a deprecated alias.
- **Interactive playground** — Vue 3 + Vite dev environment (`playground/`) for testing library features in-browser. Run with `pnpm playground:dev`. Includes demos for `useRequest`, `useQuery`, `useWatch`, and `useBuildUrl` with real API calls (PokeAPI, JSONPlaceholder).
- **Notion REST API adapter** (`katanakit-js/adapters/notion`) — typed client for the Notion API with `useInitNotion` for token registration. Covers Pages (get, create, update, archive), Blocks (get, get children, append, update, delete), Databases (get schema, query, create, update), Users (get, list), and Search. Includes auto-pagination helpers: `useNotionListAllBlockChildren` and `useNotionListAllDatabasePages` that handle cursor-based pagination automatically. All functions return `FetchResult<T>` (safe result pattern).
- **WordPress REST API adapter** (`katanakit-js/adapters/wordpress`) — typed client for the WordPress REST API with `useInitWordPress` supporting Application Passwords, JWT, Basic Auth, and nonce-based authentication. Covers Posts, Pages, Media (with file upload via `useWpUploadMedia`), Categories, Tags, Comments, Users, and Custom Post Types with full CRUD operations. Includes batch operations (`useWpBatch`), auto-pagination (`useWpListAllPosts`), search (`useWpSearchAllPosts`), and slug-based routing (`useWpFindPostBySlug`). All functions return `FetchResult<T>`.
- **WordPress `_fields` support** — new `WpQueryParams._fields` parameter to limit response fields, reducing payload by 60-80% for list views. Supports nested field selection: `"id,title,link"` or `"id,title.rendered,acf.hero_image"`.
- **WordPress `_embed` as string** — `WpQueryParams._embed` now accepts `boolean | string` for selective resource embedding: `"_embed: author,wp:featuredmedia"` embeds only author and featured media. Typed `WpEmbedded` interface for `_embedded` responses with proper `author[]`, `wp:featuredmedia[]`, `wp:term[][]`, and `replies[][]` types.
- **WordPress ACF (Advanced Custom Fields) support** — `WpAcfFields` type for ACF field data on posts, pages, media, taxonomies, users, and options. ACF fields are accessible via `post.acf?.field_name` when using `_fields: "id,acf"`.
- **WordPress `media_details` complete types** — added `filesize`, `image_meta` (EXIF data), and complete `sizes` structure with `file`, `mime_type`, and `filesize` per size.
- **Vue and Nuxt framework examples** — SFC examples for blog listings and dynamic `[slug]` routes using `useQuery` (Vue) and `useAsyncData` (Nuxt) with SSR support.
- **Framework examples** — Astro and Next.js (React) demos for both adapters showing real-world usage: blog listings, dynamic `[slug]` routes, database queries, block rendering, media uploads, and taxonomy management. Examples live in `examples/notion/` and `examples/wordpress/`.

### Changed

- **npm v12 security hardening** — added `.npmrc` with `allow-scripts=` to block dependency lifecycle scripts (npm v12 default). Added `.github/workflows/release.yml` with OIDC trusted publishing for automated releases without long-lived NPM_TOKEN. Updated AGENTS.md with new release workflow and security notes.
- **Improved documentation** — expanded `useBuildUrl` section with real-world use cases (navigation links, image URLs, third-party libraries, debugging, SSR), updated `CONTRIBUTING.md` to reflect current tooling (pnpm), added contribution invitation to README.
- **Kitt AI assistant documentation** — added "When to use Kitt" and "When to use alternatives" comparison table with links to Vercel AI SDK, LangChain, CrewAI, and Botpress.

## [3.1.0] - 2026-09-14

### Added

- **Generic `useKatanaWatch` / `useWatch` composables** — watcher in `katanakit-js/adapters/vue` (re-exported from `katanakit-js/adapters/nuxt`) wrapping the native Vue `watch` with `deep: true` by default. Props (`WatchSource`, `WatchCallback`, `WatchOptions`, `WatchStopHandle`) are taken from the native `watch` and live in `src/types/`; the callback accepts any internal function (sync/async, with or without args). Accepts a ref, reactive object, getter function or array of sources, stops automatically on unmount, and powers use cases like revalidating a form (`safeParse` with Zod, Valibot, Standard Schema or custom validators) on every nested change. Schema-agnostic types (`FieldErrors`, `ValidationSchema`) also live in `src/types/`.

## [3.0.1] - 2026-09-13

### Fixed

- **`express-rate-limit` was imported by the assistant adapter but never declared** — the published package crashed with `ERR_MODULE_NOT_FOUND` for consumers of `katanakit-js/adapters/assistant`. It is now a runtime dependency (`8.7.0`, which ships its own types); the deprecated `@types/express-rate-limit` stub was removed.
- **Prisma client was initialized eagerly on import** — `src/prisma/use-prisma.ts` exported a module-level `prisma` instance that threw on import when `DATABASE_URL` was missing, breaking any app that imported `katanakit-js/prisma` and making the documented `usePrismaClient(url)` override unusable. The eager export was removed (it was not re-exported from any barrel, so this is non-breaking).
- **Release cards never badged `major`** — the version regex in `scripts/sync-docs-releases.mjs` was double-escaped, so `x.0.0` releases rendered as `Minor release`. Fixed and regenerated.

### Changed

- **Migrated the repository from Yarn 4 to pnpm 12** — `packageManager` pinned to `pnpm@12.4.1`, `pnpm-lock.yaml` replaces `yarn.lock`, workspace declared in `pnpm-workspace.yaml` (replacing the `workspaces` field), Yarn `resolutions` moved to pnpm `overrides`, CI uses `pnpm/action-setup` + `pnpm install --frozen-lockfile`, Husky pre-commit runs `pnpm lint-staged`, and all docs/config/scripts references updated. Release bumping now goes through `scripts/bump-version.mjs` (pnpm's `version` refuses a dirty working tree).
- **`.gitignore` now ignores all `.env*` variants** (previously only the exact `.env`), with `.env.example` still tracked.

## [3.0.0] - 2026-09-13

### Breaking

- **Prisma model `User` renamed to `Account`** (`@@map("accounts")`); `Post.author` now points to `Account`. Consumers of `katanakit-js/prisma` must switch `db.public.User` to `db.public.Account`. Table rename `users` → `accounts` requires a migration on live databases.

### Added

- **Access-control service** — pure role/capability registry in `src/core/services/access.service.ts` with hierarchy-based inheritance: `owner` > `admin` > `editor` > `author` > `member` > `guest`. Exposes `useCan`, `useHasRole`, `useCapabilitiesFor`, `useRegisterRole`, `useRoles` and `useResetRoles`. Types (`AccessRole`, `AccessCapability`, `AccessRoleDefinition`, `AccessSubject`, `IAccessService`) live in `src/types/`.
- **Express access guard** — `useRequireCapability(capability, resolveSubject)` in `katanakit-js/adapters/express` builds a `RequestHandler` that returns 401 for anonymous requests and 403 when the capability is missing. Plugs into the existing `guard` seam of the assistant router; unwired by default.

### Changed

- **Docs releases automated** — `scripts/sync-docs-releases.mjs` generates the homepage release cards, the docs changelog and the navbar Releases dropdown from git tags + Conventional Commits. `yarn docs:build` syncs first; CI runs `yarn docs:check` and fails on drift. The navbar now lists the latest 8 release tags with direct links to GitHub.
- **Merge-into-dev-first workflow** — feature branches must be merged into `dev` (`git checkout dev && git merge <branch>`) before any PR; PRs to `main` come only from `dev`. Documented in `AGENTS.md`.

## [2.15.0] - 2026-09-13

### Added

- **QueryClient** — `QueryClient` + `QueryCache` built on the reactive kernel. Features: cache with GC, query keys, stale-while-revalidate, retry with exponential backoff, deduplication, invalidation, refetch-on-window-focus, and `prefetchQuery`. Integrates with the existing API manager (`useFetch`, `useGetApi`) and Safe Results pattern.
- **Vue `useQuery` / `useMutation` composables** — reactive composables in `katanakit-js/adapters/vue` that wrap the QueryClient with Vue 3 reactivity (`data`, `error`, `isLoading`, `status`, `refetch`, `mutate`).
- **Husky + lint-staged pre-commit hook** — runs `eslint --fix` on staged `src/**/*.ts` files before every commit (installed via `yarn install`). Prevents lint failures from reaching CI.
- **`AGENTS.md`** — compact instruction file for AI agents (commands, architecture, git/CI workflow, Prisma skills).

### Added (Tests)

- 13 new tests for QueryClient (`tests/query.service.test.ts`) — 127 tests total.

### Changed

- **Replaced Biome with ESLint + Prettier** — migrated linting and formatting from Biome 2.5.12 (Rust, 38ms) to ESLint 10 + Prettier 3.9 (JS, ~4.3s). Same rules enforced: tabs, double quotes, semicolons, trailing commas, import sorting (`eslint-plugin-simple-import-sort`), recommended lint rules. TypeScript 7.0 has no compiler API; aliased `typescript` to `@typescript/typescript6@6.0.2` for type-aware linting. `tsc6` replaces `tsc` for type checking.
- **CI matrix `fail-fast: false`** — the Node 22/24 jobs now run to completion even if one version fails, so a failure on one version no longer cancels the other.

## [2.14.2] - 2026-09-13

### Added

- **Katana UI documentation** — new docs section describing the planned framework-agnostic UI kit: vision, layered architecture, full inventory (dashboards, e-commerce, apps, auth, blocks, layouts, interactions, charts and themes), LLM files strategy and delivery roadmap.
- **Navbar theme switch** — the docs site replaces the default color mode button with a checkbox switch (swizzled `ColorModeToggle`) with keyboard focus, reduced-motion support and pre-hydration styling.

### Changed

- Docs sidebar includes a UI Kit category, and the toolkit roadmap links to it.

## [2.14.1] - 2026-09-10

### Changed

- **Pinned all dependency versions** to exact (removed `^`/`~` ranges) for deterministic installs and supply chain safety.
- Added `resolutions` for transitive floating deps: `pathe@2.0.3`, `jsbi@4.3.2`.

### Removed

- Removed unused `@types/bun` dev dependency.

### Added

- Added `socket.yml` for Socket.dev supply chain security configuration.

## [2.14.0] - 2026-09-10

### Added

- **Kitt AI agent system** — OpenAI-compatible provider with tool-calling loop, session management, and conversation store. Built on a generic `AgentService` that handles system prompts, tool registration, and iterative LLM interaction until task completion.
- **REST assistant adapter** (`katanakit-js/adapters/assistant`) — `POST /chat` for sending messages, `GET /sessions` for listing conversations, `DELETE /sessions/:id` for cleanup. Includes auth guard, per-session context, and conversation persistence.
- **Telegram adapter** (`katanakit-js/adapters/telegram`) — long-polling bot via `getUpdates`, `sendMessage` reply with Markdown formatting, BotFather integration guide. Configurable polling interval and error handling.
- **WhatsApp adapter** (`katanakit-js/adapters/whatsapp`) — Meta Cloud API webhook receiver, HMAC signature verification (`X-Hub-Signature-256`), rate limiting (60 req/min), and async message processing with `messages.update` / `messages.received` event types.
- **Prisma conversation store** — `Conversation` + `Message` models in `prisma/schema.prisma` with session tracking, timestamps, and message history. New `assistant.store.ts` service for create/list/get/delete operations.
- **GitHub Actions CI** — `.github/workflows/ci.yml` runs lint, typecheck, build, and 114 tests on Node 22 and 24.
- **Rate limiting** — `express-rate-limit` on assistant routes (20 req/min) and WhatsApp webhook (60 req/min) with standard rate-limit headers.
- **`examples/assistant/`** — full demo with knowledge base, system prompt, and session management.
- **`examples/agent/`** — agent demo showing tool-calling loop with multiple registered tools.
- New test suites: `agent.service.test.ts`, `assistant.service.test.ts`, `telegram.service.test.ts`, `whatsapp.service.test.ts`, `express.server.test.ts` — 114 tests total.

### Changed

- **Express server restructured** — idempotent `create()`/`finalize()` pattern prevents double-initialization; `rawBody` capture via `verify` callback for signature verification; route ordering fix so static paths match before parameterized routes.
- **Type definitions expanded** — new agent, assistant, and adapter types in `src/types/index.ts` covering `AgentConfig`, `ToolDefinition`, `SessionMessage`, `AssistantConfig`, `TelegramConfig`, `WhatsAppConfig`, and webhook event types.
- **Prisma schema updated** — new `Conversation` and `Message` models; schema types regenerated.

### Fixed

- **Timing-safe HMAC comparison** — WhatsApp signature verification uses `crypto.timingSafeEqual` instead of string `===` to prevent timing attacks.
- **HTTPS enforcement** — WhatsApp webhook rejects non-HTTPS requests in production.
- **Path confinement** — file operations in storage service restricted to project root to prevent directory traversal.
- **Per-tool error capture** — agent tool failures are captured individually without crashing the entire tool-calling loop.
- **Build output directory** — `outDir` in `tsconfig.json` corrected; `yarn clean` ensures clean builds before each release.

## [2.0.0] - 2026-09-03

Developed and published as `katanakit-dev`.

### Added

- **Reorganized the project** with hexagonal architecture into `types/`, `core/services/`, `infrastructure/`, `adapters/`, `config/`, and `prisma/`.
- Exposed the public API through barrel files (`src/index.ts` and per-layer `index.ts`).
- Added Vitest unit tests for the HTTP client, logger, storage, DOM, and reactive services.
- Added English documentation (`README.md`, `CONTRIBUTING.md`, `docs/`, `SECURITY.md`).

### Fixed

- Fixed TypeScript compile errors: broken imports, broken singleton guards (`TimingService` and `ViewportService`), the `FIND_ENTRY` scope bug in `AstroService`, and Express `Request`/`Response` typing.
- Removed all side effects on import (top-level `fetch` to dummyjson.com, `console.log` calls, storage writes and timers).
- Fixed the Express server: `listen` now uses the configured port/host, the user router is mounted, and handler `(req, res)` argument order is correct.
- Fixed the logger call sites (level is now the first argument of `useLog`).

### Removed

- Removed duplicate type definitions (unified in `src/types/`).
- Dead code, empty files and the broken signals draft.
- Moved demos to `examples/` and dropped the obsolete `wiki/` documentation.

## [1.x] - Earlier

Initial release series focusing on core KatanaKit functionality and framework adapters.

## [0.1.0] - Initial release

First public release of KatanaKit.

## License

MIT
