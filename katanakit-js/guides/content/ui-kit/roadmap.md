---
title: Roadmap
sidebar_position: 5
description: Delivery phases and exit criteria for Katana UI.
---

# Roadmap

Delivery is phased so each stage is usable on its own. The toolkit keeps shipping
independently; the kit never blocks core releases.

## Phase 0 — Foundations

- [ ] Token contract (`--kt-*` variables) with light and dark values.
- [ ] Headless primitives: disclosure, focus trap, popover positioning, roving tabindex.
- [ ] Theming bridge over `ThemeService`.
- [ ] Foundation component example end to end.
- [ ] Docs skeleton and a11y checklist.

**Exit criteria:** a themed button and modal work in vanilla, Vue/Nuxt and Astro with
keyboard support and no SSR errors.

## Phase 1 — Shells and layouts

- [ ] App shell (sidebar, topbar, breadcrumbs, command palette).
- [ ] Auth shell, settings shell and marketing shell.
- [ ] The 50 common layout examples.

**Exit criteria:** every layout renders in light/dark and passes the a11y checklist.

## Phase 2 — Core pages

- [ ] Four auth pages and profile settings.
- [ ] Eight dashboard layouts with chart blocks and data tables.
- [ ] Support/FAQ page.

**Exit criteria:** dashboards run against mock Safe Result contracts with loading,
empty and error states.

## Phase 3 — Applications

- [ ] E-commerce pages (10).
- [ ] File manager and Agentic Storage UI.
- [ ] Chat app on `AssistantService`.
- [ ] Gen-AI app (home, images, content creator, library).

**Exit criteria:** each app works end to end with the toolkit services and no custom
data layer.

## Phase 4 — Blocks and interactions

- [ ] 15+ ready-to-use UI blocks.
- [ ] 100+ interaction examples with plugin integrations.
- [ ] ApexCharts adapter plus the SVG fallback.

**Exit criteria:** every example is documented, keyboard-operable and covered by the
metadata registry.

## Phase 5 — Distribution and LLM files

- [ ] Publish `@katanakit/ui` with per-component entry points.
- [ ] Tailwind and daisyUI presets.
- [ ] Six curated themes.
- [ ] Generate `llms.txt`, `llms-full.txt` and `registry.json` in CI.

**Exit criteria:** a fresh project installs the package, picks a theme and scaffolds a
block using only the LLM files.

## Related

- [Toolkit roadmap](../guides/roadmap.md) — core services and adapters.
- [Inventory](./inventory.md) — the full planned surface.
