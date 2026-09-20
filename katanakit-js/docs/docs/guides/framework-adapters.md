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

Every adapter exposes the same surface: `useQuery` and `useMutation`. The return shape is identical in spirit — `data`, `error`, `isLoading`, `isSuccess`, `isError`, `isStale`, `status`, and a `refetch` (or `mutate`/`reset` for mutations) — but the values are the framework's own reactive primitives.

## useQuery

<Tabs>
<TabItem value="react" label="React">

```tsx
import { useQuery } from "katanakit-js/adapters/react";
import { useGetApi, useInitApis } from "katanakit-js";

useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});

function Pokemon({ id }: { id: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pokemon", id],
    queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id } }),
  });

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div>{error.message}</div>;
  return <div>{data?.name}</div>;
}
```

</TabItem>
<TabItem value="solid" label="Solid">

```tsx
import { Show } from "solid-js";
import { useQuery } from "katanakit-js/adapters/solid";
import { useGetApi } from "katanakit-js";

function Pokemon() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pokemon", 25],
    queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } }),
  });

  return (
    <Show when={!isLoading() && !error()} fallback={<div>Loading…</div>}>
      <div>{data()?.name}</div>
    </Show>
  );
}
```

</TabItem>
<TabItem value="svelte" label="Svelte">

```svelte
<script lang="ts">
  import { useQuery } from "katanakit-js/adapters/svelte";
  import { useGetApi } from "katanakit-js";

  const { data, isLoading, error } = useQuery({
    queryKey: ["pokemon", 25],
    queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } }),
  });
</script>

{#if $isLoading}
  <div>Loading…</div>
{:else if $error}
  <div>{$error.message}</div>
{:else}
  <div>{$data?.name}</div>
{/if}
```

</TabItem>
<TabItem value="angular" label="Angular">

```ts
import { Component } from "@angular/core";
import { useQuery } from "katanakit-js/adapters/angular";
import { useGetApi } from "katanakit-js";

@Component({
  selector: "app-pokemon",
  template: `@if (isLoading()) { Loading… } @else { {{ data()?.name }} }`,
})
export class PokemonComponent {
  readonly result = useQuery({
    queryKey: ["pokemon", 25],
    queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } }),
  });
  readonly data = this.result.data;
  readonly isLoading = this.result.isLoading;
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
  const { mutate, isLoading } = useMutation({
    mutationFn: (name: string) => usePost("api", "createUser", { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  return <button disabled={isLoading} onClick={() => mutate("Ada")}>Create</button>;
}
```

</TabItem>
<TabItem value="solid" label="Solid">

```tsx
import { useMutation, useQueryClient } from "katanakit-js/adapters/solid";
import { usePost } from "katanakit-js";

function CreateUser() {
  const qc = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: (name: string) => usePost("api", "createUser", { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  return <button disabled={isLoading()} onClick={() => mutate("Ada")}>Create</button>;
}
```

</TabItem>
<TabItem value="svelte" label="Svelte">

```svelte
<script lang="ts">
  import { useMutation, useQueryClient } from "katanakit-js/adapters/svelte";
  import { usePost } from "katanakit-js";

  const qc = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: (name: string) => usePost("api", "createUser", { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
</script>

<button disabled={$isLoading} on:click={() => mutate("Ada")}>Create</button>
```

</TabItem>
<TabItem value="angular" label="Angular">

```ts
import { Component } from "@angular/core";
import { useMutation, useQueryClient } from "katanakit-js/adapters/angular";
import { usePost } from "katanakit-js";

@Component({ selector: "app-create", template: `<button [disabled]="isLoading()" (click)="mutate('Ada')">Create</button>` })
export class CreateUserComponent {
  private readonly qc = useQueryClient();
  readonly result = useMutation({
    mutationFn: (name: string) => usePost("api", "createUser", { name }),
    onSuccess: () => this.qc.invalidateQueries({ queryKey: ["users"] }),
  });
  readonly isLoading = this.result.isLoading;
  readonly mutate = this.result.mutate;
}
```

</TabItem>
</Tabs>

## Sharing state across frameworks

All adapters share the same global [`QueryClient`](./query-client) singleton (unless you pass your own instance), so cached data is shared across adapters and even across frameworks in the same app. The `queryKey` is the single source of truth for identity and invalidation.
