---
title: Query Client
sidebar_position: 3
description: TanStack Query-like caching built on KatanaKit's reactive kernel. Cache, deduplicate, retry, and invalidate queries with zero external dependencies.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

`QueryClient` + `QueryCache` bring TanStack Query-style server-state management to KatanaKit — built entirely on the existing reactive kernel (`useCreateSignal`, `useCreateEffect`) and the API manager (`useFetch`, `useGetApi`, Safe Results). Zero external dependencies, framework-agnostic core, with first-class Vue composables.

## Why QueryClient?

When you call `useGetApi` directly, every invocation hits the network. In real apps you need:

- **Caching** — avoid redundant requests for the same data
- **Stale-while-revalidate** — show cached data instantly, refresh in the background
- **Deduplication** — multiple components requesting the same key share one fetch
- **Retry with backoff** — transient failures recover automatically
- **Invalidation** — mark data stale after mutations so it refetches
- **Garbage collection** — unused cache entries are cleaned up automatically

QueryClient gives you all of this with a minimal API that integrates directly with your existing `useGetApi` / `useFetch` calls and the Safe Result pattern.

---

## Quick Start

```ts
import { useQueryClient } from "katanakit-js";
import { useGetApi, useInitApis } from "katanakit-js";

useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});

const qc = useQueryClient();

// First call: fetches from network.
const pikachu = await qc.fetchQuery<Pokemon>({
  queryKey: ["pokemon", 25],
  queryFn: () => useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id: 25 } }),
  staleTime: 60_000, // fresh for 60 seconds
});

// Second call within 60s: returns cached data instantly (no network).
const cached = await qc.fetchQuery<Pokemon>({
  queryKey: ["pokemon", 25],
  queryFn: () => useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id: 25 } }),
  staleTime: 60_000,
});
```

The `queryFn` must return a `FetchResult<T>` (the Safe Result type). This is the same discriminated union that `useGetApi` and `useFetch` already return:

```ts
type FetchResult<T> =
  | { data: T; error: null; url: string; status: number; ok: true }
  | { data: null; error: ApiError; url: string; status: number; ok: false };
```

---

## QueryClient API

### `fetchQuery`

Fetches data for a query key. Returns cached data immediately if fresh, otherwise fetches from the network. In-flight requests are deduplicated automatically.

```ts
const data = await qc.fetchQuery<Pokemon>({
  queryKey: ["pokemon", 25],
  queryFn: () => useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id: 25 } }),
  staleTime: 30_000,
});
```

**Returns:** `Promise<T>` — the resolved data.

**Throws:** `ApiError` if the fetch fails after all retries.

### `prefetchQuery`

Same as `fetchQuery` but silently ignores errors. Use it to warm the cache anticipatorily (e.g., on hover, or in `getStaticPaths`).

```ts
await qc.prefetchQuery({
  queryKey: ["pokemon", 25],
  queryFn: () => useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id: 25 } }),
});
```

### `getQueryData`

Reads cached data for a query key without fetching. Returns `undefined` if the key is not in cache.

```ts
const pokemon = qc.getQueryData<Pokemon>(["pokemon", 25]);
// Pokemon | undefined
```

### `setQueryData`

Writes data directly into the cache. Useful for optimistic updates after a mutation.

```ts
// Set directly
qc.setQueryData<Pokemon>(["pokemon", 25], newPikachuData);

// Updater function (receives current data or undefined)
qc.setQueryData<Pokemon>(["pokemon", 25], (old) => ({
  ...old!,
  name: "pikachu-updated",
}));
```

### `invalidateQueries`

Marks matching queries as stale. The next `fetchQuery` call for those keys will refetch from the network. If a Vue composable is subscribed, it will trigger a background refetch automatically.

```ts
// Invalidate a specific query
await qc.invalidateQueries({ queryKey: ["pokemon", 25] });

// Invalidate all queries whose key starts with ["pokemon"]
await qc.invalidateQueries({ queryKey: ["pokemon"] });
```

### `removeQueries`

Removes a query from the cache entirely (data + state).

```ts
qc.removeQueries(["pokemon", 25]);
```

### `clear`

Clears the entire cache. All entries are removed and GC timers are cancelled.

```ts
qc.clear();
```

### `subscribe`

Subscribes to state changes for a specific query key. Returns an unsubscribe function. When the last subscriber unsubscribes, the entry is scheduled for garbage collection.

```ts
const unsubscribe = qc.subscribe<Pokemon>(["pokemon", 25], (state) => {
  console.log(state.status, state.data);
});

// Later:
unsubscribe();
```

### `cancelQueries`

Cancels an in-flight request for a query key by nullifying its internal fetch promise.

```ts
qc.cancelQueries(["pokemon", 25]);
```

### `getQueryState`

Returns the current `QueryState` for a key without subscribing.

```ts
const state = qc.getQueryState<Pokemon>(["pokemon", 25]);
// { status, data, error, isLoading, isSuccess, isError, isStale, dataUpdatedAt, ... }
```

---

## Singleton Helpers

```ts
import { useQueryClient, useInitQueryClient } from "katanakit-js";

// Get or create the global singleton (lazy, default options)
const qc = useQueryClient();

// Initialize with custom defaults (must be called before any useQuery)
const qc = useInitQueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## Configuration

### `QueryConfig` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `queryKey` | `QueryKey` | **required** | Serializable array that uniquely identifies the query. Objects are sorted-key serialized. |
| `queryFn` | `() => Promise<FetchResult<T>>` | **required** | Fetcher function. Must return a Safe Result. |
| `staleTime` | `number` | `0` | Milliseconds before cached data is considered stale. `Infinity` = never stale. |
| `cacheTime` | `number` | `300000` (5 min) | Milliseconds to keep unused data in cache before GC. |
| `retry` | `number` | `3` | Number of retry attempts on failure. |
| `retryDelay` | `number` | `1000` | Base delay in ms for exponential backoff. Capped at 30s. |
| `refetchOnWindowFocus` | `boolean` | `true` | Refetch when the browser tab regains focus. |
| `refetchOnReconnect` | `boolean` | `true` | Refetch when the network reconnects. |
| `enabled` | `boolean` | `true` | Whether the query runs automatically. Set `false` to disable. |
| `onSuccess` | `(data: T) => void` | — | Callback on successful fetch. |
| `onError` | `(error: ApiError) => void` | — | Callback on error. |

### `QueryClientConfig`

```ts
interface QueryClientConfig {
  defaultOptions?: {
    queries?: Partial<Omit<QueryConfig, "queryKey" | "queryFn">>;
  };
}
```

Set defaults once via `useInitQueryClient` — individual `fetchQuery` calls override them.

---

## Vue Composables

The `katanakit-js/adapters/vue` subpath exports reactive composables that wrap the QueryClient with Vue 3 reactivity. All state properties are `Ref<T>` and update automatically.

### `useQuery`

Reactive query composable. Subscribes to the QueryClient, watches the reactive `queryKey`, and cleans up on unmount.

```vue
<script setup lang="ts">
import { useQuery } from "katanakit-js/adapters/vue";
import { useGetApi, useInitApis } from "katanakit-js";
import { ref } from "vue";

useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});

const pokemonId = ref(25);

const { data, isLoading, error, isStale, status, refetch } = useQuery<Pokemon>({
  queryKey: () => ["pokemon", pokemonId.value],
  queryFn: () =>
    useGetApi<Pokemon>("pokeapi", "pokemonById", {
      params: { id: pokemonId.value },
    }),
  staleTime: 60_000,
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <h1>{{ data?.name }}</h1>
    <span v-if="isStale">(refreshing...)</span>
    <button @click="refetch">Refresh</button>
  </div>
</template>
```

#### Reactive query keys

The `queryKey` is a `MaybeRef<QueryKey>` — use a getter function so it re-evaluates when dependencies change. The composable watches the key and refetches automatically:

```ts
// Refetches when pokemonId changes
const { data } = useQuery({
  queryKey: () => ["pokemon", pokemonId.value],
  queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id: pokemonId.value } }),
});
```

#### Conditional queries

Pass `enabled: false` (or a reactive ref) to prevent automatic fetching:

```ts
const enabled = ref(false);

const { data } = useQuery({
  queryKey: ["pokemon", 25],
  queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } }),
  enabled, // reactive — fetches when enabled becomes true
});
```

#### Return type

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Ref<T \| null>` | Resolved data on success, `null` otherwise. |
| `error` | `Ref<ApiError \| null>` | Error on failure, `null` otherwise. |
| `isLoading` | `Ref<boolean>` | `true` while fetching. |
| `isSuccess` | `Ref<boolean>` | `true` when data is available. |
| `isError` | `Ref<boolean>` | `true` on error. |
| `isStale` | `Ref<boolean>` | `true` when cached data is stale. |
| `status` | `Ref<QueryStatus>` | `"idle" \| "loading" \| "success" \| "error"`. |
| `refetch` | `() => Promise<void>` | Manually refetch (forces `staleTime: 0`). |

### `useMutation`

Mutation composable for POST/PUT/PATCH/DELETE operations. Does not cache — returns a `mutate` function.

```vue
<script setup lang="ts">
import { useMutation, useQueryClient } from "katanakit-js/adapters/vue";
import { usePost, useInitApis } from "katanakit-js";

useInitApis({
  myApi: {
    baseUri: "https://api.example.com",
    endpoints: { users: "/users" },
  },
});

const qc = useQueryClient();

const { mutate, isLoading, isSuccess, error, reset } = useMutation<
  { id: number; name: string },
  { name: string }
>({
  mutationFn: (vars) => usePost("myApi", "users", { name: vars.name }),
  onSuccess: (data) => {
    // Invalidate the users list so it refetches
    qc.invalidateQueries({ queryKey: ["users"] });
  },
  onError: (err) => {
    console.error("Failed to create user:", err.message);
  },
});
</script>

<template>
  <form @submit.prevent="mutate({ name: 'Ash' })">
    <button :disabled="isLoading">
      {{ isLoading ? "Creating..." : "Create User" }}
    </button>
    <p v-if="isSuccess">User created!</p>
    <p v-if="error">{{ error.message }}</p>
    <button @click="reset" type="button">Reset</button>
  </form>
</template>
```

#### Optimistic updates with `setQueryData`

Combine `useMutation` with `setQueryData` for instant UI updates:

```ts
const { mutate } = useMutation({
  mutationFn: (newTodo: { title: string }) =>
    usePost("myApi", "todos", newTodo),
  onSuccess: (createdTodo) => {
    qc.setQueryData<Todo[]>(["todos"], (old) => [...(old ?? []), createdTodo]);
  },
});
```

#### Return type

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Ref<TData \| null>` | Data from the last mutation. |
| `error` | `Ref<ApiError \| null>` | Error from the last mutation. |
| `isLoading` | `Ref<boolean>` | `true` while the mutation is in flight. |
| `isSuccess` | `Ref<boolean>` | `true` after a successful mutation. |
| `isError` | `Ref<boolean>` | `true` after a failed mutation. |
| `status` | `Ref<MutationStatus>` | `"idle" \| "loading" \| "success" \| "error"`. |
| `mutate` | `(vars: TVariables) => Promise<void>` | Execute the mutation. |
| `reset` | `() => void` | Reset all state to idle. |

---

## Architecture

### Reactive Kernel Integration

QueryClient is built on the same reactive primitives as the rest of KatanaKit:

```
┌──────────────────────────────────────────────────┐
│                   Vue Composables                │
│            useQuery  ·  useMutation              │
│     (watch, shallowRef, onUnmounted)             │
└───────────────────┬──────────────────────────────┘
                    │ subscribes / reads
┌───────────────────▼──────────────────────────────┐
│                 QueryClient                       │
│  fetchQuery · invalidateQueries · setQueryData   │
│  subscribe · prefetchQuery · removeQueries       │
└───────────────────┬──────────────────────────────┘
                    │ owns entries
┌───────────────────▼──────────────────────────────┐
│                 QueryCache                        │
│  Map<hash, QueryEntry>  ·  GC scheduling         │
└───────────────────┬──────────────────────────────┘
                    │ calls queryFn
┌───────────────────▼──────────────────────────────┐
│              API Manager                          │
│  useGetApi · useFetch · Safe Results              │
└──────────────────────────────────────────────────┘
```

### Cache Lifecycle

1. **Idle** — entry created, no fetch yet
2. **Loading** — `queryFn` is executing (possibly retrying)
3. **Success** — data is cached, `dataUpdatedAt` is set
4. **Error** — all retries exhausted, `errorUpdatedAt` is set

When data becomes **stale** (past `staleTime`), the next `fetchQuery` triggers a background refetch while returning the stale data immediately (stale-while-revalidate).

### Stale-While-Revalidate

```
t=0s    fetchQuery(["pokemon", 1])  → network fetch → cache fresh data
t=30s   fetchQuery(["pokemon", 1])  → returns cached data immediately (still fresh, staleTime=60s)
t=65s   fetchQuery(["pokemon", 1])  → returns stale cached data + triggers background refetch
                                       → observer notified when fresh data arrives
```

### Deduplication

Multiple concurrent calls to `fetchQuery` with the same key share a single in-flight request. The `fetchPromise` is stored on the entry and all callers await the same promise.

### Retry with Exponential Backoff

Failed requests retry up to `retry` times (default 3) with exponential delay:

| Attempt | Delay (default `retryDelay=1000`) |
|---------|-----------------------------------|
| 0 → 1   | 1s                                |
| 1 → 2   | 2s                                |
| 2 → 3   | 4s                                |

Delay is capped at 30 seconds. Formula: `min(baseDelay × 2^attempt, 30_000)`.

### Garbage Collection

When the last subscriber for a query unsubscribes, a GC timer starts (default 5 minutes). If no new subscriber attaches before the timer fires, the entry is removed from cache. `setQueryData` and `fetchQuery` cancel pending GC.

---

## Comparison with TanStack Query

| Feature | KatanaKit QueryClient | TanStack Query |
|---------|----------------------|----------------|
| Caching | Yes | Yes |
| Stale-while-revalidate | Yes | Yes |
| Deduplication | Yes | Yes |
| Retry with backoff | Yes (exponential, capped 30s) | Yes (exponential) |
| Query invalidation | Yes (prefix matching) | Yes (predicate/exact) |
| Optimistic updates | Yes (`setQueryData`) | Yes |
| Garbage collection | Yes (configurable `cacheTime`) | Yes (`gcTime`) |
| Window focus refetch | Yes | Yes |
| Network reconnect refetch | Yes | Yes |
| Prefetching | Yes | Yes |
| Vue composables | Yes (`useQuery`, `useMutation`) | Yes (`@tanstack/vue-query`) |
| React/Svelte/Solid hooks | Not yet | Yes |
| External dependencies | **Zero** | `@tanstack/query-core` |
| Safe Result integration | Built-in (`FetchResult<T>`) | Not applicable |
| Framework-agnostic core | Yes (`QueryClient` class) | Yes (`QueryClient` class) |
| Devtools | Not yet | Yes |
| Infinite queries | Not yet | Yes |
| Dependent queries | Via `enabled` flag | Via `enabled` flag |

**When to use QueryClient:** you want TanStack Query semantics without adding a dependency, and your app is already built on KatanaKit's API manager and Safe Results.

**When to use TanStack Query:** you need infinite queries, Suspense integration, or the React/Svelte/Solid ecosystem and devtools.

---

## Next Steps

- [Getting Started](/docs/guides/getting-started) — full KatanaKit walkthrough
- [Architecture](/docs/guides/architecture) — hexagonal layout and layer design
- [API Reference](/docs/api) — auto-generated from source
