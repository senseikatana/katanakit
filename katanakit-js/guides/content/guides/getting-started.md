---
title: Getting Started
sidebar_position: 1
description: Install KatanaKit and learn every service with real code examples.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide covers every service in `katanakit-js` with runnable examples.
Each section shows the API, a real-world usage, and the Safe Result pattern.

## Installation

```bash
npm install katanakit-js
# or
bun add katanakit-js
```

Only `@js-temporal/polyfill` is a runtime dependency. `express`, `cors`,
`dotenv` and `vue` are optional peer dependencies.

### CDN (ESM in the browser)

Prefer the **jsDelivr `/+esm`** build in the browser. It rewrites bare
dependencies (e.g. `@js-temporal/polyfill`) so named imports work without a
bundler or import map:

```html
<script type="module">
  import {
    useLogger,
    useInitApis,
    useGetApi,
  } from "https://cdn.jsdelivr.net/npm/katanakit-js/+esm";

  useLogger("KatanaKit loaded from CDN");
  useInitApis({
    pokeapi: {
      baseUri: "https://pokeapi.co/api/v2",
      endpoints: { pokemonById: "/pokemon/:id/" },
    },
  });
</script>
```

| CDN | URL (browser) | Notes |
|-----|---------------|--------|
| **jsDelivr `/+esm`** | `https://cdn.jsdelivr.net/npm/katanakit-js/+esm` | Recommended for `<script type="module">` |
| **esm.sh** | `https://esm.sh/katanakit-js` | Alternative ESM CDN |
| **Raw package file** | `https://cdn.jsdelivr.net/npm/katanakit-js/dist/index.js` | Needs a bundler or an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) for `@js-temporal/polyfill` |
| **unpkg** | `https://unpkg.com/katanakit-js/dist/index.js` | Same caveat as the raw file |

Pin a version in production (e.g. `katanakit-js@2.8.0/+esm`) instead of
floating `@latest`.

There is **no IIFE/UMD** build — only ESM (`"type": "module"`).

## Import entry points

```ts
// Main barrel — core helpers + Astro/RSS + SEO (tree-shakeable named exports)
import {
  useLogger,
  useInitApis,
  useGetApi,
  useFormatCurrency,
  useNow,
  useChunk,
  ThemeService,
  AstroService,
  RssService,
} from "katanakit-js";

// Optional narrower / framework-only subpaths
import { AstroService, RssService } from "katanakit-js/adapters/astro";
import { useUnwrap } from "katanakit-js/adapters/nuxt";
import { useRequest } from "katanakit-js/adapters/vue";
import { ServerExpress } from "katanakit-js/adapters/express";
```

Every public `use*` helper lives on the main barrel (`katanakit-js`). Express,
Nuxt, and Vue adapters stay on their subpaths because they pull optional peers.

## Use in any framework (especially Astro)

### Astro — frontmatter (server / SSG)

```astro
---
// src/pages/index.astro
import { useLogger, useInitApis, useGetApi, AstroService } from "katanakit-js";

useLogger("Building index page");

useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});

const result = await useGetApi<{ name: string }>("pokeapi", "pokemonById", {
  params: { id: 25 },
});
---

{result.ok ? <h1>{result.data.name}</h1> : <p>Failed to load</p>}
```

### Astro — client script with npm (Vite bundles it)

```astro
---
// no server imports required for this island
---
<button id="log-btn">Log</button>

<script>
  import { useLogger } from "katanakit-js";

  document.getElementById("log-btn")?.addEventListener("click", () => {
    useLogger("Clicked from Astro client script");
  });
</script>
```

### Astro — client script with jsDelivr CDN

Astro processes local `<script>` tags. For a **pure CDN** import, mark the
script as external so Astro does not rewrite it:

```astro
<button id="cdn-btn">Log via CDN</button>

<script is:inline type="module">
  import { useLogger, useInitApis, useGetApi } from "https://cdn.jsdelivr.net/npm/katanakit-js/+esm";

  useInitApis({
    pokeapi: {
      baseUri: "https://pokeapi.co/api/v2",
      endpoints: { pokemonById: "/pokemon/:id/" },
    },
  });

  document.getElementById("cdn-btn")?.addEventListener("click", async () => {
    useLogger("CDN click");
    const result = await useGetApi("pokeapi", "pokemonById", { params: { id: 25 } });
    useLogger(result.ok ? result.data : result.error);
  });
</script>
```

### Astro — islands (`client:*`)

In a Vue/React/Svelte island, import from npm like any other dependency:

```ts
// src/components/Pokemon.vue (used as <Pokemon client:load />)
import { useInitApis, useGetApi, useLogger } from "katanakit-js";
```

### Vue / Nuxt (brief)

```ts
// Vue SFC or Nuxt plugin / server route — main barrel
import { useLogger, useInitApis, useGetApi } from "katanakit-js";

// Nuxt-only helpers
import { useUnwrap } from "katanakit-js/adapters/nuxt";

// Vue reactivity wrapper around useGetApi
import { useRequest } from "katanakit-js/adapters/vue";
```

### Vanilla HTML

```html
<script type="module">
  import { useLogger, useFormatCurrency } from "https://cdn.jsdelivr.net/npm/katanakit-js/+esm";
  useLogger(useFormatCurrency({ amount: 9.99, currency: "EUR", locale: "es-ES" }));
</script>
```

---

## HTTP Client — `FetchApiManager`

The HTTP client registers your APIs once, then builds safe URLs and fetches
data with a discriminated union result.

### Register APIs

```ts
import { useInitApis } from "katanakit-js";
// Legacy alias: useInit (deprecated)

useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: {
      pokemonById: "/pokemon/:id/",
      pokemons: "/pokemon/",
    },
    defaultQueryParams: { pokemons: { limit: 20 } },
  },
  jsonplaceholder: {
    baseUri: "https://jsonplaceholder.typicode.com",
    endpoints: {
      posts: "/posts",
      postById: "/posts/:id",
    },
  },
});
```

### Build URLs

```ts
import { useBuildApiUrl } from "katanakit-js";
// Legacy alias: useBuildUrl (deprecated)

const url = useBuildApiUrl("pokeapi", "pokemonById", {
  params: { id: "pikachu" },
});
// => "https://pokeapi.co/api/v2/pokemon/pikachu/"
```

### GET with Safe Result

```ts
import { useGetApi } from "katanakit-js";
// Legacy alias: useGet (deprecated)

interface Pokemon {
  name: string;
  id: number;
  types: { type: { name: string } }[];
}

const result = await useGetApi<Pokemon>("pokeapi", "pokemonById", {
  params: { id: 25 },
});

if (result.ok) {
  console.log(result.data.name);   // "pikachu"
  console.log(result.data.types);  // [{ type: { name: "electric" } }]
} else {
  console.error(result.error.status, result.error.message);
}
```

### POST JSON

```ts
import { usePost } from "katanakit-js";

const result = await usePost("jsonplaceholder", "posts", {
  title: "Hello World",
  body: "My first post",
  userId: 1,
});

// result.ok === true, result.data has the created resource
```

### PUT and DELETE

```ts
import { usePut, useDelete } from "katanakit-js";

await usePut("jsonplaceholder", "postById", { title: "Updated" }, {
  params: { id: 1 },
});

await useDelete("jsonplaceholder", "postById", { params: { id: 1 } });
```

### The Safe Result type

Every fetch returns the same discriminated union:

```ts
type FetchResult<T> =
  | { data: T; error: null; url: string; status: number; ok: true }
  | { data: null; error: ApiError; url: string; status: number; ok: false };
```

This means you never need `try/catch` for HTTP errors. The `ok` field
discriminates the result, and TypeScript narrows the type automatically.

---

## Logger — `LoggerService`

```ts
import {
  useLogger,
  useLoggerClear,
  useLoggerTable,
} from "katanakit-js";

// Default level (log)
useLogger("Application started");

// Data + level always last
useLogger("Cache miss", { key: "user:42" }, "warn");
useLogger("Database timeout", { query: "SELECT * FROM users" }, "error");
useLogger("Something went wrong", undefined, "error");

// Helpers outside useLogger
useLoggerTable([{ name: "Pikachu", type: "Electric" }]);
useLoggerClear();
```

---

## Storage — `StorageService`

SSR-safe: when `window` is unavailable, an in-memory fallback is used.
Wrap request handlers with `useRunStorageScope` so values persist within a
request without leaking across SSR requests.

```ts
import {
  useSetStorage, useGetStorage, useRemoveStorage, useClearStorage, useRunStorageScope,
} from "katanakit-js";

await useRunStorageScope(() => {
  useSetStorage("user", { name: "John", role: "admin" });
  useSetStorage("theme", "dark");

  const user = useGetStorage<{ name: string; role: string }>("user");
  const theme = useGetStorage<string>("theme"); // "dark"

  useRemoveStorage("theme");
  useClearStorage();
});
```

---

## DOM — `DomService`

All methods are SSR-safe: they return `null`, `[]` or `false` when `document`
is unavailable.

```ts
import {
  useQuerySelector, useQuerySelectorAll, useAddClass, useRemoveClass,
  useToggleClass, useOn, useSetText, useSetHtml, useGetRoot,
} from "katanakit-js";

// Query elements
const btn = useQuerySelector<HTMLButtonElement>("button.submit");
const items = useQuerySelectorAll<HTMLElement>(".list-item");

// Class manipulation
const root = useGetRoot();
useAddClass(root!, "dark-mode");
useRemoveClass(root!, "dark-mode");
const isActive = useToggleClass(btn!, "active");

// Events (returns unsubscribe function)
const unsubscribe = useOn(btn!, "click", (e) => {
  console.log("Button clicked!", e.target);
});
// Later: unsubscribe();

// Content
useSetText(btn!, "Click me");
useSetHtml(btn!, "<strong>Bold</strong>");
```

---

## Reactive — `ReactiveService`

Lightweight signals with automatic dependency tracking.

```ts
import {
  useCreateSignal, useCreateEffect, useCreateMemo,
  useCreateToggle, useCreateStorageSignal, useCreateDebouncedSignal,
} from "katanakit-js";

// Basic signal
const [count, setCount] = useCreateSignal(0);
console.log(count()); // 0
setCount(5);
console.log(count()); // 5

// Effect (runs when dependencies change — pass signal getters)
useCreateEffect(() => {
  console.log("Count changed:", count());
}, [count]);

// Memo (derived value)
const doubled = useCreateMemo(() => count() * 2, [count]);

// Toggle
const [isOpen, { useToggle }] = useCreateToggle(false);
useToggle(); // isOpen() === true

// Storage-persisted signal
const [theme, setTheme] = useCreateStorageSignal("theme", "light");

// Debounced signal
const [search, setSearch] = useCreateDebouncedSignal("", 300);
```

---

## Formatter — `FormatterService`

```ts
import {
  useFormatNumber, useFormatCurrency,
  useCapitalize, useUpperCase, useLowerCase, useJsonStringify,
} from "katanakit-js";

useFormatNumber(1234567.89, "de-DE");
useFormatCurrency({ amount: 99.99, currency: "USD", locale: "en-US" });

useCapitalize("hello world");   // "Hello world"
useUpperCase("hello");          // "HELLO"
useLowerCase("HELLO");          // "hello"
useJsonStringify({ a: 1 });
```

---

## Converter — `ConverterService`

Decorates `FormatterService` with unit conversions.

```ts
import {
  useToCelsius, useToFahrenheit, useToMiles, useToKilos,
  useToCm, useToInches,
} from "katanakit-js";

useToCelsius(212);       // "100.00"
useToFahrenheit(100);    // "212.00"
useToMiles(10);          // ~"6.21" (km → miles)
useToKilos(10);          // pounds → kilos
useToCm(1);              // inches → cm
useToInches(2.54);       // cm → inches
```

---

## ErrorFactory — `ErrorFactoryService`

```ts
import {
  useBadRequest, useUnauthorized, useForbidden,
  useNotFound, useInternal, useCustom,
  type AppError,
} from "katanakit-js";

const err: AppError = useNotFound("User not found");
// { status: 404, message: "User not found", ... }

useBadRequest("Invalid email");
useUnauthorized("Token expired");
useForbidden("Insufficient permissions");
useInternal("Database error");
useCustom("Validation failed", 422);
```

---

## Generator — `GeneratorService`

```ts
import { useUuid, useSlugify, useNumericId, useToken, useHash } from "katanakit-js";
// Legacy alias: useEncrypt → useHash (PBKDF2, not encryption)

useUuid();                  // "550e8400-e29b-41d4-a716-446655440000"
useSlugify("Hello World!"); // "hello-world"
useNumericId();             // incremental integer
useToken();                 // 6-digit number (100000–999999)
await useHash("secret");    // "salt:pbkdf2Hex" (async PBKDF2-SHA512)
```

---

## Dates — `DatesService`

Uses the Temporal API via `@js-temporal/polyfill`.

```ts
import {
  useNow, useFormat, useAddDays, useIsBefore, useDiff, useLastDayOfMonth,
} from "katanakit-js";

const now = useNow();                 // "2026-09-06" (ISO PlainDate string)
useFormat(now, "en", { dateStyle: "medium" });

const future = useAddDays(now, 30);   // ISO date string
useIsBefore(now, future);             // true
useDiff(now, future);                 // "0 years, 0 months and 30 days"
useLastDayOfMonth(now);               // last day of month as ISO string
```

---

## Geometry — `GeometryUtils`

```ts
import { GeometryUtils } from "katanakit-js";

GeometryUtils.area.useCircle(5);              // "78.54"
GeometryUtils.perimeter.useCircle(5);         // "31.42"
GeometryUtils.volume.useSphere(3);            // "113.10"
GeometryUtils.area.useRectangle(5, 10, { unit: "cm" }); // "50.00 cm"
```

---

## Timing — `TimingService`

```ts
import {
  useDelay, useSetTimeout, useInterval,
  useDebounce, useThrottle, useRepeat, useRace,
} from "katanakit-js";

await useDelay(1000);

const { promise, cancel } = useSetTimeout(() => "done", 5000);
cancel(); // rejects promise with "Timeout cancelled"

const { stop } = useInterval(() => console.log("tick"), 1000);
stop();

const debouncedSearch = useDebounce((...args: unknown[]) => {
  const query = String(args[0] ?? "");
  void fetch(`/api/search?q=${query}`);
}, 300);

const throttledScroll = useThrottle(() => {
  console.log("scroll position updated");
}, 100);

await useRepeat(async (i) => console.log("retry", i), 3, 1000);

// Race a promise against a timeout (ms)
const value = await useRace(fetch("/api").then((r) => r.json()), 5000);
```

---

## Viewport — `ViewportService`

```ts
import {
  useMatchesMedia, useScrollTo, useScrollToElement, usePrefersReducedMotion,
} from "katanakit-js";

useMatchesMedia("(min-width: 768px)");
useScrollTo(0, 0); // x, y
useScrollToElement("#section-2");
usePrefersReducedMotion();
```

---

## Observer — `ObserverService`

```ts
import { ObserverService } from "katanakit-js";

const observer = ObserverService.getInstance();

observer.useCreate("reveal", (entry) => {
  if (entry.isIntersecting) {
    console.log("Element is visible!", entry.target);
  }
}, { threshold: 0.5 });

observer.useObserve("reveal", document.querySelector(".card")!);
observer.useObserveAll("reveal", ".lazy-img");
observer.useDisconnect("reveal");
// or: observer.useDisconnectAll();
```

---

## Worker — `WorkerService`

```ts
import { WorkerService } from "katanakit-js";

const workers = WorkerService.getInstance();

// One-shot: pure function + input (runs off-thread when Worker is available)
const result = await workers.useRun((n: number) => n * 2, 21);
console.log(result); // 42

// Named pool
workers.useCreatePool("square", (n: number) => n ** 2);
const squared = await workers.useRunPool<number, number>("square", 9);
workers.useTerminate("square");
```

---

## Theme — `ThemeService`

```ts
import { ThemeService } from "katanakit-js";

const theme = ThemeService.getInstance();

theme.useInitTheme({ defaultMode: "dark" });
theme.useSetThemeMode("light");
theme.useToggleTheme();      // toggles between light/dark
theme.useResetTheme();        // resets to system preference
```

---

## Astro Adapter — `AstroService`

```ts
// src/pages/blog/[slug].astro
import { AstroService } from "katanakit-js";

export async function getStaticPaths() {
  const { useGetStaticPaths } = AstroService.getInstance();

  return useGetStaticPaths(getCollection, "blog", {
    param: "slug",
    valueFrom: (entry) => entry.slug ?? entry.id,
    propsFrom: (entry) => entry.data,
  });
}
```

Safe Result style — no error escapes the route module:

```ts
const result = await useGetStaticPaths(getCollection, "blog");
if (!result.ok) {
  console.error(result.error.message, result.error.collectionName);
}
```

---

## RSS — `RssService`

```ts
// src/pages/rss.xml.ts
import { RssService } from "katanakit-js";
import { getCollection } from "astro:content";

const { useCreateRssEndpoint } = RssService.getInstance();

export const GET = useCreateRssEndpoint({
  title: "My Blog",
  description: "Posts about TypeScript",
  site: "https://example.com",
  items: async () => {
    const posts = await getCollection("blog");
    return posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/blog/${post.slug}/`,
      description: post.data.description,
    }));
  },
});
```

---

## SEO — `useSeoMeta` (HTML + Open Graph)

One flat object: site fields + **HTML meta** + **Facebook Open Graph**.
No Twitter / Apple / MS tags. Optional `Omit` for keys you never pass:

```ts
import { useSeoMeta, type UseSeoMetaOptions } from "katanakit-js";

const seo = useSeoMeta({
  site: "https://myblog.com",
  siteTitle: "My Blog",
  title: "My Post",
  description: "A great post",
  ogTitle: "My Post",
  ogDescription: "A great post",
  ogImage: "https://myblog.com/og.png",
  ogType: "article",
  canonical: "https://myblog.com/posts/my-post/",
} satisfies UseSeoMetaOptions);

// Narrow further if you want:
useSeoMeta({ title: "Home" } as UseSeoMetaOptions<"rss" | "nav">);
```

`title` = page title · `siteTitle` = brand.

---

## Nuxt Adapter

```ts
import { useInitApis, useGetApi } from "katanakit-js";
import { useUnwrap, useSafeResponse, useEventResponse } from "katanakit-js/adapters/nuxt";

// server/plugins/api.ts
useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});

// server/api/pokemon/[id].ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const result = await useGetApi("pokeapi", "pokemonById", { params: { id } });
  return useUnwrap(result, `Pokemon ${id}`);
});
```

---

## Vue Adapter

```ts
import { useInitApis } from "katanakit-js";
import { useRequest } from "katanakit-js/adapters/vue";

useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});
```

```vue
<script setup lang="ts">
import { useRequest } from "katanakit-js/adapters/vue";

const { data, error, loading, refetch } = useRequest<{ name: string }>(
  "pokeapi", "pokemonById", { params: { id: 25 } }
);
</script>

<template>
  <div v-if="loading">Loading…</div>
  <div v-else-if="error">{{ error.message }}</div>
  <div v-else>
    <h1>{{ data?.name }}</h1>
    <button @click="refetch">Refresh</button>
  </div>
</template>
```

---

## Express Server

```ts
import { ServerExpress } from "katanakit-js/adapters/express";

ServerExpress.getInstance().useStart(); // http://localhost:3000
```

---

## Next steps

- [Architecture](/docs/guides/architecture) — understand the hexagonal layout
- [API Reference](/docs/api) — auto-generated from source
- [Changelog](/docs/changelog) — what changed in each version
- [Roadmap](/docs/guides/roadmap) — what's coming next
