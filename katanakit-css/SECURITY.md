# Security

This document describes the security posture of `katanakit-css` and gives
guidance for using it safely.

---

## Trust boundary

`katanakit-css` is a **static SCSS/CSS library**. It has:

- no JavaScript runtime,
- no network calls,
- no server-side execution,
- no browser APIs,
- no secrets, tokens or user storage.

All processing happens **at build time** when the Sass compiler evaluates the
SCSS source. What you ship is plain CSS. As a consequence, the framework
itself has no runtime attack surface: there is nothing an attacker can
exploit *after* the CSS has been compiled and served.

The security of a project using the library therefore depends on:

1. which inputs reach the Sass compiler and your CSS pipeline,
2. how you serve and constrain the compiled CSS.

---

## Build-time considerations

### Treat SCSS as code

Sass is evaluated during the build. Only compile SCSS you control or that
comes from trusted packages. Third-party SCSS can execute logic inside the
compiler, so review new dependencies (and the versions of `sass`, `vite`,
`postcss`, `vite-plugin-purgecss` in `devDependencies`) before installing
them. Pin or review transitive updates in production CI.

### Keep user input away from `url()`

CSS `url()` values can reference external resources (images, fonts, `@font-face`
sources, CSS sub-resources). Never let user-supplied strings reach a `url()`
unvalidated. Validate scheme, host and path, or allow-list static assets.
Untrusted values such as `url("javascript:…")` or `data:` URIs are a real
injection vector when a stylesheet is later inlined or loaded in a privileged
context.

### Validate numbers before `calc()` and custom properties

Custom properties can hold almost any token stream. If user input flows into
`calc()`, `var()`, `color-mix()` or interpolation, validate that it is numeric
with an expected unit and length-limited. The same applies to any value the
framework exposes through `@include apply(...)` or `register-utility()` in
downstream themes.

### Generated class and map overrides

`katanakit-css` exposes `!default` maps (`variables`, `utils/_maps`,
`colors`) that downstream projects can override. Malicious overrides are just
malicious SCSS — keep them under the same trust as the rest of your styles.

---

## Runtime considerations (the served CSS)

- **Serve the compiled artifact over HTTPS** and let browsers only load styles
  from origins you control.
- **Use a Content-Security-Policy.** If you ship the full sheet, a policy with
  `style-src 'self'` (plus hashes/nonces for inline styles) is a sensible
  baseline. Keep inline style attributes minimal.
- **Avoid reflecting untrusted data into inline styles.** Reflection into
  `style="…"` or dynamically injected `<style>` bypasses some URL/scheme
  filters.
- **Subresource integrity** — if you load the precompiled
  `dist/css/globals.min.css` from a CDN, add an `integrity` attribute.

---

## The framework does not weaken your app

- The reset, tokens and utilities emit no network requests and no scripting.
- The `@apply` registry and utility generators only expand to static CSS
  declarations at compile time.
- Nothing in `katanakit-css` reads `localStorage`, cookies, `document`, or
  process/system data, and no build step ships any of those.

---

## Reporting a vulnerability

This is a small open-source project without dedicated security infrastructure.
If you believe you have found a security issue:

1. Do **not** open a public issue with exploit details.
2. Use GitHub's **private vulnerability reporting** on the repository
   (https://github.com/senseikatana/katanakit-css/security/advisories), or
   contact the maintainer privately through the GitHub profile.
3. Include a minimal reproduction, the affected version, and whether the issue
   is build-time (SCSS input) or runtime (compiled CSS usage).

Because fixes land in the current release line and are described in [CHANGELOG.md](CHANGELOG.md).

---

## Supported versions

| Version | Status |
| --- | --- |
| `0.12.5` | Supported — latest release |

There is no automated security testing yet; consider that when evaluating the
library for high-risk environments.
