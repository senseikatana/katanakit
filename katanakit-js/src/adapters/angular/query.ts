import { DestroyRef, inject, type Signal, signal } from "@angular/core";

import {
	type QueryClient,
	type QueryKey,
	type QueryState,
	useQueryClient,
} from "../../core/services/query.service.js";
import type { ApiError, FetchResult } from "../../types/index.js";

/** Configuration for `useQuery` (Angular signal factory). */
export interface UseQueryConfig<T = unknown> {
	/** Cache key (stable array). */
	queryKey: QueryKey;
	/** Fetcher function returning a Safe Result. */
	queryFn: () => Promise<FetchResult<T>>;
	/** Time in ms before cached data is stale (default: 0). */
	staleTime?: number;
	/** Time in ms to keep unused data (default: 5 min). */
	cacheTime?: number;
	/** Retry count on failure (default: 3). */
	retry?: number;
	/** Base delay for exponential backoff (default: 1000). */
	retryDelay?: number;
	/** Whether the query is enabled (default: true). */
	enabled?: boolean;
}

/** Reactive return value of `useQuery` (Angular signals). */
export interface UseQueryReturn<T = unknown> {
	data: Signal<T | null>;
	error: Signal<ApiError | null>;
	isLoading: Signal<boolean>;
	isSuccess: Signal<boolean>;
	isError: Signal<boolean>;
	isStale: Signal<boolean>;
	status: Signal<QueryState<T>["status"]>;
	/** Manually refetch the query. */
	refetch: () => Promise<void>;
}

/** Configuration for `useMutation`. */
export interface UseMutationConfig<TData = unknown, TVariables = unknown> {
	mutationFn: (variables: TVariables) => Promise<FetchResult<TData>>;
	onSuccess?: (data: TData, variables: TVariables) => void;
	onError?: (error: ApiError, variables: TVariables) => void;
	onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void;
}

/** Reactive return value of `useMutation`. */
export interface UseMutationReturn<TData = unknown, TVariables = unknown> {
	data: Signal<TData | null>;
	error: Signal<ApiError | null>;
	isLoading: Signal<boolean>;
	isSuccess: Signal<boolean>;
	isError: Signal<boolean>;
	status: Signal<"idle" | "loading" | "success" | "error">;
	/** Execute the mutation. */
	mutate: (variables: TVariables) => Promise<void>;
	/** Reset the mutation state. */
	reset: () => void;
}

/**
 * Angular signal factory that wraps the {@link QueryClient}.
 * Integrates with the API manager — your `queryFn` typically calls `useGetApi`
 * or `useFetch` and returns the Safe Result.
 *
 * Must be called within an injection context (component field initializer,
 * constructor, or a service) so the returned query can auto-cleanup via
 * `DestroyRef`. Requires Angular 16+ signals.
 *
 * @param config - Query configuration.
 * @param client - Optional QueryClient instance (uses global singleton by default).
 * @returns Signals `{ data, error, isLoading, isSuccess, isError, isStale, status }` plus `refetch`.
 *
 * @example
 * ```ts
 * import { Component, inject } from "@angular/core";
 * import { useQuery } from "katanakit-js/adapters/angular";
 * import { useGetApi } from "katanakit-js";
 *
 * @Component({ selector: "app-pokemon", template: `@if (isLoading()) { Loading… } @else { {{ data()?.name }} }` })
 * export class PokemonComponent {
 *   readonly data = useQuery({ queryKey: ["pokemon", 25], queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } }) }).data;
 * }
 * ```
 */
export function useQuery<T>(config: UseQueryConfig<T>, client?: QueryClient): UseQueryReturn<T> {
	const qc = client ?? useQueryClient();
	const destroyRef = inject(DestroyRef);

	const data = signal<T | null>(null);
	const error = signal<ApiError | null>(null);
	const isLoading = signal(false);
	const isSuccess = signal(false);
	const isError = signal(false);
	const isStale = signal(true);
	const status = signal<QueryState<T>["status"]>("idle");

	const sync = (state: QueryState<T>): void => {
		data.set(state.data);
		error.set(state.error);
		isLoading.set(state.isLoading);
		isSuccess.set(state.isSuccess);
		isError.set(state.isError);
		isStale.set(state.isStale);
		status.set(state.status);
	};

	const qKey = config.queryKey;
	const unsubscribe = qc.subscribe<T>(qKey, (next) => sync(next as QueryState<T>));

	const existing = qc.getQueryState<T>(qKey);
	if (existing) sync(existing);

	if (config.enabled !== false) {
		void qc
			.fetchQuery<T>({
				queryKey: qKey,
				queryFn: config.queryFn,
				staleTime: config.staleTime,
				cacheTime: config.cacheTime,
				retry: config.retry,
				retryDelay: config.retryDelay,
			})
			.catch(() => {
				// Error is already reflected in the cache state.
			});
	}

	destroyRef.onDestroy(unsubscribe);

	const refetch = async (): Promise<void> => {
		await qc
			.fetchQuery<T>({
				queryKey: config.queryKey,
				queryFn: config.queryFn,
				staleTime: 0,
				cacheTime: config.cacheTime,
				retry: config.retry,
				retryDelay: config.retryDelay,
			})
			.catch(() => {
				// Error is already reflected in the cache state.
			});
	};

	return { data, error, isLoading, isSuccess, isError, isStale, status, refetch };
}

/**
 * Angular signal factory for mutations (POST/PUT/PATCH/DELETE).
 * Does not cache — returns a `mutate` function that executes the mutation.
 *
 * Must be called within an injection context. Requires Angular 16+ signals.
 *
 * @param config - Mutation configuration.
 * @returns Signals plus `{ mutate, reset }`.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { useMutation, useQueryClient } from "katanakit-js/adapters/angular";
 * import { usePost } from "katanakit-js";
 *
 * @Component({ selector: "app-create", template: `<button [disabled]="isLoading()" (click)="mutate('Ada')">Create</button>` })
 * export class CreateUserComponent {
 *   private readonly qc = useQueryClient();
 *   readonly result = useMutation({
 *     mutationFn: (name: string) => usePost("api", "createUser", { name }),
 *     onSuccess: () => this.qc.invalidateQueries({ queryKey: ["users"] }),
 *   });
 *   readonly isLoading = this.result.isLoading;
 *   readonly mutate = this.result.mutate;
 * }
 * ```
 */
export function useMutation<TData = unknown, TVariables = unknown>(
	config: UseMutationConfig<TData, TVariables>,
): UseMutationReturn<TData, TVariables> {
	const data = signal<TData | null>(null);
	const error = signal<ApiError | null>(null);
	const isLoading = signal(false);
	const isSuccess = signal(false);
	const isError = signal(false);
	const status = signal<"idle" | "loading" | "success" | "error">("idle");

	const mutate = async (variables: TVariables): Promise<void> => {
		isLoading.set(true);
		isSuccess.set(false);
		isError.set(false);
		status.set("loading");

		try {
			const result = await config.mutationFn(variables);

			if (result.ok) {
				data.set(result.data);
				error.set(null);
				isSuccess.set(true);
				status.set("success");
				config.onSuccess?.(result.data, variables);
				config.onSettled?.(result.data, null, variables);
			} else {
				data.set(null);
				error.set(result.error);
				isError.set(true);
				status.set("error");
				config.onError?.(result.error, variables);
				config.onSettled?.(null, result.error, variables);
			}
		} catch (caught) {
			const apiError: ApiError =
				caught instanceof Error
					? { message: caught.message, status: 0 }
					: { message: String(caught), status: 0 };
			data.set(null);
			error.set(apiError);
			isError.set(true);
			status.set("error");
			config.onError?.(apiError, variables);
			config.onSettled?.(null, apiError, variables);
		} finally {
			isLoading.set(false);
		}
	};

	const reset = (): void => {
		data.set(null);
		error.set(null);
		isLoading.set(false);
		isSuccess.set(false);
		isError.set(false);
		status.set("idle");
	};

	return { data, error, isLoading, isSuccess, isError, status, mutate, reset };
}
