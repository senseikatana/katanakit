import { createEffect, createSignal, onCleanup, type Signal } from "solid-js";

import {
	type QueryClient,
	type QueryKey,
	type QueryState,
	useQueryClient,
} from "../../core/services/query.service.js";
import type { ApiError, FetchResult } from "../../types/index.js";

/** Configuration for `useQuery` (Solid primitive). */
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

/** Reactive return value of `useQuery` (Solid signals are accessors). */
export interface UseQueryReturn<T = unknown> {
	data: Signal<T | null>[0];
	error: Signal<ApiError | null>[0];
	isLoading: Signal<boolean>[0];
	isSuccess: Signal<boolean>[0];
	isError: Signal<boolean>[0];
	isStale: Signal<boolean>[0];
	status: Signal<QueryState<T>["status"]>[0];
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
	data: Signal<TData | null>[0];
	error: Signal<ApiError | null>[0];
	isLoading: Signal<boolean>[0];
	isSuccess: Signal<boolean>[0];
	isError: Signal<boolean>[0];
	status: Signal<"idle" | "loading" | "success" | "error">[0];
	/** Execute the mutation. */
	mutate: (variables: TVariables) => Promise<void>;
	/** Reset the mutation state. */
	reset: () => void;
}

/**
 * Solid primitive that wraps the {@link QueryClient} with fine-grained signals.
 * Integrates with the API manager — your `queryFn` typically calls `useGetApi`
 * or `useFetch` and returns the Safe Result.
 *
 * @param config - Query configuration.
 * @param client - Optional QueryClient instance (uses global singleton by default).
 * @returns Signal accessors for `{ data, error, isLoading, isSuccess, isError, isStale, status }` plus `refetch`.
 *
 * @example
 * ```tsx
 * import { useQuery } from "katanakit-js/adapters/solid";
 * import { useGetApi } from "katanakit-js";
 *
 * function Pokemon() {
 *   const { data, isLoading, error } = useQuery({
 *     queryKey: ["pokemon", 25],
 *     queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id: 25 } }),
 *   });
 *   return <Show when={!isLoading() && !error()} fallback={<div>Loading…</div>}>
 *     <div>{data()?.name}</div>
 *   </Show>;
 * }
 * ```
 */
export function useQuery<T>(config: UseQueryConfig<T>, client?: QueryClient): UseQueryReturn<T> {
	const qc = client ?? useQueryClient();

	const [data, setData] = createSignal<T | null>(null);
	const [error, setError] = createSignal<ApiError | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);
	const [isSuccess, setIsSuccess] = createSignal(false);
	const [isError, setIsError] = createSignal(false);
	const [isStale, setIsStale] = createSignal(true);
	const [status, setStatus] = createSignal<QueryState<T>["status"]>("idle");

	const sync = (state: QueryState<T>): void => {
		// Updater form avoids Solid's "function as value" ambiguity for generic T.
		setData(() => state.data);
		setError(state.error);
		setIsLoading(state.isLoading);
		setIsSuccess(state.isSuccess);
		setIsError(state.isError);
		setIsStale(state.isStale);
		setStatus(state.status);
	};

	createEffect(() => {
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

		onCleanup(unsubscribe);
	});

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
 * Solid primitive for mutations (POST/PUT/PATCH/DELETE).
 * Does not cache — returns a `mutate` function that executes the mutation.
 *
 * @param config - Mutation configuration.
 * @returns Signal accessors plus `{ mutate, reset }`.
 *
 * @example
 * ```tsx
 * import { useMutation, useQueryClient } from "katanakit-js/adapters/solid";
 * import { usePost } from "katanakit-js";
 *
 * function CreateUser() {
 *   const qc = useQueryClient();
 *   const { mutate, isLoading } = useMutation({
 *     mutationFn: (name: string) => usePost("api", "createUser", { name }),
 *     onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
 *   });
 *   return <button disabled={isLoading()} onClick={() => mutate("Ada")}>Create</button>;
 * }
 * ```
 */
export function useMutation<TData = unknown, TVariables = unknown>(
	config: UseMutationConfig<TData, TVariables>,
): UseMutationReturn<TData, TVariables> {
	const [data, setData] = createSignal<TData | null>(null);
	const [error, setError] = createSignal<ApiError | null>(null);
	const [isLoading, setIsLoading] = createSignal(false);
	const [isSuccess, setIsSuccess] = createSignal(false);
	const [isError, setIsError] = createSignal(false);
	const [status, setStatus] = createSignal<"idle" | "loading" | "success" | "error">("idle");

	const mutate = async (variables: TVariables): Promise<void> => {
		setIsLoading(true);
		setIsSuccess(false);
		setIsError(false);
		setStatus("loading");

		try {
			const result = await config.mutationFn(variables);

			if (result.ok) {
				setData(() => result.data);
				setError(null);
				setIsSuccess(true);
				setStatus("success");
				config.onSuccess?.(result.data, variables);
				config.onSettled?.(result.data, null, variables);
			} else {
				setData(null);
				setError(result.error);
				setIsError(true);
				setStatus("error");
				config.onError?.(result.error, variables);
				config.onSettled?.(null, result.error, variables);
			}
		} catch (caught) {
			const apiError: ApiError =
				caught instanceof Error
					? { message: caught.message, status: 0 }
					: { message: String(caught), status: 0 };
			setData(null);
			setError(apiError);
			setIsError(true);
			setStatus("error");
			config.onError?.(apiError, variables);
			config.onSettled?.(null, apiError, variables);
		} finally {
			setIsLoading(false);
		}
	};

	const reset = (): void => {
		setData(null);
		setError(null);
		setIsLoading(false);
		setIsSuccess(false);
		setIsError(false);
		setStatus("idle");
	};

	return { data, error, isLoading, isSuccess, isError, status, mutate, reset };
}
