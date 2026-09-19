---
title: Inventory
sidebar_position: 3
description: Every planned page, dashboard, application, block, layout and interaction in Katana UI.
---

# Inventory

The full planned surface of Katana UI. Everything listed here is **planned**; see the
[roadmap](./roadmap.md) for delivery order.

## Dashboards (8)

| Dashboard | Focus |
| --- | --- |
| CRM | Contacts, deals pipeline, activity tracking, revenue forecasting. |
| E-commerce | Sales, products, orders, customers and conversion funnels. |
| Gen-AI | Token usage, prompt activity, model costs and generation quality. |
| Growth | Acquisition, activation, retention and experiment tracking. |
| AI Ops | Model health, latency, failure rates and evaluation runs. |
| Corporate Finance | P&L, cash flow, budgets and variance analysis. |
| Site Reliability Engineering | SLIs, SLOs, error budgets, incidents and on-call. |
| Security Operations | Alerts, threat feeds, audit trail and access anomalies. |

## Marketing

- Landing page — hero, feature grid, social proof, pricing, FAQ and footer.

## E-commerce (10)

Product catalog · Product detail · Cart · Checkout · Order confirmation · Orders ·
Order detail · Customers · Inventory · Promotions. Every page includes tables, forms
or cards as appropriate, with empty, loading and error states.

## Applications

| App | Pages |
| --- | --- |
| File manager | Tree navigation, grid/list views, upload dropzone, preview drawer. |
| Chat | Conversation list, message thread, composer, presence, attachments. |
| Gen-AI | Home, Images, Content creator, Library. |
| Agentic Storage | Agent memory browser: artifacts, sessions, embeddings and retention controls. |

## Authentication (4)

Sign in · Sign up · Forgot password · Reset password. Includes validation states,
error handling and success screens.

## Account and support

- Profile settings — personal data, security, notifications, connected accounts.
- Support/FAQ — searchable questions, categories, contact form.

## Foundations

- Foundation component example — a documented reference component that demonstrates
  the full pipeline: tokens, primitive, binding, docs, tests, a11y map and LLM
  metadata.

## UI blocks (16 planned, 15+ required)

Page header · KPI stats row · Chart card · Data table with toolbar · Filter bar ·
Empty state · Activity feed · Timeline · Notification list · Team members ·
Pricing cards · File list · Chat thread · Wizard steps · Form section · CTA banner.

## Common layouts (50+)

| Family | Count |
| --- | --- |
| Dashboard shells | 8 |
| Auth shells | 4 |
| List/table layouts | 6 |
| Record/detail layouts | 6 |
| Settings layouts | 6 |
| Form layouts | 6 |
| Marketing sections | 6 |
| App layouts (file manager, chat, Gen-AI, storage) | 4 |
| Utility layouts (404, 500, maintenance, onboarding) | 4 |
| **Total** | **50** |

## Interaction examples (100+)

| Family | Count | Examples |
| --- | --- | --- |
| Overlays | 20 | Dropdown, select, combobox, popover, tooltip, modal, drawer, sheet, toast, context menu, command palette, date picker, color picker, tour, lightbox. |
| Navigation | 15 | Tabs, breadcrumbs, pagination, sidebar collapse, stepper, segmented control, tree view, skip links. |
| Forms | 25 | Validation, masked input, autocomplete, file dropzone, rich text, inline edit, multi-step form, OTP input. |
| Data | 20 | Sortable and filterable tables, virtualized lists, bulk actions, drag and drop, column pinning, export. |
| Charts | 10 | Interactive line, bar, donut, heatmap, radar and candlestick examples with ApexCharts. |
| Editors and media | 10 | Code editor, markdown editor, image cropper, video player, audio recorder, PDF preview. |

Plugin integrations are documented per example: charts (ApexCharts), editors,
calendar, maps, drag and drop, and clipboard.

## Charts

ApexCharts is the default adapter for: line, area, bar, column, pie, donut, radial
bar, radar, polar area, heatmap, treemap, candlestick, bubble, scatter and range
charts. Every chart is wrapped by a block that speaks the Safe Result contract for
its data source.

## Themes

Six curated themes plus the token contract for custom themes. Any theme that defines
the `--kt-*` variables works, and an optional daisyUI preset maps the tokens to
daisyUI themes.

## LLM files

Machine-readable artifacts generated from component metadata: `llms.txt`,
`llms-full.txt`, a component registry and per-block markdown. See
[LLM files](./llm-files.md).
