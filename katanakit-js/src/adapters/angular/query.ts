import { computed, DestroyRef, inject, type Signal, signal } from "@angular/core";
import {
	type FetchStatus,
	MutationObserver,
	type MutationObserverOptions,
	type MutationStatus,
	type QueryClient,
	QueryObserver,
	type QueryObserverOptions,
	type QueryObserverResult,
	type QueryStatus,
	type RefetchOptions,
} from "@tanstack/query-core";

import { useQueryClient } from "../../core/services/query.service.js";

/** Signal-based query result returned by {@link useQuery}. */
export interface AngularQueryResult<TData = unknown, TError = Error> {
	readonly data: Signal<TData | undefined>;
	readonly error: Signal<TError | null>;
	readonly isPending: Signal<boolean>;
	readonly isFetching: Signal<boolean>;
	readonly isLoading: Signal<boolean>;
	readonly isSuccess: Signal<boolean>;
	readonly isError: Signal<boolean>;
	readonly isStale: Signal<boolean>;
	readonly status: Signal<QueryStatus>;
	readonly fetchStatus: Signal<FetchStatus>;
	readonly refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<TData, TError>>;
}

/** Signal-based mutation result returned by {@link useMutation}. */
export interface AngularMutationResult<TData = unknown, TError = Error, TVariables = void> {
	readonly data: Signal<TData | undefined>;
	readonly error: Signal<TError | null>;
	readonly variables: Signal<TVariables | undefined>;
	readonly isPending: Signal<boolean>;
	readonly isSuccess: Signal<boolean>;
	readonly isError: Signal<boolean>;
	readonly isIdle: Signal<boolean>;
	readonly status: Signal<MutationStatus>;
	readonly mutate: (variables: TVariables) => Promise<TData>;
	readonly reset: () => void;
}

/**
 * Angular signal factory for a cached query, backed by TanStack Query Core.
 *
 * Returns one signal per field — `query.data()`, `query.isPending()`,
 * `query.isError()`, `query.status()`, etc.
 *
 * Must be called within an injection context (so it auto-cleans via `DestroyRef`).
 *
 * @param options - TanStack query options (`queryKey`, `queryFn`, `staleTime`, …).
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns An {@link AngularQueryResult} of signals.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { useQuery, useSafeQueryFn } from "katanakit-js/adapters/angular";
 * import { useGetApi } from "katanakit-js";
 *
 * @Component({
 *   selector: "app-pokemon",
 *   template: `@if (query.isPending()) { Loading… } @else { {{ query.data()?.name }} }`,
 * })
 * export class PokemonComponent {
 *   readonly query = useQuery({
 *     queryKey: ["pokemon", 25],
 *     queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } })),
 *   });
 * }
 * ```
 */
export function useQuery<TQueryFnData = unknown, TError = Error, TData = TQueryFnData>(
	options: QueryObserverOptions<TQueryFnData, TError, TData>,
	client?: QueryClient,
): AngularQueryResult<TData, TError> {
	const queryClient = client ?? useQueryClient();
	const destroyRef = inject(DestroyRef);

	const observer = new QueryObserver(queryClient, queryClient.defaultQueryOptions(options));
	const result = signal<QueryObserverResult<TData, TError>>(observer.getCurrentResult());

	const unsubscribe = observer.subscribe((next) => result.set(next));
	destroyRef.onDestroy(unsubscribe);

	return {
		data: computed(() => result().data),
		error: computed(() => result().error),
		isPending: computed(() => result().isPending),
		isFetching: computed(() => result().isFetching),
		isLoading: computed(() => result().isLoading),
		isSuccess: computed(() => result().isSuccess),
		isError: computed(() => result().isError),
		isStale: computed(() => result().isStale),
		status: computed(() => result().status),
		fetchStatus: computed(() => result().fetchStatus),
		refetch: (refetchOptions) => observer.refetch(refetchOptions),
	};
}

/**
 * Angular signal factory for a mutation, backed by TanStack Query Core.
 *
 * Must be called within an injection context (so it auto-cleans via `DestroyRef`).
 *
 * @param options - TanStack mutation options (`mutationFn`, `onSuccess`, …).
 * @param client - Optional {@link QueryClient} (defaults to the shared singleton).
 * @returns An {@link AngularMutationResult} of signals.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { useMutation, useQueryClient } from "katanakit-js/adapters/angular";
 * import { usePost } from "katanakit-js";
 *
 * @Component({
 *   selector: "app-create",
 *   template: `<button [disabled]="mutation.isPending()" (click)="mutation.mutate('Ada')">Create</button>`,
 * })
 * export class CreateUserComponent {
 *   private readonly qc = useQueryClient();
 *   readonly mutation = useMutation({
 *     mutationFn: (name: string) => usePost("api", "createUser", { name }),
 *     onSuccess: () => this.qc.invalidateQueries({ queryKey: ["users"] }),
 *   });
 * }
 * ```
 */
export function useMutation<TData = unknown, TError = Error, TVariables = void>(
	options: MutationObserverOptions<TData, TError, TVariables>,
	client?: QueryClient,
): AngularMutationResult<TData, TError, TVariables> {
	const queryClient = client ?? useQueryClient();
	const destroyRef = inject(DestroyRef);

	const observer = new MutationObserver(queryClient, options);
	const result = signal(observer.getCurrentResult());

	const unsubscribe = observer.subscribe((next) => result.set(next));
	destroyRef.onDestroy(unsubscribe);

	return {
		data: computed(() => result().data),
		error: computed(() => result().error),
		variables: computed(() => result().variables),
		isPending: computed(() => result().isPending),
		isSuccess: computed(() => result().isSuccess),
		isError: computed(() => result().isError),
		isIdle: computed(() => result().isIdle),
		status: computed(() => result().status),
		mutate: (variables) => observer.mutate(variables),
		reset: () => observer.reset(),
	};
}
