/**
 * Example: Vue 3 `useKatanaFetch` composable with reactive params.
 *
 * Run with: `bun run examples/vue/demo.ts`
 *
 * This demo exercises the composable's reactive contract (data/error/loading)
 * outside a component by awaiting a manual `refetch`. In a real component the
 * refs are unwrapped automatically in templates, e.g. `{{ pokemon.name }}`.
 */

import { useKatanaFetch } from "@/adapters/vue";
import { useGet, useInit } from "@/core/services/http.service";

interface Pokemon {
	name: string;
	id: number;
}

async function main(): Promise<void> {
	useInit({
		pokeapi: {
			baseUri: "https://pokeapi.co/api/v2",
			endpoints: { pokemonById: "/pokemon/:id/" },
		},
	});

	// 1. Reactive fetch — the composable calls `useGet` once on setup.
	const { data, error, loading, refetch } = useKatanaFetch<Pokemon>("pokeapi", "pokemonById", {
		params: { id: 25 },
	});

	// Wait for the in-flight request to settle, then read the reactive state.
	await refetch();

	if (loading.value) {
		console.log("Loading...");
	} else if (error.value) {
		console.error("Error:", error.value.message, error.value.status);
	} else {
		console.log("Pokemon:", data.value?.name);
	}

	// 2. Direct Safe Result call (no reactivity) for comparison.
	const result = await useGet<Pokemon>("pokeapi", "pokemonById", { params: { id: 26 } });
	console.log("Safe Result ok:", result.ok, result.ok ? result.data.name : result.error.message);
}

main();
