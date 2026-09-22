import {
	MutationObserver,
	type MutationObserverOptions,
	type QueryClient,
	QueryObserver,
	type QueryObserverOptions,
} from "@tanstack/query-core";

import { useQueryClient } from "../../core/services/query.service.js";

/**
 * Vanilla (framework-free) query binding — plain TypeScript / JavaScript, no framework.
 *
 * Returns a raw TanStack {@link QueryObserver}. The framework adapters are this
 * plus a reactivity bridge (React `useSyncExternalStore`, Vue `shallowReactive`,
 * Solid store, Svelte store, Angular signals); here **you** own the bridge:
 * subscribe, read `getCurrentResult()`, and re-render however you want (DOM,
 * canvas, CLI, worker, terminal UI).
 *
 * The observer does not start fetching until you `subscribe()` (or call
 * `refetch()`); it stops when the last subscriber unsubscribes or you call
 * `destroy()`.
 *
 * @param options - TanStack query options (`queryKey`, `queryFn`, `staleTime`, …).
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns A {@link QueryObserver} — `subscribe`, `getCurrentResult`, `setOptions`, `refetch`, `destroy`.
 *
 * @example
 * ```ts
 * import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/vanilla";
 * import { useGetApi } from "katanakit-js";
 *
 * const observer = useQuery({
 *   queryKey: ["pokemon", 25],
 *   queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
 * });
 *
 * const render = () => {
 *   const { data, isPending, isError, error } = observer.getCurrentResult();
 *   // …paint `data` / `isPending` / `error` wherever you want
 * };
 *
 * const unsubscribe = observer.subscribe(render);
 * render(); // paint the current (pending) state immediately
 *
 * // later: unsubscribe(); observer.destroy();
 * ```
 */
export function useQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
	options: QueryObserverOptions<TQueryFnData, TError, TData>,
	client?: QueryClient,
): QueryObserver<TQueryFnData, TError, TData> {
	const queryClient = client ?? useQueryClient();
	return new QueryObserver(queryClient, queryClient.defaultQueryOptions(options));
}

/**
 * Vanilla (framework-free) mutation binding.
 *
 * Returns a raw TanStack {@link MutationObserver}. Call `observer.mutate(vars)`,
 * read `getCurrentResult()`, and `subscribe()` if you want to react to the
 * `isPending` → `isSuccess` / `isError` transitions.
 *
 * @param options - TanStack mutation options (`mutationFn`, `onSuccess`, …).
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns A {@link MutationObserver} — `mutate`, `reset`, `getCurrentResult`, `subscribe`.
 *
 * @example
 * ```ts
 * import { useMutation } from "katanakit-js/adapters/vanilla";
 * import { usePost } from "katanakit-js";
 *
 * const mutation = useMutation({
 *   mutationFn: (name: string) => usePost("api", "createUser", { name }),
 * });
 *
 * const unsubscribe = mutation.subscribe(({ isPending, isSuccess, error }) => {
 *   // …paint the mutation state
 * });
 *
 * await mutation.mutate("Ada");
 * ```
 */
export function useMutation<TData = unknown, TError = Error, TVariables = void>(
	options: MutationObserverOptions<TData, TError, TVariables>,
	client?: QueryClient,
): MutationObserver<TData, TError, TVariables> {
	const queryClient = client ?? useQueryClient();
	return new MutationObserver(queryClient, options);
}
