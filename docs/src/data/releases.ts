export type ReleaseKind = 'latest' | 'major' | 'minor';

export interface Release {
  /** Short version label, e.g. "2.14". */
  version: string;
  kind: ReleaseKind;
  /** Human-readable date, e.g. "September 10, 2026". */
  date: string;
  /** Git tag backing this milestone, e.g. "v2.14.1". */
  tag: string;
  /** One or two sentences framing the release. */
  summary: string;
  /** Checklist of what the release brought. */
  highlights: string[];
}

export const releases: Release[] = [
  {
    version: '2.14',
    kind: 'latest',
    date: 'September 10, 2026',
    tag: 'v2.14.1',
    summary:
      'Production hardening. Every dependency is pinned, a supply-chain policy ships with the repo, and the HTTP adapters are protected against abuse and forged webhooks.',
    highlights: [
      'Every runtime and dev dependency pinned to an exact version, with resolutions for transitive floaters',
      'Socket.dev policy committed as socket.yml, with alerts on manifest changes',
      'Rate limiting on the REST assistant (20 req/min) and the WhatsApp webhook (60 req/min)',
      'CI matrix running Biome, TypeScript and the full test suite on Node 22 and 24',
      'WhatsApp webhooks verify HMAC signatures with a timing-safe comparison',
      'REST rejects unknown conversation ids with a 404 instead of creating state',
    ],
  },
  {
    version: '2.13',
    kind: 'minor',
    date: 'September 9, 2026',
    tag: 'v2.13.0',
    summary:
      'The assistant arrives. A single provider-agnostic core, exposed over REST, Telegram and WhatsApp, with optional Prisma-backed conversation memory.',
    highlights: [
      'Provider-agnostic agent client speaking the OpenAI-compatible chat completions protocol',
      'Assistant service with sessions, history, reset and a pluggable conversation store',
      'REST adapter: POST /chat plus GET and DELETE /sessions/:id, with an optional auth guard',
      'Telegram adapter with long polling and per-chat session ids',
      'WhatsApp Cloud API adapter with webhook verification and message handling',
      'Streaming (SSE) deliberately deferred; the core stays request/response',
    ],
  },
  {
    version: '2.2',
    kind: 'minor',
    date: 'September 4, 2026',
    tag: 'v2.2.1',
    summary:
      'Adapters for the frontend frameworks, a first-class SEO module and a config layer — still with no runtime dependencies beyond dates.',
    highlights: [
      'Vue 3 composable useKatanaFetch bridging Safe Results to reactive data, error and loading',
      'Nuxt/Nitro helpers useUnwrap, useSafeResponse and useEventResponse',
      'Site config and pure SEO helpers with HTML and JSON-LD breakout protection',
      'RSS service generating raw XML, usable directly from Astro GET endpoints',
      'Astro adapter for getStaticPaths with typed path params',
      'Pure ESM exports map with per-adapter subpaths',
    ],
  },
  {
    version: '2.0',
    kind: 'major',
    date: 'September 3, 2026',
    tag: 'v2.0.0',
    summary:
      'The rewrite that shaped everything since: hexagonal layers, one convention for every method and no side effects on import.',
    highlights: [
      'Reorganized into types, core/services, infrastructure, adapters, config and prisma',
      'Every public method follows the use* convention',
      'Barrel exports per layer, safe to tree-shake',
      'No side effects on import; SSR-safe infrastructure adapters',
      'Safe Result { ok, data, error } instead of thrown errors',
      'Only @js-temporal/polyfill as a runtime dependency',
    ],
  },
];
