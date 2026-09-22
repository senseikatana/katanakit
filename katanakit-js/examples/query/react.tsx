/**
 * React query demo — `katanakit-js/adapters/react`.
 *
 * Drop this component into any React 18+ app. The adapter reads the shared
 * `QueryClient` singleton by default; pass a client as the 2nd argument to scope it.
 *
 *   import { useQuery, useMutation, useQueryClient, useSafeQueryFn } from "katanakit-js/adapters/react";
 *
 * Result shape is TanStack's: `{ data, error, isPending, isFetching, isSuccess, isError, status, refetch }`.
 */
import { useMutation, useQuery, useQueryClient, useSafeQueryFn } from "katanakit-js/adapters/react";
import { useGetApi, useInitApis, usePost } from "katanakit-js";

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

export function PokemonCard({ id }: { id: number }) {
	const { data, isPending, isFetching, isError, error, refetch } = useQuery({
		queryKey: ["pokemon", id],
		queryFn: useSafeQueryFn(() => useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id } })),
		staleTime: 60_000,
	});

	if (isPending) return <p>Loading…</p>;
	if (isError) return <p role="alert">{error.message}</p>;

	return (
		<article>
			<h2>{data?.name}</h2>
			{isFetching && <small> refreshing…</small>}
			<button onClick={() => void refetch()}>Refresh</button>
		</article>
	);
}

export function CreatePokemon() {
	const qc = useQueryClient();
	const { mutate, isPending } = useMutation({
		mutationFn: (name: string) => usePost<Pokemon>("myApi", "createPokemon", { name }),
		// Refetches every active `["pokemon"]` query (TanStack really does this).
		onSuccess: () => qc.invalidateQueries({ queryKey: ["pokemon"] }),
	});

	return (
		<button disabled={isPending} onClick={() => mutate("pikachu")}>
			Create
		</button>
	);
}

/**
 * Scoping: every adapter accepts an optional `QueryClient` as the last argument.
 * Use `useCreateQueryClient()` for an isolated cache (widgets, tests, tenants),
 * or `useInitQueryClient({…})` once to configure the shared one.
 */
export function IsolatedWidget({ id }: { id: number }) {
	const client = useCreateQueryClient({ defaultOptions: { queries: { staleTime: 0 } } });
	const { data } = useQuery(
		{
			queryKey: ["pokemon", id],
			queryFn: useSafeQueryFn(() => useGetApi<Pokemon>("pokeapi", "pokemonById", { params: { id } })),
		},
		client,
	);

	return <span>{data?.name}</span>;
}
