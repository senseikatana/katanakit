/**
 * Solid query demo — `katanakit-js/adapters/solid`.
 *
 * The result is a reactive store: read `query.data`, `query.isPending`,
 * `query.isFetching`, etc. directly. Pass a getter (`() => ({ … })`) so the
 * query follows signals.
 */
import { createSignal, Show } from "solid-js";

import { useMutation, useQuery, useQueryClient, useSafeQueryFn } from "katanakit-js/adapters/solid";
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

export function PokemonCard() {
	const [id, setId] = createSignal(25);

	const pokemon = useQuery(() => ({
		queryKey: ["pokemon", id()],
		queryFn: useSafeQueryFn(() =>
			useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id: id() } }),
		),
		staleTime: 60_000,
	}));

	const qc = useQueryClient();
	const create = useMutation(() => ({
		mutationFn: (name: string) => usePost<Pokemon>("myApi", "createPokemon", { name }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["pokemon"] }),
	}));

	return (
		<>
			<Show when={!pokemon.isPending} fallback={<p>Loading…</p>}>
				<Show when={!pokemon.isError} fallback={<p role="alert">{pokemon.error?.message}</p>}>
					<article>
						<h2>{pokemon.data?.name}</h2>
						<Show when={pokemon.isFetching}>
							<small> refreshing…</small>
						</Show>
						<button onClick={() => void pokemon.refetch()}>Refresh</button>
					</article>
				</Show>
			</Show>

			<button disabled={create.isPending} onClick={() => void create.mutate("pikachu")}>
				Create
			</button>
			<button onClick={() => setId((n) => n + 1)}>Next</button>
		</>
	);
}
