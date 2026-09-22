<script setup lang="ts">
/**
 * Vue query demo — `katanakit-js/adapters/vue`.
 *
 * The result is a reactive object: read `query.data`, `query.isPending`,
 * `query.isFetching`, `query.error`, `query.status` directly (no `.value`).
 * Pass a `computed` of options to follow a reactive key.
 */
import { computed } from "vue";

import { useMutation, useQuery, useQueryClient, useSafeQueryFn } from "katanakit-js/adapters/vue";
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

const props = defineProps<{ id: number }>();

const pokemon = useQuery(
	computed(() => ({
		queryKey: ["pokemon", props.id],
		queryFn: useSafeQueryFn(() =>
			useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id: props.id } }),
		),
		staleTime: 60_000,
	})),
);

const qc = useQueryClient();
const create = useMutation({
	mutationFn: (name: string) => usePost<Pokemon>("myApi", "createPokemon", { name }),
	onSuccess: () => qc.invalidateQueries({ queryKey: ["pokemon"] }),
});
</script>

<template>
	<p v-if="pokemon.isPending">Loading…</p>
	<p v-else-if="pokemon.isError" role="alert">{{ pokemon.error?.message }}</p>
	<article v-else>
		<h2>{{ pokemon.data?.name }}</h2>
		<small v-if="pokemon.isFetching"> refreshing…</small>
		<button @click="pokemon.refetch()">Refresh</button>
	</article>

	<button :disabled="create.isPending" @click="create.mutate('pikachu')">Create</button>
</template>
