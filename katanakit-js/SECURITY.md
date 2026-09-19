# Security

This document summarizes the security posture of `katanakit-js` and provides
guidance for deploying it safely.

## Trust boundary

The library is a set of utilities. Its security depends on how you configure
and deploy it. In particular:

- **API registry (`useInit`)** is trusted configuration. Validate the origin of
  any `baseUri` before registering it from untrusted input.
- **Worker functions (`WorkerService.useRun`, `useCreatePool`)** are serialized
  with `func.toString()` and executed inside a Web Worker. Only pass functions
  that are part of your own bundle — never functions derived from user input. A
  Web Worker is **not** a security sandbox.
- **HTML sinks (`DomService.useSetHtml`, RSS `content`)** — anything you place
  in `innerHTML`, RSS CDATA or `SeoMeta` is trusted output. Sanitize
  user-supplied content before it reaches these sinks.

## Built-in protections (already applied in 2.2.1)

The following hardening measures are implemented in the current code and were
verified during the 2.2.1 development cycle:

- **URL construction** (`FetchApiManager.useBuildUrl`) encodes path params with
  `encodeURIComponent`, sets query params through `URLSearchParams`, and rejects
  any scheme other than `http:`/`https:`. `javascript:`, `data:` and other
  schemes throw, which prevents `javascript:` URL injection and SSRF-style
  redirects from the registry.
- **Safe Result instead of exceptions** (`useFetch`, `useGet`, `usePost`,
  `usePut`, `useDelete`) — HTTP and network errors are returned as
  `{ data: null, error: ApiError, ... }`, so response bodies and error details
  are never thrown across trust boundaries.
- **DOM event-attribute block** (`DomService.useSetAttribute`) throws for any
  `on*` attribute; use the safe `useOn` event binding instead. This closes a
  class of DOM XSS vectors.
- **JSON-LD escaping** (`useGenerateMetaTags`) escapes `<`, `>` and `&` inside
  the serialized `application/ld+json` script, preventing `</script>` breakout.
- **Random-salt hashing** (`GeneratorService.useEncrypt`) generates a fresh
  128-bit random salt when none is provided; output is `"salt:hash"`.
  `useUuid` prefers `crypto.randomUUID()` and `useToken` prefers
  `crypto.getRandomValues()`.
- **Worker cleanup** (`WorkerService.useRun`, `useCreatePool`) terminates the
  worker and revokes its object URL on every path — success, error and
  non-cloneable results. Pool tasks are correlated by `taskId` to avoid
  response races.
- **Express reference server** (`src/adapters/express/server.ts`) disables the
  `x-powered-by` header, restricts JSON/urlencoded bodies to 100 kb and
  defaults CORS to the comma-separated `CORS_ORIGINS` allow-list (localhost
  fallback). Unhandled errors return generic `500` messages without leaking
  stack traces.
- **Storage SSR fallback** (`StorageService`) JSON-serializes values and swaps
  to an in-memory store when `window` is absent, so importing never crashes
  outside the browser and no exception exposes storage internals.
- **SSR-safe DOM** (`DomService`, `ViewportService`, `SensorsUtils`,
  `ThemeService`, `ObserverService`, `WorkerService`) guard every browser-only
  API and return `null`/`false`/no-ops when the platform API is unavailable.
- **Log strategy injection** (`useSetStrategy`) lets you route
  logs (and error details) through your own sink instead of `console`.

## Recommendations for production

These are hardening steps you should take when the library is used with real
data or authentication.

### 1. Do not use `useEncrypt` for credentials

`GeneratorService.useEncrypt` is a one-way hash **demo** (PBKDF2-SHA512, 100 000
iterations). It is not a password store: for real passwords use `scrypt` or
`argon2id` with a per-user random salt, a high work factor and a constant-time
`verify`.

### 2. Restrict CORS, add rate limiting and set a smaller body limit

The Express adapter already restricts origins through `CORS_ORIGINS` and caps
bodies at 100 kb, but a production API should add more:

```ts
import rateLimit from "express-rate-limit";

app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:5173"],
  }),
);
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));
app.use(express.json({ limit: "16kb" }));
```

### 3. Never render stored values as HTML

Treat everything read from `useGetStorage` as untrusted. Use
`useSetText`/`textContent` instead of `useSetHtml`/`innerHTML` when displaying
stored data; a stored value like `<img src=x onerror=...>` becomes stored XSS
otherwise. Do not store session or auth tokens in `localStorage` — prefer
`HttpOnly` + `SameSite` cookies.

### 4. Validate `ThemeService` input

`ThemeService.useInitTheme` reads the stored mode without validating it. Check
that the stored value is `"light"`, `"dark"` or `"system"` before letting it
influence your CSS, or sanitize the storage key when writing from untrusted
input.

### 5. Run a dependency scanner in CI

`cors` receives minimal maintenance and is a candidate for replacement by manual
header configuration. Integrate `osv-scanner`, `npm audit`/`bun audit` or
Dependabot to keep dependencies reviewed.

### 6. Database security (Prisma)

- Use connection pooling (PgBouncer or Prisma Accelerate) in production.
- Enable SSL/TLS in your `DATABASE_URL` (`?sslmode=require`).
- Never log or expose `DATABASE_URL` in client-side code.
- Use Prisma's built-in query parameterization (no string concatenation).
- `schema.json`/`schema.d.ts` are generated artifacts of the contract — keep
  them in sync by regenerating with `prisma contract emit`, and review schema
  changes as you would review SQL migrations.

## Reporting a vulnerability

Please open a [security issue](https://github.com/senseikatana/katanakit/issues)
or contact the maintainer privately. Do not disclose sensitive details publicly
before a fix is available.
