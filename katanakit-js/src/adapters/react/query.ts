import {
	MutationObserver,
	type MutationObserverOptions,
	type MutationObserverResult,
	notifyManager,
	type QueryClient,
	QueryObserver,
	type QueryObserverOptions,
	type QueryObserverResult,
} from "@tanstack/query-core";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { useQueryClient } from "../../core/services/query.service.js";

/**
 * React hook for a cached query, backed by TanStack Query Core.
 *
 * Returns TanStack's native {@link QueryObserverResult}
 * (`{ data, error, isPending, isFetching, isSuccess, isError, status, fetchStatus, refetch, … }`),
 * with stale-while-revalidate, focus/reconnect refetch, retries and garbage
 * collection handled by the engine.
 *
 * `client` is captured for the component's lifetime — pass a stable instance.
 *
 * @param options - TanStack query options (`queryKey`, `queryFn`, `staleTime`, …).
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns The TanStack {@link QueryObserverResult}.
 *
 * @example
 * ```tsx
 * import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/react";
 * import { useGetApi } from "katanakit-js";
 *
 * function Pokemon({ id }: { id: number }) {
 *   const { data, isPending, isError, error } = useQuery({
 *     queryKey: ["pokemon", id],
 *     queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id } })),
 *   });
 *   if (isPending) return <div>Loading…</div>;
 *   if (isError) return <div>{error.message}</div>;
 *   return <div>{data?.name}</div>;
 * }
 * ```
 */
export function useQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
	options: QueryObserverOptions<TQueryFnData, TError, TData>,
	client?: QueryClient,
): QueryObserverResult<TData, TError> {
	const queryClient = client ?? useQueryClient();
	const defaultedOptions = queryClient.defaultQueryOptions(options);

	const [observer] = useState(() => new QueryObserver(queryClient, defaultedOptions));

	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			const unsubscribe = observer.subscribe(notifyManager.batchCalls(onStoreChange));
			// Sync the optimistic result with the store after subscribing.
			observer.updateResult();
			return unsubscribe;
		},
		[observer],
	);

	const result = useSyncExternalStore(
		subscribe,
		() => observer.getCurrentResult(),
		() => observer.getCurrentResult(),
	);

	// Keep the observer's options in sync on every render (TanStack's pattern).
	useEffect(() => {
		observer.setOptions(queryClient.defaultQueryOptions(options));
	});

	return result;
}

/**
 * React hook for a mutation, backed by TanStack Query Core.
 *
 * Returns TanStack's native {@link MutationObserverResult}
 * (`{ data, error, variables, isPending, isError, isSuccess, status, mutate, reset }`).
 *
 * @param options - TanStack mutation options (`mutationFn`, `onSuccess`, …).
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns The TanStack {@link MutationObserverResult}.
 *
 * @example
 * ```tsx
 * import { useMutation, useQueryClient } from "katanakit-js/adapters/react";
 * import { usePost } from "katanakit-js";
 *
 * function CreateUser() {
 *   const qc = useQueryClient();
 *   const { mutate, isPending } = useMutation({
 *     mutationFn: (name: string) => usePost("api", "createUser", { name }),
 *     onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
 *   });
 *   return <button disabled={isPending} onClick={() => mutate("Ada")}>Create</button>;
 * }
 * ```
 */
export function useMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
	options: MutationObserverOptions<TData, TError, TVariables, TContext>,
	client?: QueryClient,
): MutationObserverResult<TData, TError, TVariables, TContext> {
	const queryClient = client ?? useQueryClient();

	const [observer] = useState(() => new MutationObserver(queryClient, options));

	const subscribe = useCallback(
		(onStoreChange: () => void) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
		[observer],
	);

	const result = useSyncExternalStore(
		subscribe,
		() => observer.getCurrentResult(),
		() => observer.getCurrentResult(),
	);

	useEffect(() => {
		observer.setOptions(options);
	});

	return result;
}
