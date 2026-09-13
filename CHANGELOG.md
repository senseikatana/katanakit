# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Changed

- **Replaced Biome with ESLint + Prettier** — migrated linting and formatting from Biome 2.5.12 (Rust, 38ms) to ESLint 10 + Prettier 3.9 (JS, ~4.3s). Same rules enforced: tabs, double quotes, semicolons, trailing commas, import sorting (`eslint-plugin-simple-import-sort`), recommended lint rules. TypeScript 7.0 has no compiler API; aliased `typescript` to `@typescript/typescript6@6.0.2` for type-aware linting. `tsc6` replaces `tsc` for type checking.

## [2.15.0] - 2026-09-13

### Added

- **QueryClient** — `QueryClient` + `QueryCache` built on the reactive kernel. Features: cache with GC, query keys, stale-while-revalidate, retry with exponential backoff, deduplication, invalidation, refetch-on-window-focus, and `prefetchQuery`. Integrates with the existing API manager (`useFetch`, `useGetApi`) and Safe Results pattern.
- **Vue `useQuery` / `useMutation` composables** — reactive composables in `katanakit-js/adapters/vue` that wrap the QueryClient with Vue 3 reactivity (`data`, `error`, `isLoading`, `status`, `refetch`, `mutate`).

### Added (Tests)

- 13 new tests for QueryClient (`tests/query.service.test.ts`) — 127 tests total.

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
