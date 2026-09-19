---
title: LLM files
sidebar_position: 4
description: Machine-readable artifacts that let AI agents consume Katana UI.
---

# LLM files

Katana UI ships machine-readable documentation so AI agents — including KatanaKit's
own assistant — can discover, compose and code against the kit without scraping the
rendered docs.

## Artifacts

| Artifact | Purpose | Consumer |
| --- | --- | --- |
| `llms.txt` | Curated index of the kit: entry points, blocks, links. | Agents with a fetch tool. |
| `llms-full.txt` | Concatenated documentation and component reference in one file. | Agents with a large context window. |
| `registry.json` | Structured component and block metadata (props, tokens, examples, a11y). | Build tools, generators, MCP servers. |
| Per-block markdown | One file per block with usage and examples. | Focused retrieval. |
| MCP server (optional) | Query interface over the registry. | Agent toolchains. |

## `llms.txt` shape

```txt
# Katana UI

> Framework-agnostic UI kit for KatanaKit. Tokens, primitives, blocks and app pages.

## Docs
- Architecture: /docs/ui-kit/architecture
- Inventory: /docs/ui-kit/inventory

## Entry points
- Tokens: @katanakit/ui/tokens
- Vanilla: @katanakit/ui/vanilla
- Charts: @katanakit/ui/charts

## Blocks
- KPI stats: /docs/ui-kit/blocks/kpi-stats.md
- Data table: /docs/ui-kit/blocks/data-table.md
```

## `registry.json` shape

```json
{
  "name": "kpi-stats",
  "category": "block",
  "description": "Row of metric cards with trend indicators.",
  "tokens": ["--kt-space-4", "--kt-radius-md"],
  "props": [
    { "name": "items", "type": "KpiItem[]", "required": true },
    { "name": "columns", "type": "2 | 3 | 4", "default": "4" }
  ],
  "examples": ["examples/kpi-stats/default.html"],
  "a11y": { "role": "group", "keyboard": [] }
}
```

## Generation pipeline

1. Component metadata is the single source of truth, colocated with each component.
2. A build script validates the metadata (props, tokens, examples, a11y map).
3. The script emits `llms.txt`, `llms-full.txt`, `registry.json` and per-block
   markdown into the package `dist/` and the docs static files.
4. CI fails when metadata and docs drift apart.

## Integration with Kitt

The KatanaKit assistant can register a tool that queries `registry.json`, so an agent
can answer "which block shows revenue trends?" or scaffold a page with valid entry
points instead of guessing imports.
