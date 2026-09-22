---
title: Architecture
sidebar_position: 2
description: Layered architecture, theming, distribution and design patterns for Katana UI.
---

# Architecture

Katana UI is designed as a separate package that consumes `katanakit-js` from the
outside. The toolkit stays a pure service library; the kit adds presentation on top
without reaching into the core.

## Layers

```
tokens      CSS custom properties (color, space, radius, typography, elevation)
   │
primitives  headless behavior (disclosure, focus trap, roving tabindex, positioning)
   │
bindings    framework glue (vanilla · Vue/Nuxt · Astro · React · Svelte)
   │
components  styled UI (button, input, table, modal, toast, chart)
   │
blocks      composed sections (KPI row, data-table toolbar, activity feed)
   │
layouts     page shells (app shell, auth shell, marketing shell)
   │
pages       full screens (dashboards, storefront, apps, account flows)
```

| Layer | Responsibility | Examples |
| --- | --- | --- |
| Tokens | Single source of visual truth | `--kt-color-primary`, `--kt-space-4`, `--kt-radius-md` |
| Primitives | Behavior without markup opinions | `createDisclosure`, `createFocusTrap`, `createPopover` |
| Bindings | Lifecycle, reactivity and hydration | `vanilla`, `vue`, `astro`, `react`, `svelte` |
| Components | Accessible, themed markup | Button, Input, Table, Modal, Toast |
| Blocks | Drop-in sections composed of components | KPI stats, chart card, empty state |
| Layouts | Reusable page skeletons | App shell, auth shell, settings shell |
| Pages | Complete screens with mock contracts | CRM, e-commerce, file manager, chat |

## Theming

Theming is token-first. The kit never hardcodes a color, radius or size; it reads CSS
custom properties and lets the host application override them.

```css
:root {
  --kt-color-primary: oklch(62% 0.19 260);
  --kt-color-surface: oklch(98% 0 0);
  --kt-space-4: 1rem;
  --kt-radius-md: 0.5rem;
}

[data-theme="dark"] {
  --kt-color-surface: oklch(18% 0.01 260);
}
```

- `ThemeService` owns the `data-theme` attribute, persistence and the system
  preference listener. The kit only consumes the attribute.
- A theme is a plain stylesheet. Six curated themes are planned; any theme that
  defines the token contract works.
- **Tailwind CSS 4 and daisyUI are optional presets**, published as separate entry
  points. Neither is a dependency of the core kit.

## Distribution

| Concern | Decision |
| --- | --- |
| Location | Separate workspace package (`packages/ui`) published independently. |
| Package name | Provisional `@katanakit/ui`. |
| Runtime dependencies | None beyond `katanakit-js`. |
| Peer dependencies | `vue`, `react`, `svelte` and `apexcharts` — all optional, loaded only by their binding. |
| Entry points | `/tokens`, `/vanilla`, `/vue`, `/nuxt`, `/astro`, `/charts`, plus per-component subpaths. |
| Styling | Plain stylesheet by default; `tailwind` and `daisyui` presets as opt-in subpaths. |
| CSS isolation | Tokens are namespaced (`--kt-*`); component selectors never target host markup. |

## Charts

Charts sit behind a small strategy contract so the rendering library is replaceable:

```ts
interface ChartAdapter {
  render(target: HTMLElement, config: ChartConfig): ChartHandle;
}
```

- `ApexChartAdapter` is the default implementation; `apexcharts` is an optional peer
  dependency and only loads in the `@katanakit/ui/charts` entry point.
- A lightweight SVG fallback adapter is planned for SSR and minimal bundles.
- Chart blocks consume `ChartAdapter`, never ApexCharts directly.

## Design patterns

| Pattern | Where it applies |
| --- | --- |
| Singleton | Shared kit runtime (theme bridge, chart registry) built on the existing toolkit services. |
| Facade | Each entry point exposes one facade over primitives and components. |
| Factory | Component registration, chart adapter resolution, block factories. |
| Observer | Reactive widgets subscribe to `ReactiveService` signals; lazy blocks use `ObserverService`. |
| Strategy | Chart adapters, storage-backed state, formatting strategies. |
| Decorator | Composition helpers that add behavior (validate, persist, lazy-load) around components. |

## SSR and hydration

- Primitives are no-ops on the server and activate on the client.
- `useInitTheme` already guards `window`; the kit never runs theme code during SSR.
- Charts render a sized placeholder server-side and mount on the client to avoid
  layout shift.
- No component reads `location`, `matchMedia` or storage at import time.

## Accessibility

- Semantic HTML first; ARIA only where semantics are insufficient.
- Focus trap, focus restore and roving tabindex live in primitives, not in each
  component.
- Every interactive block documents its keyboard map in the component metadata
  (see [LLM files](./llm-files.md)).
- `prefers-reduced-motion` disables non-essential animation.

## Performance

- No side effects on import; unused components are dropped by the bundler.
- Per-component entry points keep the initial bundle small.
- Blocks support lazy mounting through dynamic import plus `ObserverService`.
- Expensive data shaping (sorting, filtering, aggregation) can be offloaded to
  `WorkerService`.
