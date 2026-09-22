import {
	MutationObserver,
	type MutationObserverOptions,
	type MutationObserverResult,
	type QueryClient,
	QueryObserver,
	type QueryObserverOptions,
	type QueryObserverResult,
} from "@tanstack/query-core";
import { type Readable, readable } from "svelte/store";

import { useQueryClient } from "../../core/services/query.service.js";

/**
 * Svelte store factory for a cached query, backed by TanStack Query Core.
 *
 * Returns a `Readable` of TanStack's {@link QueryObserverResult}. Subscribe
 * with `$query` — `$query.data`, `$query.isPending`, `$query.isError`,
 * `$query.status`, etc.
 *
 * @param options - TanStack query options (`queryKey`, `queryFn`, `staleTime`, …).
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns A `Readable` of the TanStack {@link QueryObserverResult}.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/svelte";
 *   import { useGetApi } from "katanakit-js";
 *
 *   const query = useQuery({
 *     queryKey: ["pokemon", 25],
 *     queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
 *   });
 * </script>
 *
 * {#if $query.isPending}
 *   <div>Loading…</div>
 * {:else if $query.isError}
 *   <div>{$query.error?.message}</div>
 * {:else}
 *   <div>{$query.data?.name}</div>
 * {/if}
 * ```
 */
export function useQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
	options: QueryObserverOptions<TQueryFnData, TError, TData>,
	client?: QueryClient,
): Readable<QueryObserverResult<TData, TError>> {
	const queryClient = client ?? useQueryClient();
	const observer = new QueryObserver(queryClient, queryClient.defaultQueryOptions(options));

	return readable<QueryObserverResult<TData, TError>>(observer.getCurrentResult(), (set) => {
		const unsubscribe = observer.subscribe((result) => set(result));
		set(observer.getCurrentResult());
		return () => unsubscribe();
	});
}

/**
 * Svelte store factory for a mutation, backed by TanStack Query Core.
 *
 * @param options - TanStack mutation options (`mutationFn`, `onSuccess`, …).
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns A `Readable` of the TanStack {@link MutationObserverResult}.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMutation, useQueryClient } from "katanakit-js/adapters/svelte";
 *   import { usePost } from "katanakit-js";
 *
 *   const qc = useQueryClient();
 *   const mutation = useMutation({
 *     mutationFn: (name: string) => usePost("api", "createUser", { name }),
 *     onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
 *   });
 * </script>
 *
 * <button disabled={$mutation.isPending} on:click={() => $mutation.mutate("Ada")}>Create</button>
 * ```
 */
export function useMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
	options: MutationObserverOptions<TData, TError, TVariables, TContext>,
	client?: QueryClient,
): Readable<MutationObserverResult<TData, TError, TVariables, TContext>> {
	const queryClient = client ?? useQueryClient();
	const observer = new MutationObserver(queryClient, options);

	return readable<MutationObserverResult<TData, TError, TVariables, TContext>>(
		observer.getCurrentResult(),
		(set) => {
			const unsubscribe = observer.subscribe((result) => set(result));
			// Stores are lazy: re-sync the latest result on every (re)subscribe.
			set(observer.getCurrentResult());
			return () => unsubscribe();
		},
	);
}
