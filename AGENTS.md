# AGENTS.md — katanakit-js

TypeScript service toolkit (ESM, hexagonal). pnpm 12 pinned via `packageManager` — always use `pnpm`, never npm/bun for installs.

## Commands (order matters: lint → typecheck → test)

- `pnpm check` — gate: `eslint ./src` + `tsc6 --noEmit` + `vitest run`. Must pass before any PR.
- `pnpm fix` — same with `eslint --fix`.
- `pnpm build` — clean + check + `tsc6 -p tsconfig.json` → `dist/`.
- `pnpm docs:build` — Docusaurus build (separate; CI does NOT build docs).
- One test file: `vitest run <path>`. Tests live in `tests/`, import via `@/` alias, node env.
- `tsc6`, NOT `tsc`: `typescript` devDep is aliased to `@typescript/typescript6@6.0.2`.
- A Husky pre-commit hook runs `eslint --fix` on staged files (installed via `pnpm install`).

## Architecture

- `src/types/` single source of truth; `src/core/services/` pure (no I/O); `src/infrastructure/` browser I/O (SSR-safe); `src/adapters/*` framework entry points published as package subpaths — never import them from the main barrel.
- All relative imports inside `src/` MUST use explicit `.js` extension (nodenext). `@/` alias only in `tests/` and `examples/`.
- `use*` prefix on every public method (except `getInstance()`); English only; no side effects on import; SSR guards where `window`/`document` touched; fallible async returns Safe Result `{ data, error, ok }`.
- Services are Singleton facades with destructured re-exports; `adapters/nuxt` exports pure functions (exception).

## Docs

- Docusaurus in `docs/`. Sidebar: manual Guides + TypeDoc-generated `docs/api/` (never hand-edit `docs/api/`).
- WARNING: `CONTRIBUTING.md` is stale (Astro Starlight, `docs-site/`, GitHub Pages, bun scripts, v2.2.1 — all wrong). Trust `package.json`, `ci.yml`, and this file instead.

## Git workflow

- Branch from `dev` (conventional commits). Never PR `feature` → `main` directly.
- Before any PR: `git checkout dev && git merge <branch>` — features land in `dev` first.
- PRs to `main` come only from `dev`. Merge only green. Delete branches after merge.
- CHANGELOG `[Unreleased]` entry for user-visible changes; README + docs updated with features.
- Release is manual (`pnpm release[:minor|:major]`). No CI release automation.

## CI (.github/workflows/ci.yml — the ONLY workflow)

- Triggers: push to `main`, PR to `main`. Matrix node 22/24, `fail-fast: false` (both versions always report).
- Steps: `pnpm install --frozen-lockfile` → `pnpm check` → `pnpm build`.
- `pnpm install --frozen-lockfile` fails if `pnpm-lock.yaml` is out of sync — commit lockfile changes.
- `simple-import-sort` fails CI on unsorted imports — run `pnpm fix` (pre-commit hook autofixes staged files).

## Agent skills

- `.agents/skills/prisma-8/` and `prisma-composer/` — load relevant SKILL.md before Prisma/DB work.
