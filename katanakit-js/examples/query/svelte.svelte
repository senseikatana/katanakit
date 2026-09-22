<script lang="ts">
/**
 * Svelte query demo — `katanakit-js/adapters/svelte`.
 *
 * `useQuery` returns a Svelte store: read `$query.data`, `$query.isPending`,
 * `$query.isFetching`, `$query.error`, `$query.status`.
 *
 * Reactive key: the store is created once, so wrap it in `{#key id}` to restart
 * the query when a reactive value changes (or call `$query.refetch()`).
 */
import { useMutation, useQuery, useQueryClient, useSafeQueryFn } from "katanakit-js/adapters/svelte";
import { useGetApi, useInitApis, usePost } from "katanakit-js";

// App bootstrap: register the APIs once (in a real app this lives in your entry file).
useInitApis({
  pokeapi: {
    baseUri: "https://pokeapi.co/api/v2",
    endpoints: { pokemonById: "/pokemon/:id/" },
  },
});

interface Pokemon {
  id: number;
  name: string;
}

export let id = 25;

const pokemon = useQuery({
  queryKey: ["pokemon", id],
  queryFn: useSafeQueryFn(() =>
    useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id } }),
  ),
  staleTime: 60_000,
});

const qc = useQueryClient();
const create = useMutation({
  mutationFn: (name: string) => usePost<Pokemon>("myApi", "createPokemon", { name }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["pokemon"] }),
});
</script>

{#if $pokemon.isPending}
  <p>Loading…</p>
{:else if $pokemon.isError}
  <p role="alert">{$pokemon.error?.message}</p>
{:else}
  <article>
    <h2>{$pokemon.data?.name}</h2>
    {#if $pokemon.isFetching}<small> refreshing…</small>{/if}
    <button on:click={() => $pokemon.refetch()}>Refresh</button>
  </article>
{/if}

<button disabled={$create.isPending} on:click={() => $create.mutate("pikachu")}>Create</button>
