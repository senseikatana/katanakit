---
title: UI Kit
sidebar_position: 1
description: Katana UI — the planned framework-agnostic UI kit built on top of KatanaKit.
---

# Katana UI

:::warning Status
**Planned — design phase.** This section describes an upcoming UI layer. No UI code
ships in `katanakit-js` yet. The name **Katana UI** is provisional.
:::

Katana UI is the planned UI kit for KatanaKit: design tokens, headless primitives,
components, blocks, layouts and full application pages that reuse the toolkit's core
services instead of rebuilding them.

## Why a kit on top of the toolkit

KatanaKit already owns the invisible parts of a product — HTTP with Safe Results,
storage strategies, reactive signals, theming, observers, sensors, workers and the AI
assistant. Every dashboard, storefront and operational console needs exactly those
capabilities on every screen. The kit exists so a team can assemble those screens from
the same primitives the toolkit already guarantees.

## Principles

| Principle | What it means |
| --- | --- |
| Framework-agnostic core | Tokens, primitives and styles are vanilla TypeScript and CSS. Framework bindings are thin adapters. |
| Token-first styling | Components consume CSS custom properties only. Tailwind and daisyUI are optional presets, never a requirement. |
| SSR-safe | Every module guards browser-only APIs and hydrates without layout shifts. |
| Tree-shakeable | Per-component entry points and no side effects on import. |
| Accessible by default | WCAG 2.2 AA target: semantics, focus management, keyboard flows, reduced motion. |
| Safe Result aware | Data-bound components speak the same `{ data, error, ok }` contract as the HTTP client. |

## Relationship with the toolkit

| UI need | KatanaKit service |
| --- | --- |
| Tables, filters, pagination | `FetchApiManager`, `useGetApi` |
| Theme switching and persistence | `ThemeService`, `useInitTheme` |
| Remembered UI state | `StorageService` strategies |
| Reactive widgets and stores | `ReactiveService` signals |
| Lazy blocks, infinite scroll | `ObserverService`, `LazyLoaderService` |
| Device capabilities | `SensorsUtils`, `ViewportService` |
| Chat and Gen-AI surfaces | `AssistantService`, `adapters/assistant` |
| Heavy computation | `WorkerService` |
| Formatting numbers, dates, currency | `FormatterService`, `DatesService` |

## Scope

- **Application pages** — eight dashboard layouts, a landing page, ten e-commerce
  pages, a file manager, a chat app, a four-page Gen-AI app and the Agentic Storage UI.
- **Account flows** — four auth pages, profile settings and a support/FAQ page.
- **Building blocks** — a foundation component example, 15+ ready-to-use UI blocks,
  50+ common layout examples and 100+ interaction examples with plugin integrations.
- **Theming** — token-first themes with an optional Tailwind/daisyUI preset.
- **Charts** — ApexCharts behind a swappable adapter.
- **LLM files** — machine-readable artifacts so agents can consume the kit.

## Out of scope

- Backend and business logic (the kit consumes APIs, it does not own them).
- Real datasets, seed content and domain-specific integrations.
- Framework state managers (the reactive signals kernel covers the kit's needs).

## Read next

- [Architecture](./architecture.md) — layers, theming, distribution and patterns.
- [Inventory](./inventory.md) — every planned page, block, layout and interaction.
- [LLM files](./llm-files.md) — machine-readable artifacts for AI agents.
- [Roadmap](./roadmap.md) — delivery phases and exit criteria.
