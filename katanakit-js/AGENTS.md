# AGENTS.md — katanakit-js

TypeScript service toolkit (ESM, hexagonal). Bun for package management and scripts.

## Commands (order matters: lint → typecheck → test)

- `bun run check` — gate: `eslint ./src` + `tsc6 --noEmit` + `vitest run`. Must pass before any PR.
- `bun run fix` — same with `eslint --fix`.
- `bun run build` — clean + check + `tsc6 -p tsconfig.json` → `dist/`.
- `bun run guides:build` — Docusaurus build (separate; CI does NOT build docs).
- `bun run playground:dev` — launches the Vue playground (Vite dev server on port 5173).
- One test file: `vitest run <path>`. Tests live in `tests/`, import via `@/` alias, node env.
- `tsc6`, NOT `tsc`: `typescript` devDep is aliased to `@typescript/typescript6@6.0.2`.
- A Husky pre-commit hook runs `eslint --fix` on staged files (installed via `bun install`).

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
- Release via CI: trigger `.github/workflows/release.yml` (workflow_dispatch, pick patch/minor/major). Manual fallback: `bun run release[:minor|:major]`.
- **PREREQUISITE**: Trusted publishing must be configured on npmjs.com (Package Settings → Publishing access → Trusted publishing → repo `senseikatana/katanakit`, workflow `release.yml`).

## CI (.github/workflows/ci.yml + release.yml)

- Triggers: push to `main`, PR to `main`. Matrix node 22/24, `fail-fast: false` (both versions always report).
- Steps: `bun install --frozen-lockfile` → `bun run check` → `bun run build`.
- `bun install --frozen-lockfile` fails if `bun.lockb` is out of sync — commit lockfile changes.
- `simple-import-sort` fails CI on unsorted imports — run `bun run fix` (pre-commit hook autofixes staged files).

## Cloudflare Pages deployment

- **Docs:** `katanakit-guides` project → `senseikatana.com` + `www.senseikatana.com`
- **Playground:** `katanakit-playground` project → `play.senseikatana.com`
- Deploy manually: `bun run guides:build` → `wrangler pages deploy guides/build --project-name katanakit-guides --branch main`
- Deploy playground: `bun run playground:build` → `wrangler pages deploy playground/dist --project-name katanakit-playground --branch main`
- Custom domains via Cloudflare API: `POST /accounts/{id}/pages/projects/{name}/domains`
- Cloudflare Account ID: `d84658746e925afe768db13e48a136a7`

## npm security

- `.npmrc` disables dependency lifecycle scripts (`allow-scripts=`). If a new dependency needs scripts, add it explicitly.
- Release workflow uses OIDC trusted publishing — no long-lived NPM_TOKEN secret. Requires npmjs.com trusted publisher config (see Git workflow section).
- Token docs: https://docs.npmjs.com/creating-and-viewing-access-tokens#creating-granular-access-tokens-on-the-website
- **Pending (npm account suspended):**
  1. Create `katanakit-publish` token on npmjs.com (bypass-2FA unchecked, scoped to `katanakit-js`, read-write)
  2. Revoke old `NPM_TOKEN` (id: `1e997c`, has bypass-2FA=true)
  3. Configure Trusted Publishers: npmjs.com → Package Settings → Publishing access → Trusted publishing → repo `senseikatana/katanakit`, workflow `release.yml`

## Agent skills

- `.agents/skills/prisma-8/` and `prisma-composer/` — load relevant SKILL.md before Prisma/DB work.
