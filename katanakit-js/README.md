# `katanakit-js`

A sharp, framework-agnostic TypeScript service toolkit organized with hexagonal architecture.

## Installation

```bash
npm install katanakit-js
# or
bun add katanakit-js
# or
bun add katanakit-js
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

Pin a version in production (e.g. `@2.14.2/+esm`). There is no IIFE/UMD build.

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

## HTTP Client — API Manager

The core of KatanaKit is a **typed, registry-based HTTP client**. You register
your APIs once, then fetch by name — the client builds URLs, handles serialization,
and returns a **Safe Result** (`{ ok, data, error }`) that never throws on HTTP errors.

### 1. Register your APIs

```ts
import { useInitApis } from "katanakit-js";

useInitApis({
  // A public REST API
  jsonplaceholder: {
    baseUri: "https://jsonplaceholder.typicode.com",
    endpoints: {
      posts: "/posts",
      postById: "/posts/:id",
    },
    // Applied automatically to specific endpoints (overridable per-call)
    defaultQueryParams: {
      posts: { _limit: 10 },
    },
  },

  // Your own backend
  myApi: {
    baseUri: "https://api.myapp.com/v1",
    endpoints: {
      users: "/users",
      userById: "/users/:id",
      createUser: "/users",
    },
  },
});
```

### 2. GET — list and read

```ts
import { useGetApi } from "katanakit-js";

// List (uses defaultQueryParams: _limit=10)
const list = await useGetApi<{ id: number; title: string }[]>("jsonplaceholder", "posts");
if (list.ok) console.log(list.data);

// Read by ID — :id is replaced by params
const post = await useGetApi<{ title: string }>("jsonplaceholder", "postById", {
  params: { id: 1 },
});
if (post.ok) console.log(post.data.title);

// Override default query params
const filtered = await useGetApi("jsonplaceholder", "posts", {
  query: { _limit: 5, userId: 1 },
});
```

### 3. POST, PUT, PATCH, DELETE

```ts
import { usePost, usePut, usePatch, useDelete } from "katanakit-js";

// POST — body is auto-serialized to JSON
const created = await usePost<{ id: number }>("myApi", "createUser", {
  name: "Alice",
  email: "alice@example.com",
});

// PUT — full replacement (body + path params)
const updated = await usePut("myApi", "userById", { name: "Bob" }, { params: { id: 42 } });

// PATCH — partial update
const patched = await usePatch("myApi", "userById", { name: "Charlie" }, { params: { id: 42 } });

// DELETE
const deleted = await useDelete("myApi", "userById", { params: { id: 42 } });
```

### 4. Auth tokens — inject headers per call

There's no global interceptor — pass `headers` directly. This keeps things explicit and testable.

```ts
const result = await useFetch("myApi", "users", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});
```

### 5. Error handling — the Safe Result pattern

Every fetch returns `{ ok, data, error, status, url }`. No try/catch needed for HTTP failures.

```ts
const result = await useGetApi("myApi", "userById", { params: { id: 99999 } });

if (result.ok) {
  // result.data is typed
  console.log(result.data);
} else {
  // result.error is always structured
  console.log(result.error.status);   // 404
  console.log(result.error.message);  // "HTTP Error: Not Found"
  console.log(result.error.details);  // parsed response body (if any)
  console.log(result.url);            // the URL that was called
}
```

### 6. Build URLs without fetching

`useBuildUrl` constructs a full URL from your registered APIs **without making
a request**. Use it to generate links, image sources, or pass URLs to libraries
that handle their own fetching.

#### Generate navigation links

```ts
import { useBuildUrl } from "katanakit-js";

// Build a download link
const downloadUrl = useBuildUrl("myApi", "export", {
  query: { format: "pdf", lang: "es" },
});
// → "https://api.myapp.com/v1/export?format=pdf&lang=es"

// Use in a template
<a href={downloadUrl}>Download PDF</a>
```

#### Generate image/file URLs

```ts
// Build an image URL for <img src>
const avatarUrl = useBuildUrl("myApi", "userAvatar", {
  params: { id: 42 },
  query: { size: "large" },
});
// → "https://api.myapp.com/v1/users/42/avatar?size=large"

<img src={avatarUrl} alt="User avatar" />
```

#### Pass to third-party libraries

```ts
// Charts, maps, analytics — libraries that fetch their own data
const chartDataUrl = useBuildUrl("myApi", "analytics", {
  query: { range: "7d", metric: "visits" },
});
new Chart(canvas, { data: chartDataUrl });
```

#### Debug before fetching

```ts
// See the full URL before making the request
console.log("Will fetch:", useBuildUrl("myApi", "users", {
  query: { page: 1, per_page: 20 },
}));
// → "https://api.myapp.com/v1/users?page=1&per_page=20"
```

#### SSR: construct URLs server-side

```ts
// In Astro, Next.js, or Nuxt server code
const apiUrl = useBuildUrl("notion", "database", {
  params: { id: "db-123" },
});
// Pass to client component or pre-render
```

### 7. FormData and raw bodies

`usePost`/`usePut`/`usePatch` auto-detect `FormData`, `Blob`, `URLSearchParams`,
`ArrayBuffer`, `ReadableStream`, and `string` — these are sent as-is without
forcing `Content-Type: application/json`.

```ts
const form = new FormData();
form.append("file", blob);
await usePost("myApi", "upload", form);
```

### Full example

See [`examples/api-manager/demo.ts`](https://github.com/senseikatana/katanakit/tree/main/examples/api-manager) for a runnable demo
covering all CRUD operations, auth injection, URL building, and error handling
against a real API (JSONPlaceholder).

## QueryClient — Cached Data Fetching

The QueryClient is a data-fetching and caching layer built on the reactive kernel.
It integrates with the API manager — your `queryFn` typically calls `useGetApi` or
`useFetch` and returns the Safe Result.

```ts
import { QueryClient, useQueryClient } from "katanakit-js";
import { useGetApi } from "katanakit-js";

// Initialize once (global singleton).
const qc = useQueryClient();

// Fetch with cache, stale-while-revalidate, retry, and dedup.
const pokemon = await qc.fetchQuery<Pokemon>({
  queryKey: ["pokemon", 25],
  queryFn: () => useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id: 25 } }),
  staleTime: 60_000,      // Cache is fresh for 60s.
  retry: 3,                // Retry 3 times on failure.
  refetchOnWindowFocus: true,
});
```

### Vue composables

```vue
<script setup>
import { useQuery, useMutation, useQueryClient } from "katanakit-js/adapters/vue";
import { useGetApi, usePost } from "katanakit-js";

const qc = useQueryClient();

const { data, isLoading, error, refetch } = useQuery({
  queryKey: () => ["users"],
  queryFn: () => useGetApi<User[]>("myApi", "users"),
  staleTime: 30_000,
});

const { mutate, isLoading: mutating } = useMutation({
  mutationFn: (name: string) => usePost("myApi", "createUser", { name }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
});
</script>
```

### Generic watch

```ts
import { useKatanaWatch } from "katanakit-js/adapters/vue";

const stop = useKatanaWatch(newProduct, () => checkValidations(), { deep: true });
```

- **Generic source** — ref, reactive object, getter function or array of sources.
- **`deep: true` by default** — nested mutations re-trigger the callback.
- **Schema-agnostic validation** — works with Zod, Valibot, Standard Schema or custom validators.
- **Nuxt-ready** — re-exported from `katanakit-js/adapters/nuxt`.

### Features

- **Cache with GC** — unused queries are garbage-collected after `cacheTime` (default: 5 min).
- **Stale-while-revalidate** — returns cached data immediately, refetches in background.
- **Retry with exponential backoff** — configurable `retry` count and `retryDelay`.
- **Deduplication** — concurrent requests for the same key share a single fetch.
- **Query invalidation** — `invalidateQueries` marks queries stale and refetches active ones.
- **Direct cache updates** — `setQueryData` for optimistic updates.
- **Prefetch** — `prefetchQuery` anticipates user actions.

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

### When to use Kitt

Kitt is a **lightweight, zero-dependency** wrapper for OpenAI-compatible APIs.
Use it when you need:

- **One-shot chat** — ask a question, get an answer (`useChat`)
- **Tool-calling agents** — autonomous loops that read/write/run (`useRunAgent`)
- **Session-aware bots** — REST, Telegram, WhatsApp channels (`useReply`)

### When to use alternatives

| Need | Use instead |
|------|------------|
| Streaming token-by-token | [Vercel AI SDK](https://sdk.vercel.ai) |
| RAG with embeddings | [LangChain.js](https://js.langchain.com) |
| Multi-agent orchestration | [CrewAI](https://github.com/crewAIInc/crewAI) |
| Full chatbot framework | [Botpress](https://botpress.com) |

Kitt stays small (0 dependencies) because it does one thing well:
**chat completions with tool calls, using any OpenAI-compatible endpoint.**

### Low-level API

```ts
import { useInitAgent, useChat, useRunAgent } from "katanakit-js";
import fs from "node:fs/promises";

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

Then start a channel (see below). Copy keys from [`.env.example`](https://github.com/senseikatana/katanakit/blob/main/.env.example):

```env
DASHSCOPE_API_KEY=
PORT=3000
HOST=localhost
KITT_CHANNEL=rest
TELEGRAM_BOT_TOKEN=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
DATABASE_URL=
```

### Run standalone (this repo)

| Script | Starts |
|--------|--------|
| `bun run assistant:dev` | REST assistant. Uses Prisma when `DATABASE_URL` is set. |
| `bun run telegram:dev` | Telegram long polling. Requires `TELEGRAM_BOT_TOKEN`. |
| `bun run whatsapp:dev` | WhatsApp webhook. Requires `WHATSAPP_*`. |
| `bun run assistant:demo` | Demo in `examples/assistant/`. Set `KITT_CHANNEL=rest\|telegram\|whatsapp`. |

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
5. Run `bun run telegram:dev` (long polling, no public URL).
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
5. Run `bun run whatsapp:dev`.
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

[`examples/assistant/`](https://github.com/senseikatana/katanakit/tree/main/examples/assistant) is a generic digital assistant with two demo tools:
`readFile` on `knowledge-base.md` and `saveNote` to `notes.jsonl`.

```bash
bun run assistant:demo
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
import { useRequest } from "katanakit-js/adapters/vue";   // Vue only
import { useUnwrap } from "katanakit-js/adapters/nuxt";         // Nuxt only
```

```html
<!-- vanilla -->
<script type="module">
  import { useLogger } from "https://cdn.jsdelivr.net/npm/katanakit-js/+esm";
</script>
```

See [Getting Started](https://senseikatana.com/katanakit-js/docs/guides/getting-started/) for full recipes.

## Framework Adapters

| Adapter | Import | Description |
|---------|--------|-------------|
| **Express** | `katanakit-js/adapters/express` | Reference server with CORS and hardened headers |
| **Nuxt** | `katanakit-js/adapters/nuxt` | `useUnwrap`, `useSafeResponse`, `useEventResponse` |
| **Vue** | `katanakit-js/adapters/vue` | `useRequest` composable with reactivity |
| **Astro** | `katanakit-js` or `katanakit-js/adapters/astro` | `AstroService`, `RssService` |
| **Assistant** | `katanakit-js/adapters/assistant` | REST digital assistant (`useStartAssistant`) |
| **Telegram** | `katanakit-js/adapters/telegram` | BotFather bot (`useInitTelegram`, `useStartTelegramPolling`) |
| **WhatsApp** | `katanakit-js/adapters/whatsapp` | Meta Cloud API (`useInitWhatsApp`, `useStartWhatsApp`) |

## REST API Adapters

Typed adapters for popular REST APIs with auth, pagination helpers, and full TypeScript types.
All functions return `FetchResult<T>` — the same Safe Result pattern used by the HTTP client.

| Adapter | Import | Description |
|---------|--------|-------------|
| **Notion** | `katanakit-js/adapters/notion` | Pages, databases, blocks, search with cursor pagination |
| **WordPress** | `katanakit-js/adapters/wordpress` | Posts, pages, media, categories, tags, comments, users, batch ops |

### Notion

The Notion adapter wraps the official [Notion API](https://developers.notion.com/reference) with
full TypeScript types, cursor-based auto-pagination, and Safe Results.

#### Setup

```ts
import { useInitNotion } from "katanakit-js/adapters/notion";

// Token starts with "ntn_" or "secret_" — get one at https://www.notion.so/my-integrations
useInitNotion({ token: process.env.NOTION_TOKEN });
```

#### Pages — read, create, update, archive

```ts
import {
  useNotionGetPage,
  useNotionCreatePage,
  useNotionUpdatePage,
  useNotionArchivePage,
} from "katanakit-js/adapters/notion";

// Get a single page with all its properties
const page = await useNotionGetPage("page-id");
if (page.ok) console.log(page.data.properties);

// Create a page inside a database
const created = await useNotionCreatePage(
  { type: "database_id", database_id: "db-id" },
  {
    Name: { title: [{ type: "text", text: { content: "My Task" } }] },
    Status: { select: { name: "To Do" } },
  },
);

// Create a child page with content blocks
const child = await useNotionCreatePage(
  { type: "page_id", page_id: "parent-id" },
  { title: { title: [{ type: "text", text: { content: "Child Page" } }] } },
  [{ type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: "Hello!" } }] } }],
);

// Update page properties (only changed fields)
await useNotionUpdatePage("page-id", {
  Status: { select: { name: "Done" } },
  DueDate: { date: { start: "2025-12-31" } },
});

// Archive (soft-delete) a page
await useNotionArchivePage("page-id");
```

#### Databases — query, create, update schema

```ts
import {
  useNotionGetDatabase,
  useNotionQueryDatabase,
  useNotionCreateDatabase,
  useNotionUpdateDatabase,
  useNotionListAllDatabasePages,
} from "katanakit-js/adapters/notion";

// Inspect database schema (property names, types, options)
const schema = await useNotionGetDatabase("db-id");
if (schema.ok) {
  Object.entries(schema.data.properties).forEach(([name, prop]) => {
    console.log(`${name}: ${prop.type}`);
  });
}

// Query with filter + sort (single page of results)
const page1 = await useNotionQueryDatabase("db-id", {
  filter: { property: "Status", select: { equals: "Published" } },
  sorts: [{ property: "Date", direction: "descending" }],
  page_size: 10,
});

// Get ALL pages (auto-pagination — handles cursors internally)
const all = await useNotionListAllDatabasePages("db-id");

// With filter + sort
const published = await useNotionListAllDatabasePages(
  "db-id",
  { property: "Status", select: { equals: "Published" } },
  [{ property: "Date", direction: "descending" }],
);

// Create a new database
await useNotionCreateDatabase(
  { type: "page_id", page_id: "parent-id" },
  [{ type: "text", text: { content: "My Tasks" } }],
  {
    Name: { title: {} },
    Status: { select: { options: [{ name: "To Do" }, { name: "Done" }] } },
    Priority: { select: { options: [{ name: "Low" }, { name: "High" }] } },
  },
);

// Rename a database
await useNotionUpdateDatabase("db-id", [
  { type: "text", text: { content: "Renamed Database" } },
]);
```

#### Blocks — read, write, append, delete page content

```ts
import {
  useNotionGetBlock,
  useNotionGetBlockChildren,
  useNotionListAllBlockChildren,
  useNotionAppendBlocks,
  useNotionUpdateBlock,
  useNotionDeleteBlock,
} from "katanakit-js/adapters/notion";

// Get ALL blocks of a page (auto-pagination)
const blocks = await useNotionListAllBlockChildren("page-id");
if (blocks.ok) {
  blocks.data.forEach(b => console.log(b.type)); // "paragraph", "heading_1", etc.
}

// Manual pagination (for fine-grained cursor control)
const page = await useNotionGetBlockChildren("page-id", { page_size: 50 });
if (page.ok) {
  console.log(page.data.results);    // blocks
  console.log(page.data.has_more);   // true if more pages exist
  console.log(page.data.next_cursor); // pass as start_cursor for next page
}

// Append content blocks to a page
await useNotionAppendBlocks("page-id", [
  {
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content: "New Section" } }] },
  },
  {
    type: "paragraph",
    paragraph: { rich_text: [{ type: "text", text: { content: "Body text here." } }] },
  },
  {
    type: "to_do",
    to_do: {
      rich_text: [{ type: "text", text: { content: "Checklist item" } }],
      checked: false,
    },
  },
]);

// Update a block's content
await useNotionUpdateBlock("block-id", {
  paragraph: { rich_text: [{ type: "text", text: { content: "Updated text" } }] },
});

// Delete (archive) a block
await useNotionDeleteBlock("block-id");
```

#### Search — find pages and databases by keyword

```ts
import { useNotionSearchContent } from "katanakit-js/adapters/notion";

// Search everything
const found = await useNotionSearchContent({ query: "meeting notes" });

// Search only databases
const dbs = await useNotionSearchContent({
  query: "tasks",
  filter: { value: "database", property: "object" },
});

// Search only pages, sorted by recently edited
const pages = await useNotionSearchContent({
  filter: { value: "page", property: "object" },
  sort: { direction: "descending", timestamp: "last_edited_time" },
});
```

#### Users — workspace members

```ts
import { useNotionGetUser, useNotionListUsers } from "katanakit-js/adapters/notion";

// Get a specific user (from page.created_by.id or page.last_edited_by.id)
const user = await useNotionGetUser("user-id");
if (user.ok) console.log(user.data.name);

// List all workspace members + bots
const users = await useNotionListUsers();
if (users.ok) users.data.results.forEach(u => console.log(u.name));
```

#### Framework examples

| Framework | Example | Description |
|-----------|---------|-------------|
| **Vue 3** | [`examples/notion/vue-blog.vue`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/vue-blog.vue) | Blog listing with `useQuery` composable |
| **Vue 3** | [`examples/notion/vue-post.vue`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/vue-post.vue) | Single post view |
| **Nuxt 3** | [`examples/notion/nuxt-blog.vue`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/nuxt-blog.vue) | SSR blog listing with `useAsyncData` |
| **Nuxt 3** | [`examples/notion/nuxt-post.vue`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/nuxt-post.vue) | SSR single post view |
| **Astro** | [`examples/notion/astro-blog.astro`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/astro-blog.astro) | Static blog listing |
| **Astro** | [`examples/notion/astro-[slug].astro`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/astro-[slug].astro) | Dynamic `[slug]` route |
| **Next.js** | [`examples/notion/next-blog.tsx`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/next-blog.tsx) | Server component blog listing |
| **Next.js** | [`examples/notion/next-[slug].tsx`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/next-[slug].tsx) | Dynamic `[slug]` page |
| **Node.js** | [`examples/notion/demo.ts`](https://github.com/senseikatana/katanakit/tree/main/examples/notion/demo.ts) | Runnable demo covering all Notion operations |

### WordPress

The WordPress adapter wraps the [WordPress REST API](https://developer.wordpress.org/rest-api/)
with full CRUD for posts, pages, media, categories, tags, comments, users, custom post types,
and batch operations. All functions return `FetchResult<T>`.

#### Setup

```ts
import { useInitWordPress } from "katanakit-js/adapters/wordpress";

// Application Passwords (recommended) — WP Admin → Users → Your Profile → Application Passwords
useInitWordPress({
  baseUrl: "https://mysite.com",
  auth: { type: "application-passwords", username: "admin", password: "xxxx xxxx xxxx" },
});

// JWT tokens
useInitWordPress({
  baseUrl: "https://mysite.com",
  auth: { type: "jwt", token: "eyJhbGci..." },
});

// Nonce-based (for WP themes)
useInitWordPress({
  baseUrl: "https://mysite.com",
  auth: { type: "nonce", nonce: "abc123" },
});
```

#### Posts — CRUD, search, pagination

```ts
import {
  useWpGetPosts,
  useWpGetPost,
  useWpCreatePost,
  useWpUpdatePost,
  useWpDeletePost,
  useWpListAllPosts,
  useWpSearchAllPosts,
  useWpFindPostBySlug,
} from "katanakit-js/adapters/wordpress";

// List published posts (paginated)
const posts = await useWpGetPosts({
  per_page: 5,
  status: "publish",
  orderby: "date",
  order: "desc",
});

// Get a single post with embedded resources
const post = await useWpGetPost(42, { _embed: true });
if (post.ok) console.log(post.data.title.rendered);

// Create a post
await useWpCreatePost({
  title: "My New Post",
  content: "<p>Hello World!</p>",
  status: "publish",  // "draft" | "pending" | "publish"
  categories: [1, 3],
  tags: [5, 8],
});

// Update a post
await useWpUpdatePost(42, { title: "Updated Title", status: "publish" });

// Delete (trash or permanent)
await useWpDeletePost(42);        // move to trash
await useWpDeletePost(42, true);  // permanently delete

// Get ALL posts (auto-pagination — loops until exhausted)
const all = await useWpListAllPosts({ status: "publish" });
if (all.ok) console.log(`Total: ${all.data.length}`);

// Search ALL posts by keyword
const found = await useWpSearchAllPosts("tutorial");
if (found.ok) found.data.forEach(p => console.log(p.title.rendered));

// Find post by slug (for dynamic routes like /blog/:slug)
const bySlug = await useWpFindPostBySlug("hello-world");
if (bySlug.ok && bySlug.data) console.log(bySlug.data.title.rendered);
```

#### Pages — static content CRUD

```ts
import {
  useWpGetPages,
  useWpGetPage,
  useWpCreatePage,
  useWpUpdatePage,
  useWpDeletePage,
} from "katanakit-js/adapters/wordpress";

const pages = await useWpGetPages({ per_page: 20 });

const page = await useWpGetPage(10);
if (page.ok) console.log(page.data.title.rendered);

await useWpCreatePage({
  title: "About Us",
  content: "<p>Welcome to our site!</p>",
  status: "publish",
  parent: 0, // top-level page (set a page ID for child pages)
});

await useWpUpdatePage(10, { title: "Updated About" });
await useWpDeletePage(10); // trash
```

#### Media — upload, list, update, delete

```ts
import {
  useWpGetMedia,
  useWpGetMediaItem,
  useWpUploadMedia,
  useWpUpdateMedia,
  useWpDeleteMedia,
} from "katanakit-js/adapters/wordpress";

// List media items
const media = await useWpGetMedia({ per_page: 20, media_type: "image" });

// Get a single media item
const item = await useWpGetMediaItem(42);
if (item.ok) console.log(item.data.source_url);

// Upload from browser (File from <input type="file">)
const file = document.querySelector("input[type=file]").files[0];
const uploaded = await useWpUploadMedia(file, {
  title: "My Image",
  alt_text: "Description for accessibility",
  caption: "Image caption",
});
if (uploaded.ok) console.log(uploaded.data.source_url); // URL to use in content

// Upload from Node.js (Buffer)
import fs from "node:fs";
const buffer = fs.readFileSync("photo.jpg");
await useWpUploadMedia(buffer, { title: "Photo" });

// Update media metadata
await useWpUpdateMedia(42, { alt_text: "New alt text", caption: "Updated caption" });

// Delete media
await useWpDeleteMedia(42, true); // permanent
```

#### Categories and Tags — taxonomy management

```ts
import {
  useWpGetCategories, useWpGetCategory, useWpCreateCategory,
  useWpUpdateCategory, useWpDeleteCategory,
  useWpGetTags, useWpGetTag, useWpCreateTag,
  useWpUpdateTag, useWpDeleteTag,
} from "katanakit-js/adapters/wordpress";

// Categories
const cats = await useWpGetCategories({ per_page: 50 });
await useWpCreateCategory({ name: "Technology", slug: "tech", description: "Tech posts" });
await useWpUpdateCategory(5, { name: "Tech News" });
await useWpDeleteCategory(5);

// Tags
const tags = await useWpGetTags({ search: "javascript" });
await useWpCreateTag({ name: "TypeScript", slug: "typescript" });
await useWpUpdateTag(12, { name: "TS" });
await useWpDeleteTag(12);
```

#### Comments — moderation

```ts
import {
  useWpGetComments, useWpGetComment, useWpCreateComment,
  useWpUpdateComment, useWpDeleteComment,
} from "katanakit-js/adapters/wordpress";

// Get comments for a post
const comments = await useWpGetComments({ post: 42, per_page: 10 });

// Create a comment (public or authenticated)
await useWpCreateComment({
  post: 42,
  content: "Great article!",
  author_name: "John",
  author_email: "john@example.com",
});

// Update / delete
await useWpUpdateComment(7, { content: "Updated comment" });
await useWpDeleteComment(7);
```

#### Users — management

```ts
import {
  useWpGetUsers, useWpGetUser, useWpGetCurrentUser,
  useWpCreateUser, useWpUpdateUser, useWpDeleteUser,
} from "katanakit-js/adapters/wordpress";

const users = await useWpGetUsers({ roles: "editor" });
const me = await useWpGetCurrentUser(); // authenticated user

await useWpCreateUser({
  username: "johndoe",
  email: "john@example.com",
  password: "secure-password",
  roles: ["editor"],
});

await useWpUpdateUser(2, { name: "John Smith" });
await useWpDeleteUser(2, 1); // reassign content to user 1
```

#### Custom Post Types — generic CRUD

```ts
import {
  useWpGetCustomPosts, useWpGetCustomPost,
  useWpCreateCustomPost, useWpUpdateCustomPost, useWpDeleteCustomPost,
} from "katanakit-js/adapters/wordpress";

// Works with any registered CPT: "product", "portfolio", "event", etc.
const products = await useWpGetCustomPosts("product", { per_page: 10 });
const product = await useWpGetCustomPost("product", 15);

await useWpCreateCustomPost("product", {
  title: "Widget",
  content: "<p>A great widget</p>",
  status: "publish",
});

await useWpUpdateCustomPost("product", 15, { title: "Updated Widget" });
await useWpDeleteCustomPost("product", 15, true);
```

#### Batch Operations — multiple requests in one call

```ts
import { useWpBatch } from "katanakit-js/adapters/wordpress";

const result = await useWpBatch([
  { method: "GET", path: "/wp/v2/posts?per_page=2" },
  { method: "GET", path: "/wp/v2/pages?per_page=2" },
  { method: "GET", path: "/wp/v2/categories?per_page=5" },
]);

if (result.ok) {
  result.data.responses.forEach(resp => console.log(resp.status));
}
```

#### `_fields` — minimal payloads

Use `_fields` to request only the fields you need. This reduces payload size
significantly for list views.

```ts
// Only fetch id, title, link, slug, and date
const posts = await useWpGetPosts({
  per_page: 20,
  _fields: "id,title,link,slug,date",
});
```

#### `_embed` — embedded resources

Use `_embed` to include related resources (author, featured media, terms)
in a single request instead of making separate calls.

```ts
// Embed all related resources
const posts = await useWpGetPosts({ _embed: true });

// Embed only specific resources
const posts = await useWpGetPosts({
  _embed: "author,wp:featuredmedia",
});

// Access embedded data
if (posts.ok) {
  for (const post of posts.data) {
    const author = post._embedded?.author?.[0]?.name;
    const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    const thumbnail = post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.thumbnail?.source_url;
  }
}
```

#### ACF — Advanced Custom Fields

If your WordPress site uses [ACF](https://www.advancedcustomfields.com/), the adapter
handles ACF fields transparently. Access them via the `acf` property on any post, page,
media item, or custom post type entry.

```ts
// Request ACF fields explicitly with _fields
const posts = await useWpGetPosts({
  per_page: 5,
  _fields: "id,title,acf",
});

if (posts.ok) {
  for (const post of posts.data) {
    if (post.acf) {
      // ACF fields are dynamic — access by field name
      console.log(post.acf.my_field_name);
    }
  }
}

// Combine _fields + _embed + ACF for full-featured list views
const full = await useWpGetPosts({
  per_page: 5,
  _fields: "id,title,link,slug,date,acf",
  _embed: "author,wp:featuredmedia",
});
```

#### Framework examples

| Framework | Example | Description |
|-----------|---------|-------------|
| **Vue 3** | [`examples/wordpress/vue-blog.vue`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/vue-blog.vue) | Blog listing with categories, featured images, `_embed` |
| **Vue 3** | [`examples/wordpress/vue-post.vue`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/vue-post.vue) | Single post view with embedded author |
| **Nuxt 3** | [`examples/wordpress/nuxt-blog.vue`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/nuxt-blog.vue) | SSR blog listing with `useAsyncData` |
| **Nuxt 3** | [`examples/wordpress/nuxt-post.vue`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/nuxt-post.vue) | SSR single post view |
| **Astro** | [`examples/wordpress/astro-blog.astro`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/astro-blog.astro) | Static blog listing |
| **Astro** | [`examples/wordpress/astro-[slug].astro`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/astro-[slug].astro) | Dynamic `[slug]` route |
| **Next.js** | [`examples/wordpress/next-blog.tsx`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/next-blog.tsx) | Server component blog listing |
| **Next.js** | [`examples/wordpress/next-[slug].tsx`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/next-[slug].tsx) | Dynamic `[slug]` page |
| **Node.js** | [`examples/wordpress/demo.ts`](https://github.com/senseikatana/katanakit/tree/main/examples/wordpress/demo.ts) | Runnable demo covering all WP operations, `_fields`, `_embed`, ACF |

## Contributing

We welcome contributions from the community! Whether it's fixing a bug, adding
a feature, or improving documentation, every contribution helps make KatanaKit
better for everyone.

### Quick start

```bash
git clone https://github.com/senseikatana/katanakit.git
cd katanakit-js
git checkout dev
bun install
bun run check  # verify everything works
```

### Ways to contribute

- **Report bugs** — [Open an issue](https://github.com/senseikatana/katanakit/issues) with a clear description and reproduction steps
- **Suggest features** — [Start a discussion](https://github.com/senseikatana/katanakit/discussions) to propose new ideas
- **Submit a PR** — Fork the repo, create a branch from `dev`, make your changes, and open a PR
- **Improve docs** — Fix typos, add examples, or clarify explanations
- **Add adapters** — Build integrations for new APIs or frameworks

### PR guidelines

1. Branch from `dev` (not `main`)
2. Follow the `use*` naming convention
3. Add TypeScript types in `src/types/index.ts`
4. Run `bun run check` before submitting
5. Update `CHANGELOG.md` if the public API changed

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development contract.

## Documentation

The docs site is deployed with Render at [senseikatana.com/katanakit-js](https://senseikatana.com/katanakit-js/).

- [Getting Started](https://senseikatana.com/katanakit-js/docs/guides/getting-started/)
- [Architecture](https://senseikatana.com/katanakit-js/docs/guides/architecture/)
- [UI Kit (Katana UI)](https://senseikatana.com/katanakit-js/docs/ui-kit/)
- [API Reference](https://senseikatana.com/katanakit-js/docs/api/)
- [Roadmap](https://senseikatana.com/katanakit-js/docs/guides/roadmap/)
- [Changelog](https://senseikatana.com/katanakit-js/docs/changelog/)

## License

MIT
