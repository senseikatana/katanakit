# Query examples

Framework-free and per-framework demos for the query layer. The engine is
**TanStack Query Core** (bundled with `katanakit-js`), so every example uses the
same cache, retries, stale-while-revalidate and invalidation — only the
reactivity bridge changes.

| Example                            | Entry point                     | Reactivity                              |
| ---------------------------------- | ------------------------------- | --------------------------------------- |
| [`vanilla.ts`](./vanilla.ts)       | `katanakit-js/adapters/vanilla` | you own the loop (`observer.subscribe`) |
| [`react.tsx`](./react.tsx)         | `katanakit-js/adapters/react`   | `useSyncExternalStore` (hooks)          |
| [`vue.vue`](./vue.vue)             | `katanakit-js/adapters/vue`     | `shallowReactive` object                |
| [`solid.tsx`](./solid.tsx)         | `katanakit-js/adapters/solid`   | fine-grained store                      |
| [`svelte.svelte`](./svelte.svelte) | `katanakit-js/adapters/svelte`  | `Readable` store (`$query`)             |
| [`angular.ts`](./angular.ts)       | `katanakit-js/adapters/angular` | one signal per field                    |

Run the vanilla one (no framework, no network — it uses a fake API). It imports
the built package, so build once first:

```bash
bun run build
bun run examples/query/vanilla.ts
```

The Vue and Svelte files need their own compiler; the React, Solid and Angular
ones are plain components to drop into an app. The `.ts`/`.tsx` files are
type-checked on demand, deliberately **outside** `bun run check`:

```bash
bun run examples:check
```

## The helpers (what each one is for)

All of them are exported from the main barrel **and** from every adapter subpath,
so `import { useQuery, useQueryClient, useSafeQueryFn } from "katanakit-js/adapters/react"`
is a complete, independent entry point.

### `useQuery` / `useMutation`

The framework binding. Returns TanStack's native result object:

- **Query** — `data`, `error`, `isPending`, `isFetching`, `isSuccess`, `isError`, `isStale`, `status`, `fetchStatus`, `refetch`.
- **Mutation** — `data`, `error`, `variables`, `isPending`, `isSuccess`, `isError`, `isIdle`, `status`, `mutate`, `reset`.

`isPending` means "no data yet"; `isFetching` means "a request is in flight"
(including background refetches). Use them separately — that is what makes
stale-while-revalidate not blank your UI.

### `useSafeQueryFn(fn)`

Bridges KatanaKit's **Safe Result** into TanStack's throw-on-error `queryFn`.

KatanaKit's `useGetApi` / `useFetch` never throw — they return
`{ data, error, ok }`. TanStack expects `queryFn` to resolve with data and
**throw** on failure (so it can retry and expose `error`). This adapter does the
conversion, and forwards TanStack's `AbortSignal` so cancellation works:

```ts
import { useSafeQueryFn, useGetApi, useFetch } from "katanakit-js";

// Simple: unwrap the Safe Result.
queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id } }));

// With cancellation: forward TanStack's signal into the request.
queryFn: useSafeQueryFn(({ signal }) =>
	useFetch("pokeapi", "pokemonById", { method: "GET", urlOptions: { params: { id } }, signal }),
);
```

### `useQueryClient()`

Returns the **shared `QueryClient` singleton** — the cache every adapter uses by
default. Reach for it to invalidate, prefetch, read or write cache entries:

```ts
const qc = useQueryClient();
await qc.invalidateQueries({ queryKey: ["pokemon"] });
await qc.prefetchQuery({ queryKey: ["pokemon", 25], queryFn });
qc.setQueryData(["pokemon", 25], { id: 25, name: "pikachu" });
```

It is a **browser** default. On the server a process-global cache would leak
data across requests — use `useCreateQueryClient()` there instead.

### `useInitQueryClient(config)`

Configures the shared singleton **once** (default options for every query), and
clears the previous client's caches before replacing it:

```ts
useInitQueryClient({
	defaultOptions: {
		queries: { staleTime: 60_000, retry: 2, refetchOnWindowFocus: true },
		mutations: { retry: 0 },
	},
});
```

Call it at app bootstrap. Do **not** call it per request on the server (it is a
global mutation and concurrent requests would race).

### `useCreateQueryClient(config?)`

Creates a **fresh, isolated `QueryClient`**. Use it to:

- **SSR** — one client per request, then `dehydrate` / `hydrate`.
- **Tests** — no cache bleeding between test cases.
- **Widgets / multi-tenant** — an isolated cache for a subtree.

Pass it as the last argument to any adapter:

```ts
const client = useCreateQueryClient();
useQuery({ queryKey, queryFn }, client);
```

### Vanilla (no framework)

`katanakit-js/adapters/vanilla` returns the raw `QueryObserver` / `MutationObserver`.
The framework adapters are exactly this plus a reactivity bridge — here you are
the bridge (DOM, canvas, CLI, worker…):

```ts
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/vanilla";

const observer = useQuery({
	queryKey: ["pokemon", 25],
	queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
});

const render = () => {
	const { data, isPending, isError, error, isFetching } = observer.getCurrentResult();
	// paint it however you want
};

const unsubscribe = observer.subscribe(render);
render(); // paint the current state immediately
```

See [`vanilla.ts`](./vanilla.ts) for a full runnable walkthrough: lifecycle,
cache hits, `invalidateQueries` → automatic refetch, mutation, teardown.

## Notes

- **One shared cache.** Every adapter uses the same singleton by default, so
  cached data is shared across frameworks in the same app.
- **`client` is stable.** The adapters capture the client for the component's
  lifetime — pass a stable instance.
- **Reactive keys.** React (deps on the serialized key), Vue (`computed` options)
  and Solid (getter options) refetch automatically when the key changes. Svelte
  (store created once) and Angular (options captured at first call) need an
  explicit `refetch()` or `{#key}` / re-creation.
