import {
	MutationObserver,
	type MutationObserverOptions,
	type MutationObserverResult,
	type QueryClient,
	QueryObserver,
	type QueryObserverOptions,
	type QueryObserverResult,
} from "@tanstack/query-core";
import {
	getCurrentScope,
	type MaybeRef,
	onScopeDispose,
	shallowReactive,
	toValue,
	watch,
} from "vue";

import { useQueryClient } from "../../core/services/query.service.js";

/**
 * Vue composable for a cached query, backed by TanStack Query Core.
 *
 * Returns a reactive {@link QueryObserverResult} — read `query.data`,
 * `query.isPending`, `query.isError`, `query.status`, etc. directly.
 * Pass a `ref`/`computed` for `options` to react to key changes.
 *
 * Call it inside a component `setup` (or an active effect scope) so the
 * observer and the options watcher are disposed automatically.
 *
 * @param options - TanStack query options, plain or inside a `ref`/`computed`.
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns A reactive {@link QueryObserverResult}.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/vue";
 * import { useGetApi } from "katanakit-js";
 *
 * const query = useQuery({
 *   queryKey: ["pokemon", 25],
 *   queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
 * });
 * </script>
 *
 * <template>
 *   <span v-if="query.isPending">Loading…</span>
 *   <span v-else-if="query.isError">{{ query.error?.message }}</span>
 *   <span v-else>{{ query.data?.name }}</span>
 * </template>
 * ```
 */
export function useQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
	options: MaybeRef<QueryObserverOptions<TQueryFnData, TError, TData>>,
	client?: QueryClient,
): QueryObserverResult<TData, TError> {
	const queryClient = client ?? useQueryClient();
	const observer = new QueryObserver(queryClient, queryClient.defaultQueryOptions(toValue(options)));

	const state = shallowReactive({ ...observer.getCurrentResult() }) as QueryObserverResult<
		TData,
		TError
	>;

	const unsubscribe = observer.subscribe((result) => {
		Object.assign(state, result);
	});

	watch(
		() => toValue(options),
		(next) => observer.setOptions(queryClient.defaultQueryOptions(next)),
		{ deep: true },
	);

	if (getCurrentScope()) {
		onScopeDispose(unsubscribe);
	}

	return state;
}

/**
 * Vue composable for a mutation, backed by TanStack Query Core.
 *
 * @param options - TanStack mutation options, plain or inside a `ref`/`computed`.
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns A reactive {@link MutationObserverResult}.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMutation, useQueryClient } from "katanakit-js/adapters/vue";
 * import { usePost } from "katanakit-js";
 *
 * const qc = useQueryClient();
 * const mutation = useMutation({
 *   mutationFn: (name: string) => usePost("api", "createUser", { name }),
 *   onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
 * });
 * </script>
 *
 * <template>
 *   <button :disabled="mutation.isPending" @click="mutation.mutate('Ada')">Create</button>
 * </template>
 * ```
 */
export function useMutation<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
	options: MaybeRef<MutationObserverOptions<TData, TError, TVariables, TContext>>,
	client?: QueryClient,
): MutationObserverResult<TData, TError, TVariables, TContext> {
	const queryClient = client ?? useQueryClient();
	const observer = new MutationObserver(queryClient, toValue(options));

	const state = shallowReactive({ ...observer.getCurrentResult() }) as MutationObserverResult<
		TData,
		TError,
		TVariables,
		TContext
	>;

	const unsubscribe = observer.subscribe((result) => {
		Object.assign(state, result);
	});

	watch(
		() => toValue(options),
		(next) => observer.setOptions(next),
		{ deep: true },
	);

	if (getCurrentScope()) {
		onScopeDispose(unsubscribe);
	}

	return state;
}
