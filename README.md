# `katanakit-js`

A sharp, framework-agnostic TypeScript service toolkit organized with hexagonal architecture.

## Installation

```bash
npm install katanakit-js
# or
bun add katanakit-js
# or
yarn add katanakit-js
```

### CDN (ESM)

In the browser, use jsDelivr **`/+esm`** so named exports and dependencies resolve:

```html
<script type="module">
  import { useLogger, useGetApi, useInitApis } from "https://cdn.jsdelivr.net/npm/katanakit-js/+esm";
  useLogger("ready");
</script>
```

| CDN | URL |
|-----|-----|
| **jsDelivr `/+esm`** (recommended) | `https://cdn.jsdelivr.net/npm/katanakit-js/+esm` |
| **esm.sh** | `https://esm.sh/katanakit-js` |
| **Raw ESM file** | `https://cdn.jsdelivr.net/npm/katanakit-js/dist/index.js` (needs bundler or import map) |

Pin a version in production (e.g. `@2.8.0/+esm`). There is no IIFE/UMD build.

## Quick Start

```ts
import { useInitApis, useGetApi, useLogger } from "katanakit-js";

useLogger("boot");

// Register your APIs once
useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});

// Fetch with Safe Result — no try/catch needed for HTTP failures
const result = await useGetApi<{ name: string }>("pokeapi", "pokemonById", {
  params: { id: 25 },
});

if (result.ok) {
  console.log(result.data.name); // "pikachu"
} else {
  console.error(result.error.message);
}
```

## Features

- **Safe Results** — HTTP (and other fallible) operations return `{ data, error, ok }` instead of throwing
- **Zero side effects** — importing any module is safe. No `fetch` calls, no `console.log`, no storage writes
- **Hexagonal architecture** — pure core, infrastructure adapters, framework adapters
- **Tree-shakeable** — destructured re-exports from Singleton facades
- **SSR-safe** — all infrastructure adapters guard or fall back gracefully in server environments

## AI assistant (Kitt)

`katanakit-js` ships a zero-dependency, provider-agnostic AI assistant and agent
built on the OpenAI-compatible protocol (works with DashScope, OpenAI, and any
compatible endpoint). It uses native `fetch`, so no SDK is required.

Use the **low-level API** for one-shot chat and tool loops. Use **`useInitAssistant` / `useReply`**
when you want sessions, persistence, and channels (REST, Telegram, WhatsApp). Fallible calls
follow the Safe Result pattern: they **never throw**. Check `result.ok` and read `result.data`
or `result.error`.

### Low-level API

```ts
import { useInitAgent, useChat, useRunAgent } from "katanakit-js";

// Register once. apiKey falls back to process.env.DASHSCOPE_API_KEY.
useInitAgent({ model: "qwen3.8-max" });

// Assistant — single-shot review / question.
const review = await useChat([
  { role: "user", content: "Summarize the benefits of solar energy in three bullet points." },
]);
if (review.ok) console.log(review.data);

// Agent — autonomous tool-calling loop that can act (read/write/run).
const result = await useRunAgent("Fix the type errors in src/", {
  tools: [
    {
      name: "readFile",
      description: "Returns file contents",
      parameters: { type: "object", properties: { path: { type: "string" } } },
      execute: ({ path }) => fs.readFile(path, "utf8"),
    },
  ],
  maxSteps: 12,
});
```

- **Kitt preset** — `KITT_SYSTEM_PROMPT`, `kittPreset`, `KITT_BASE_URL`, and `KITT_DEFAULT_MODEL` (`qwen3.8-max`)
  are exported as sensible defaults. Override via `useInitAgent({ systemPrompt, model, baseUrl })`.
- **Safe Results** — `useChat` and `useRunAgent` return `{ data, error, ok }`, never throw.
- **Tools** — each tool is `{ name, description, parameters (JSON Schema), execute(input) }`.

### Use from another project

```bash
npm i katanakit-js express dotenv
```

```ts
import "dotenv/config";
import { useInitAssistant, useReply } from "katanakit-js";

useInitAssistant({
  // apiKey      — process.env.DASHSCOPE_API_KEY
  // baseUrl     — KITT_BASE_URL
  // model       — "qwen3.8-max"
  // systemPrompt — KITT_SYSTEM_PROMPT
  // store       — in-memory (useCreateMemoryStore)
  // tools       — AiTool[]
  // maxSteps    — number
});

const result = await useReply(undefined, "What are your hours?");
if (result.ok) {
  console.log(result.data.reply, result.data.sessionId);
} else {
  console.error(result.error.message);
}
```

`useReply(sessionId | undefined, text)` creates a session when `sessionId` is omitted. Pass
`result.data.sessionId` on later turns.

Also on the main barrel:

| Helper | Signature |
|--------|-----------|
| `useCreateSession` | `(channel?) => Promise<string>` |
| `useGetHistory` | `(sessionId) => Promise<AiMessage[]>` |
| `useResetSession` | `(sessionId) => Promise<void>` |
| `useCreateMemoryStore` | `() => ConversationStore` |

Then start a channel (see below). Copy keys from [`.env.example`](.env.example):

```env
DASHSCOPE_API_KEY=
PORT=3000
HOST=localhost
KITT_CHANNEL=rest
TELEGRAM_BOT_TOKEN=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
DATABASE_URL=
```

### Run standalone (this repo)

| Script | Starts |
|--------|--------|
| `yarn assistant:dev` | REST assistant. Uses Prisma when `DATABASE_URL` is set. |
| `yarn telegram:dev` | Telegram long polling. Requires `TELEGRAM_BOT_TOKEN`. |
| `yarn whatsapp:dev` | WhatsApp webhook. Requires `WHATSAPP_*`. |
| `yarn assistant:demo` | Demo in `examples/assistant/`. Set `KITT_CHANNEL=rest\|telegram\|whatsapp`. |

### REST

```ts
import { useStartAssistant, useCreateAssistantRouter } from "katanakit-js/adapters/assistant";

useStartAssistant(); // port?, host?, mountPath = "/assistant", options?
// or mount useCreateAssistantRouter() on an existing Express app
```

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/assistant/chat` | `{ sessionId?, message }` | `{ ok, data: { reply, sessionId }, error }` |
| `GET` | `/assistant/sessions/:id` | — | `{ sessionId, messages }` or `404` |
| `DELETE` | `/assistant/sessions/:id` | — | `204` or `404` |

The endpoints are **public by default**. In production pass an auth guard (applied to every
route). Unknown session ids return `404`, and `useReply` rejects a `sessionId` that does not exist.

```ts
useStartAssistant(3000, "localhost", "/assistant", {
  guard: (req, res, next) =>
    req.header("authorization") === `Bearer ${process.env.ASSISTANT_API_KEY}`
      ? next()
      : res.status(401).end(),
});
```

```bash
curl -X POST http://localhost:3000/assistant/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What are your hours?"}'
```

#### Rate limiting

POST `/chat` and POST `/whatsapp/webhook` are rate-limited by default (20 req/min and 60 req/min per IP). Override via the router options:

```ts
app.use("/assistant", useCreateAssistantRouter({
  rateLimit: rateLimit({ windowMs: 60_000, max: 30 }),
}));
```

### Telegram (BotFather)

Long polling does not need a public URL. Session ids are `telegram:<chatId>`.

```ts
import { useInitTelegram, useStartTelegramPolling } from "katanakit-js/adapters/telegram";

useInitTelegram({ token: process.env.TELEGRAM_BOT_TOKEN });
await useStartTelegramPolling();
```

1. Open Telegram, talk to [@BotFather](https://t.me/BotFather).
2. Send `/newbot` — choose a name and a username.
3. Copy the token.
4. Set `TELEGRAM_BOT_TOKEN`.
5. Run `yarn telegram:dev` (long polling, no public URL).
6. Optional webhook: expose HTTPS and call `useHandleTelegramUpdate(update)` on inbound updates.

### WhatsApp (Meta Cloud API)

Webhook: `GET` / `POST` `/whatsapp/webhook`. Session ids are `wa:<phone>`.

```ts
import { useInitWhatsApp, useStartWhatsApp } from "katanakit-js/adapters/whatsapp";

useInitWhatsApp({
  token: process.env.WHATSAPP_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  appSecret: process.env.WHATSAPP_APP_SECRET,
});
useStartWhatsApp();
```

1. Create a Meta Business account and an app.
2. Add the WhatsApp product.
3. Copy the temporary or permanent token, the Phone number ID, and the **App Secret**.
4. Set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, and `WHATSAPP_APP_SECRET`.
5. Run `yarn whatsapp:dev`.
6. Expose public HTTPS (Cloudflare Tunnel or ngrok) to `GET`/`POST` `/whatsapp/webhook`.
7. In Meta, set the webhook URL and verify token; subscribe to `messages`.

Inbound deliveries are verified against `X-Hub-Signature-256` (HMAC-SHA256 of the raw body
with your App Secret) and rejected with `401` when the signature is missing or invalid. The
webhook acks `200` immediately and processes replies asynchronously to avoid Meta retries.
POST `/webhook` is rate-limited to 60 req/min per IP; at most 5 messages are processed per
webhook payload (cost-amplification guard).

`useVerifyWhatsAppWebhook`, `useVerifyWhatsAppSignature`, and `useHandleWhatsAppMessage` are the same handlers if you mount the webhook on your own server.

### Persistence

Memory by default (`useCreateMemoryStore()`). History is lost on process restart.

Prisma when `DATABASE_URL` is set:

```ts
import { useInitAssistant } from "katanakit-js";
import { useCreatePrismaStore, PrismaConversationStore } from "katanakit-js/prisma";

useInitAssistant({ store: useCreatePrismaStore() });
// or: { store: PrismaConversationStore }
```

Models `Conversation` and `Message` are already in `src/prisma/schema.prisma`. If the consumer
owns the database, run `prisma contract emit` then `prisma db init` in that app.

### Real use case

[`examples/assistant/`](examples/assistant/) is a generic digital assistant with two demo tools:
`readFile` on `knowledge-base.md` and `saveNote` to `notes.jsonl`.

```bash
yarn assistant:demo
# KITT_CHANNEL=rest|telegram|whatsapp
```

Replace the system prompt, `knowledge-base.md`, and the tool `execute()` functions with your
product FAQ, CRM, or ticket system. Keep the `{ name, description, parameters, execute }` shape.

## Framework usage

All common `use*` helpers (`useLogger`, `useInitApis`, `useGetApi`, formatter, dates, utils, theme, …) are on the **main barrel** `katanakit-js`.

### Astro (npm)

```astro
---
// Frontmatter = server
import { useLogger, useGetApi, useInitApis } from "katanakit-js";
useInitApis({ /* ... */ });
const result = await useGetApi("pokeapi", "pokemonById", { params: { id: 25 } });
---
<script>
  // Client script — Vite bundles the same package
  import { useLogger } from "katanakit-js";
  useLogger("client");
</script>
```

### Astro (CDN client)

```astro
<script is:inline type="module">
  import { useLogger } from "https://cdn.jsdelivr.net/npm/katanakit-js/+esm";
  useLogger("cdn");
</script>
```

### Vue / Nuxt / vanilla

```ts
import { useLogger, useInitApis, useGetApi } from "katanakit-js";
import { useKatanaFetch } from "katanakit-js/adapters/vue";   // Vue only
import { useUnwrap } from "katanakit-js/adapters/nuxt";         // Nuxt only
```

```html
<!-- vanilla -->
<script type="module">
  import { useLogger } from "https://cdn.jsdelivr.net/npm/katanakit-js/+esm";
</script>
```

See [Getting Started](https://senseikatana.github.io/katanakit-js/docs/guides/getting-started) for full recipes.

## Framework Adapters

| Adapter | Import | Description |
|---------|--------|-------------|
| **Express** | `katanakit-js/adapters/express` | Reference server with CORS and hardened headers |
| **Nuxt** | `katanakit-js/adapters/nuxt` | `useUnwrap`, `useSafeResponse`, `useEventResponse` |
| **Vue** | `katanakit-js/adapters/vue` | `useKatanaFetch` composable with reactivity |
| **Astro** | `katanakit-js` or `katanakit-js/adapters/astro` | `AstroService`, `RssService` |
| **Assistant** | `katanakit-js/adapters/assistant` | REST digital assistant (`useStartAssistant`) |
| **Telegram** | `katanakit-js/adapters/telegram` | BotFather bot (`useInitTelegram`, `useStartTelegramPolling`) |
| **WhatsApp** | `katanakit-js/adapters/whatsapp` | Meta Cloud API (`useInitWhatsApp`, `useStartWhatsApp`) |

## Documentation

- [Getting Started](https://senseikatana.github.io/katanakit-js/docs/guides/getting-started)
- [Architecture](https://senseikatana.github.io/katanakit-js/docs/guides/architecture)
- [API Reference](https://senseikatana.github.io/katanakit-js/docs/api)
- [Roadmap](https://senseikatana.github.io/katanakit-js/docs/guides/roadmap)
- [Changelog](https://senseikatana.github.io/katanakit-js/docs/changelog)

## License

MIT
