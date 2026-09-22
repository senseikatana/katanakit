import {
	MutationObserver,
	type MutationObserverOptions,
	type MutationObserverResult,
	type QueryClient,
	QueryObserver,
	type QueryObserverOptions,
	type QueryObserverResult,
} from "@tanstack/query-core";
import { createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import { useQueryClient } from "../../core/services/query.service.js";

/** Options for the Solid binding: a plain object or a reactive getter. */
export type SolidQueryOptions<TQueryFnData, TError, TData> =
	| QueryObserverOptions<TQueryFnData, TError, TData>
	| (() => QueryObserverOptions<TQueryFnData, TError, TData>);

/**
 * Solid primitive for a cached query, backed by TanStack Query Core.
 *
 * Returns a reactive {@link QueryObserverResult} store — read `query.data`,
 * `query.isPending`, `query.isError`, `query.status`, etc. directly. Pass a
 * getter (`() => ({ queryKey, queryFn })`) to react to key changes.
 *
 * Call it inside a component or `createRoot` so `onCleanup` disposes the observer.
 *
 * @param options - TanStack query options, or a getter returning them.
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns A reactive {@link QueryObserverResult} store.
 *
 * @example
 * ```tsx
 * import { Show } from "solid-js";
 * import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/solid";
 * import { useGetApi } from "katanakit-js";
 *
 * function Pokemon() {
 *   const query = useQuery(() => ({
 *     queryKey: ["pokemon", 25],
 *     queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
 *   }));
 *   return (
 *     <Show when={!query.isPending} fallback={<div>Loading…</div>}>
 *       <div>{query.data?.name}</div>
 *     </Show>
 *   );
 * }
 * ```
 */
export function useQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
	options: SolidQueryOptions<TQueryFnData, TError, TData>,
	client?: QueryClient,
): QueryObserverResult<TData, TError> {
	const queryClient = client ?? useQueryClient();
	const getOptions = typeof options === "function" ? options : (): typeof options => options;

	const observer = new QueryObserver(queryClient, queryClient.defaultQueryOptions(getOptions()));

	const [state, setState] = createStore<QueryObserverResult<TData, TError>>(
		observer.getCurrentResult(),
	);

	const unsubscribe = observer.subscribe((result) => {
		setState(result);
	});

	// Re-apply options whenever the reactive getter's dependencies change.
	createEffect(() => {
		observer.setOptions(queryClient.defaultQueryOptions(getOptions()));
	});

	onCleanup(unsubscribe);

	return state;
}

/**
 * Solid primitive for a mutation, backed by TanStack Query Core.
 *
 * @param options - TanStack mutation options, or a getter returning them.
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns A reactive {@link MutationObserverResult} store.
 *
 * @example
 * ```tsx
 * import { useMutation, useQueryClient } from "katanakit-js/adapters/solid";
 * import { usePost } from "katanakit-js";
 *
 * function CreateUser() {
 *   const qc = useQueryClient();
 *   const mutation = useMutation(() => ({
 *     mutationFn: (name: string) => usePost("api", "createUser", { name }),
 *     onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
 *   }));
 *   return <button disabled={mutation.isPending} onClick={() => mutation.mutate("Ada")}>Create</button>;
 * }
 * ```
 */
export function useMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
	options:
		| MutationObserverOptions<TData, TError, TVariables, TContext>
		| (() => MutationObserverOptions<TData, TError, TVariables, TContext>),
	client?: QueryClient,
): MutationObserverResult<TData, TError, TVariables, TContext> {
	const queryClient = client ?? useQueryClient();
	const getOptions = typeof options === "function" ? options : (): typeof options => options;

	const observer = new MutationObserver(queryClient, getOptions());

	const [state, setState] = createStore<MutationObserverResult<TData, TError, TVariables, TContext>>(
		observer.getCurrentResult(),
	);

	const unsubscribe = observer.subscribe((result) => {
		setState(result);
	});

	createEffect(() => {
		observer.setOptions(getOptions());
	});

	onCleanup(unsubscribe);

	return state;
}
