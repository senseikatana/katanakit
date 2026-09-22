---
title: Framework Adapters
sidebar_position: 4
description: Use KatanaKit's query client from React, Solid, Svelte, and Angular with native reactivity in each framework.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

KatanaKit ships first-class adapters for the major front-end frameworks. They wrap the same core [`QueryClient`](./query-client) and Safe Result pattern, but expose it with each framework's native reactivity:

- **React** — hooks with `useState` / `useEffect` (`katanakit-js/adapters/react`)
- **Solid** — fine-grained signals (`katanakit-js/adapters/solid`)
- **Svelte** — readable stores (`katanakit-js/adapters/svelte`)
- **Angular** — signals, injection-context aware (`katanakit-js/adapters/angular`)
- **Vue** — composables with `ref`/`shallowRef` (`katanakit-js/adapters/vue`)
- **Nuxt** — H3 server helpers (`katanakit-js/adapters/nuxt`)

Every adapter exposes the same surface: `useQuery`, `useMutation`, `useRequest`, and `useWatch`. `useQuery`/`useMutation` wrap TanStack Query and return its native result object (`isPending`, `isFetching`, `isSuccess`, `isError`, `data`, `error`, `status`, …); `useRequest`/`useWatch` are KatanaKit's own primitives, each exposed with the framework's reactivity.

## useQuery

<Tabs>
<TabItem value="react" label="React">

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
  const { data, isPending, error } = useQuery({
    queryKey: ["pokemon", id],
    queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id } })),
  });

  if (isPending) return <div>Loading…</div>;
  if (error) return <div>{error.message}</div>;
  return <div>{data?.name}</div>;
}
```

</TabItem>
<TabItem value="solid" label="Solid">

```tsx
import { Show } from "solid-js";
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/solid";
import { useGetApi } from "katanakit-js";

function Pokemon() {
  const query = useQuery(() => ({
    queryKey: ["pokemon", 25],
    queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
  }));

  return (
    <Show when={!query.isPending} fallback={<div>Loading…</div>}>
      <div>{query.data?.name}</div>
    </Show>
  );
}
```

</TabItem>
<TabItem value="svelte" label="Svelte">

```svelte
<script lang="ts">
  import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/svelte";
  import { useGetApi } from "katanakit-js";

  const query = useQuery({
    queryKey: ["pokemon", 25],
    queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
  });
</script>

{#if $query.isPending}
  <div>Loading…</div>
{:else if $query.isError}
  <div>{$query.error?.message}</div>
{:else}
  <div>{$query.data?.name}</div>
{/if}
```

</TabItem>
<TabItem value="angular" label="Angular">

```ts
import { Component } from "@angular/core";
import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/angular";
import { useGetApi } from "katanakit-js";

@Component({
  selector: "app-pokemon",
  template: `@if (query.isPending()) { Loading… } @else { {{ query.data()?.name }} }`,
})
export class PokemonComponent {
  readonly query = useQuery({
    queryKey: ["pokemon", 25],
    queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
  });
}
```

The Angular adapter must be called inside an injection context (component field initializer, constructor, or service) so it can auto-cleanup via `DestroyRef`.

</TabItem>
</Tabs>

## useMutation

Mutations are not cached — they execute and report their state. Call `mutate(variables)` and read the result:

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
<TabItem value="solid" label="Solid">

```tsx
import { useMutation, useQueryClient } from "katanakit-js/adapters/solid";
import { usePost } from "katanakit-js";

function CreateUser() {
  const qc = useQueryClient();
  const mutation = useMutation(() => ({
    mutationFn: (name: string) => usePost("api", "createUser", { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  }));

  return <button disabled={mutation.isPending} onClick={() => mutation.mutate("Ada")}>Create</button>;
}
```

</TabItem>
<TabItem value="svelte" label="Svelte">

```svelte
<script lang="ts">
  import { useMutation, useQueryClient } from "katanakit-js/adapters/svelte";
  import { usePost } from "katanakit-js";

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
import { Component } from "@angular/core";
import { useMutation, useQueryClient } from "katanakit-js/adapters/angular";
import { usePost } from "katanakit-js";

@Component({ selector: "app-create", template: `<button [disabled]="mutation.isPending()" (click)="mutation.mutate('Ada')">Create</button>` })
export class CreateUserComponent {
  private readonly qc = useQueryClient();
  readonly mutation = useMutation({
    mutationFn: (name: string) => usePost("api", "createUser", { name }),
    onSuccess: () => this.qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
```

</TabItem>
</Tabs>

## useRequest

`useRequest` is a lighter, no-cache reactive GET over a registered API — ideal for one-off fetches that don't need the full query cache. It returns `{ data, error, loading, refetch }` and never throws on HTTP errors. (The Vue adapter previously exported this as `useKatanaFetch`, now aliased for backward compatibility.)

```tsx
import { useRequest } from "katanakit-js/adapters/react"; // or /solid, /svelte, /angular, /vue

function Pokemon() {
  const { data, error, loading } = useRequest<{ name: string }>(
    "pokeapi",
    "pokemonById",
    { params: { id: 25 } },
  );
  if (loading) return <div>Loading…</div>;
  if (error) return <div>{error.message}</div>;
  return <div>{data?.name}</div>;
}
```

## useWatch

`useWatch(source, callback)` invokes `callback(value, previous)` whenever the watched value changes. The `source` type is framework-idiomatic: a getter in React/Solid/Angular, a store in Svelte, and a ref/reactive/getter in Vue.

```tsx
// React / Solid / Angular: a getter
useWatch(() => product, (next, prev) => console.log(next, prev));
```

```svelte
<!-- Svelte: a store -->
<script>
  import { writable } from "svelte/store";
  const product = writable({ name: "", price: 0 });
  useWatch(product, (next, prev) => console.log(next, prev));
</script>
```

## Sharing state across frameworks

All adapters share the same global [`QueryClient`](./query-client) singleton (unless you pass your own instance), so cached data is shared across adapters and even across frameworks in the same app. The `queryKey` is the single source of truth for identity and invalidation.
