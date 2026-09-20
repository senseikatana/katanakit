import { useCallback, useEffect, useState } from "react";

import {
	type QueryClient,
	type QueryKey,
	type QueryState,
	useQueryClient,
} from "../../core/services/query.service.js";
import type { ApiError, FetchResult } from "../../types/index.js";

/** Configuration for `useQuery` (React hook). */
export interface UseQueryConfig<T = unknown> {
	/** Cache key — the query refetches when its serialized value changes. */
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

/** Reactive return value of `useQuery`. */
export interface UseQueryReturn<T = unknown> {
	data: T | null;
	error: ApiError | null;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	isStale: boolean;
	status: QueryState<T>["status"];
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
	data: TData | null;
	error: ApiError | null;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	status: "idle" | "loading" | "success" | "error";
	/** Execute the mutation. */
	mutate: (variables: TVariables) => Promise<void>;
	/** Reset the mutation state. */
	reset: () => void;
}

const IDLE_STATE = {
	status: "idle",
	data: null,
	error: null,
	isLoading: false,
	isSuccess: false,
	isError: false,
	isStale: true,
	dataUpdatedAt: 0,
	errorUpdatedAt: 0,
	fetchCount: 0,
} as const;

/**
 * React hook that wraps the {@link QueryClient} with `useState` reactivity.
 * Integrates with the API manager — your `queryFn` typically calls `useGetApi`
 * or `useFetch` and returns the Safe Result.
 *
 * Subscribes to the global query cache, refetches when the serialized
 * `queryKey` changes, and unsubscribes on unmount.
 *
 * @param config - Query configuration.
 * @param client - Optional QueryClient instance (uses global singleton by default).
 * @returns `{ data, error, isLoading, isSuccess, isError, isStale, status, refetch }`.
 *
 * @example
 * ```tsx
 * import { useQuery } from "katanakit-js/adapters/react";
 * import { useGetApi } from "katanakit-js";
 *
 * function Pokemon({ id }: { id: number }) {
 *   const { data, isLoading, error } = useQuery({
 *     queryKey: ["pokemon", id],
 *     queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id } }),
 *   });
 *   if (isLoading) return <div>Loading…</div>;
 *   if (error) return <div>{error.message}</div>;
 *   return <div>{data?.name}</div>;
 * }
 * ```
 */
export function useQuery<T>(config: UseQueryConfig<T>, client?: QueryClient): UseQueryReturn<T> {
	const qc = client ?? useQueryClient();
	const [state, setState] = useState<QueryState<T>>(IDLE_STATE as QueryState<T>);

	// Serialize the key so React's dependency comparison tracks deep changes.
	const keyHash = JSON.stringify(config.queryKey);

	useEffect(() => {
		let disposed = false;
		const qKey = config.queryKey;

		setState(IDLE_STATE as QueryState<T>);

		const unsubscribe = qc.subscribe<T>(qKey, (next) => {
			if (!disposed) setState(next as QueryState<T>);
		});

		const existing = qc.getQueryState<T>(qKey);
		if (existing) setState(existing);

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

		return () => {
			disposed = true;
			unsubscribe();
		};
	}, [keyHash, config.enabled]);

	const refetch = useCallback(async (): Promise<void> => {
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
	}, [qc, keyHash]);

	return {
		data: state.data,
		error: state.error,
		isLoading: state.isLoading,
		isSuccess: state.isSuccess,
		isError: state.isError,
		isStale: state.isStale,
		status: state.status,
		refetch,
	};
}

const IDLE_MUTATION_STATE = {
	data: null,
	error: null,
	isLoading: false,
	isSuccess: false,
	isError: false,
	status: "idle",
} as const;

type MutationStatus = "idle" | "loading" | "success" | "error";

/**
 * React hook for mutations (POST/PUT/PATCH/DELETE).
 * Does not cache — returns a `mutate` function that executes the mutation.
 *
 * @param config - Mutation configuration.
 * @returns `{ data, error, isLoading, isSuccess, isError, status, mutate, reset }`.
 *
 * @example
 * ```tsx
 * import { useMutation, useQueryClient } from "katanakit-js/adapters/react";
 * import { usePost } from "katanakit-js";
 *
 * function CreateUser() {
 *   const qc = useQueryClient();
 *   const { mutate, isLoading } = useMutation({
 *     mutationFn: (name: string) => usePost("api", "createUser", { name }),
 *     onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
 *   });
 *   return <button disabled={isLoading} onClick={() => mutate("Ada")}>Create</button>;
 * }
 * ```
 */
export function useMutation<TData = unknown, TVariables = unknown>(
	config: UseMutationConfig<TData, TVariables>,
): UseMutationReturn<TData, TVariables> {
	const [state, setState] = useState<{
		data: TData | null;
		error: ApiError | null;
		isLoading: boolean;
		isSuccess: boolean;
		isError: boolean;
		status: MutationStatus;
	}>(IDLE_MUTATION_STATE as never);

	const mutate = useCallback(async (variables: TVariables): Promise<void> => {
		setState((prev) => ({
			...prev,
			isLoading: true,
			isSuccess: false,
			isError: false,
			status: "loading",
		}));

		try {
			const result = await config.mutationFn(variables);

			if (result.ok) {
				setState({
					data: result.data,
					error: null,
					isLoading: false,
					isSuccess: true,
					isError: false,
					status: "success",
				});
				config.onSuccess?.(result.data, variables);
				config.onSettled?.(result.data, null, variables);
			} else {
				setState({
					data: null,
					error: result.error,
					isLoading: false,
					isSuccess: false,
					isError: true,
					status: "error",
				});
				config.onError?.(result.error, variables);
				config.onSettled?.(null, result.error, variables);
			}
		} catch (error) {
			const apiError: ApiError =
				error instanceof Error
					? { message: error.message, status: 0 }
					: { message: String(error), status: 0 };
			setState({
				data: null,
				error: apiError,
				isLoading: false,
				isSuccess: false,
				isError: true,
				status: "error",
			});
			config.onError?.(apiError, variables);
			config.onSettled?.(null, apiError, variables);
		}
	}, []);

	const reset = useCallback((): void => {
		setState(IDLE_MUTATION_STATE as never);
	}, []);

	return {
		data: state.data,
		error: state.error,
		isLoading: state.isLoading,
		isSuccess: state.isSuccess,
		isError: state.isError,
		status: state.status,
		mutate,
		reset,
	};
}
