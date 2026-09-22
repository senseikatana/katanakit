---
title: Query Client
sidebar_position: 3
description: TanStack Query Core, bundled with KatanaKit. Cache, deduplicate, retry, invalidate and refetch server state with the Safe Result pattern.
---

import Tabs from '@docusaurus/Tabs';
import TabItem from '@docusaurus/TabItem';

KatanaKit bundles [TanStack Query Core](https://tanstack.com/query) as a dependency — you install `katanakit-js` and the engine comes with it, no extra install. KatanaKit re-exports the full `@tanstack/query-core` API and adds:

- **Framework bindings** (`useQuery` / `useMutation`) for React, Vue, Solid, Svelte and Angular, returning TanStack's native result object (`isPending`, `isFetching`, `isSuccess`, `isError`, `data`, `error`, `status`, `refetch`, …).
- **`useSafeQueryFn`** — bridges KatanaKit's Safe Result (`{ data, error, ok }`) to TanStack's throw-on-error `queryFn`.

Everything TanStack gives you is available: stale-while-revalidate, focus/reconnect refetch, retries with exponential backoff, request deduplication, garbage collection, infinite queries, optimistic updates and devtools.

## Quick start

```tsx
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/react";
import { useGetApi, useInitApis } from "katanakit-js";

useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});

function Pokemon({ id }: { id: number }) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["pokemon", id],
    queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id } })),
    staleTime: 60_000,
  });

  if (isPending) return <div>Loading…</div>;
  if (isError) return <div>{error.message}</div>;
  return <div>{data?.name}</div>;
}
```

`useSafeQueryFn` unwraps the Safe Result: on `ok: false` it throws `error`, so TanStack can retry and surface it through `error` / `isError`.

## The shared client

All adapters share one module-level `QueryClient` unless you pass your own:

```ts
import { useQueryClient, useInitQueryClient } from "katanakit-js";

// Configure the shared client once (defaults for every query).
useInitQueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 2, refetchOnWindowFocus: true },
  },
});

// Access it anywhere to invalidate, prefetch, set data, …
const qc = useQueryClient();
await qc.invalidateQueries({ queryKey: ["pokemon"] });
```

Pass a scoped client as the second argument when you need isolation (e.g. tests):

```ts
import { QueryClient } from "katanakit-js";

const client = new QueryClient();
useQuery({ queryKey: ["a"], queryFn: fetchA }, client);
```

On the **server** (SSR), don't use the module singleton — create one client per request with `useCreateQueryClient()` and dehydrate/hydrate around the request, otherwise cached data can leak across users:

```ts
import { useCreateQueryClient, dehydrate } from "katanakit-js";

const client = useCreateQueryClient();
await client.prefetchQuery({ queryKey, queryFn });
const state = dehydrate(client); // ship to the client and hydrate()
```

## useQuery

The returned object is TanStack's native `QueryObserverResult`:

| Field | Type | Meaning |
| --- | --- | --- |
| `data` | `T \| undefined` | Last successful data. |
| `error` | `TError \| null` | Last error. |
| `isPending` | `boolean` | No data yet (first load). |
| `isFetching` | `boolean` | A request is in flight (first load **or** background refetch). |
| `isLoading` | `boolean` | `isPending && isFetching`. |
| `isSuccess` / `isError` | `boolean` | Derived from `status`. |
| `isStale` | `boolean` | Data is older than `staleTime`. |
| `status` | `"pending" \| "error" \| "success"` | Query status. |
| `fetchStatus` | `"fetching" \| "paused" \| "idle"` | Fetch activity (separate from status). |
| `refetch` | `() => Promise<…>` | Manually refetch. |

Use `isPending` for "no data yet" and `isFetching` for "a background refetch is running" — that's what makes stale-while-revalidate work without blanking your UI.

<Tabs>
<TabItem value="react" label="React">

```tsx
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/react";

const query = useQuery({
  queryKey: ["pokemon", id],
  queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id } })),
});
// query.data, query.isPending, query.isError, query.error, query.status…
```

</TabItem>
<TabItem value="vue" label="Vue">

```vue
<script setup>
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/vue";

const query = useQuery({
  queryKey: ["pokemon", id],
  queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id } })),
});
// query.data, query.isPending, query.isError, query.status (reactive)
</script>
```

</TabItem>
<TabItem value="solid" label="Solid">

```tsx
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/solid";

const query = useQuery(() => ({
  queryKey: ["pokemon", id()],
  queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: id() } })),
}));
// query.data, query.isPending, query.isError… (reactive store)
```

</TabItem>
<TabItem value="svelte" label="Svelte">

```svelte
<script lang="ts">
  import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/svelte";

  const query = useQuery({
    queryKey: ["pokemon", 25],
    queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
  });
</script>

{#if $query.isPending}
  <div>Loading…</div>
{:else}
  <div>{$query.data?.name}</div>
{/if}
```

</TabItem>
<TabItem value="angular" label="Angular">

```ts
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/angular";

readonly query = useQuery({
  queryKey: ["pokemon", 25],
  queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
});
// query.data(), query.isPending(), query.isError()… (signals)
```

</TabItem>
</Tabs>

## useMutation

Mutations run a `mutationFn` and expose `isPending`, `data`, `error`, `mutate`, `reset`:

<Tabs>
<TabItem value="react" label="React">

```tsx
import { useMutation, useQueryClient } from "katanakit-js/adapters/react";
import { usePost } from "katanakit-js";

function CreateUser() {
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (name: string) => usePost("api", "createUser", { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  return <button disabled={isPending} onClick={() => mutate("Ada")}>Create</button>;
}
```

</TabItem>
<TabItem value="vue" label="Vue">

```vue
<script setup>
import { useMutation, useQueryClient } from "katanakit-js/adapters/vue";
import { usePost } from "katanakit-js";

const qc = useQueryClient();
const mutation = useMutation({
  mutationFn: (name: string) => usePost("api", "createUser", { name }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
});
</script>

<template>
  <button :disabled="mutation.isPending" @click="mutation.mutate('Ada')">Create</button>
</template>
```

</TabItem>
<TabItem value="solid" label="Solid">

```tsx
import { useMutation, useQueryClient } from "katanakit-js/adapters/solid";

const qc = useQueryClient();
const mutation = useMutation(() => ({
  mutationFn: (name: string) => usePost("api", "createUser", { name }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
}));
```

</TabItem>
<TabItem value="svelte" label="Svelte">

```svelte
<script lang="ts">
  import { useMutation, useQueryClient } from "katanakit-js/adapters/svelte";

  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (name: string) => usePost("api", "createUser", { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
</script>

<button disabled={$mutation.isPending} on:click={() => $mutation.mutate("Ada")}>Create</button>
```

</TabItem>
<TabItem value="angular" label="Angular">

```ts
import { useMutation, useQueryClient } from "katanakit-js/adapters/angular";

private readonly qc = useQueryClient();
readonly mutation = useMutation({
  mutationFn: (name: string) => usePost("api", "createUser", { name }),
  onSuccess: () => this.qc.invalidateQueries({ queryKey: ["users"] }),
});
```

</TabItem>
</Tabs>

## Framework-free (vanilla TS)

Not every runtime is a framework. `katanakit-js/adapters/vanilla` returns the raw
`QueryObserver`, so you own the subscribe/render loop — for DOM, canvas, a CLI, a
worker, a terminal UI:

```ts
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/vanilla";
import { useGetApi } from "katanakit-js";

const observer = useQuery({
  queryKey: ["pokemon", 25],
  queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
});

const render = () => {
  const { data, isPending, isFetching, isError, error } = observer.getCurrentResult();
  // paint `data` / `isPending` / `error` wherever you want
};

const unsubscribe = observer.subscribe(render); // starts fetching
render(); // paint the current state immediately

// later
unsubscribe();
observer.destroy();
```

The framework adapters are exactly this plus a reactivity bridge. See
[`examples/query/`](https://github.com/senseikatana/katanakit/tree/dev/katanakit-js/examples/query)
for a runnable vanilla walkthrough plus React, Vue, Solid, Svelte and Angular demos.

## The engine, re-exported

The full `@tanstack/query-core` surface is re-exported from `katanakit-js`, so you can use the engine directly — `QueryClient`, `QueryObserver`, `MutationObserver`, `focusManager`, `onlineManager`, `dehydrate` / `hydrate`, `QueryCache`, `MutationCache`, and every type:

```ts
import {
  QueryClient,
  QueryObserver,
  focusManager,
  onlineManager,
  dehydrate,
  hydrate,
  keepPreviousData,
} from "katanakit-js";
```

Need the TanStack devtools? Install `@tanstack/query-devtools` and point it at `useQueryClient()` — the cache is the standard TanStack one.
