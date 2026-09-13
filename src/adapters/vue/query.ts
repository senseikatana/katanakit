import { type MaybeRef, onUnmounted, type Ref, ref, shallowRef, toValue, watch } from "vue";
import {
	type QueryClient,
	type QueryKey,
	type QueryState,
	useQueryClient,
} from "../../core/services/query.service.js";
import type { ApiError, FetchResult } from "../../types/index.js";

// ============================================================
// Types
// ============================================================

/** Reactive return value of `useQuery`. */
export interface UseQueryReturn<T> {
	/** The resolved data on success, `null` otherwise. */
	data: Ref<T | null>;
	/** The Safe Result error on failure, `null` otherwise. */
	error: Ref<ApiError | null>;
	/** Whether the query is currently fetching. */
	isLoading: Ref<boolean>;
	/** Whether the query succeeded with data. */
	isSuccess: Ref<boolean>;
	/** Whether the query failed with an error. */
	isError: Ref<boolean>;
	/** Whether the cached data is stale. */
	isStale: Ref<boolean>;
	/** Current status of the query. */
	status: Ref<"idle" | "loading" | "success" | "error">;
	/** Manually refetch the query. */
	refetch: () => Promise<void>;
}

/** Configuration for `useQuery` (Vue reactive version). */
export interface UseQueryConfig<T = unknown> {
	/** Reactive query key — the query refetches when it changes. */
	queryKey: MaybeRef<QueryKey>;
	/** Fetcher function returning a Safe Result. */
	queryFn: () => Promise<FetchResult<T>>;
	/** Time in ms before cached data is stale (default: 0). */
	staleTime?: MaybeRef<number>;
	/** Time in ms to keep unused data (default: 5 min). */
	cacheTime?: number;
	/** Retry count on failure (default: 3). */
	retry?: number;
	/** Base delay for exponential backoff (default: 1000). */
	retryDelay?: number;
	/** Refetch on window focus (default: true). */
	refetchOnWindowFocus?: MaybeRef<boolean>;
	/** Whether the query is enabled (default: true). */
	enabled?: MaybeRef<boolean>;
}

/** Configuration for `useMutation`. */
export interface UseMutationConfig<TData = unknown, TVariables = unknown> {
	mutationFn: (variables: TVariables) => Promise<FetchResult<TData>>;
	onSuccess?: (data: TData, variables: TVariables) => void;
	onError?: (error: ApiError, variables: TVariables) => void;
	onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void;
}

/** Reactive return value of `useMutation`. */
export interface UseMutationReturn<TData, TVariables> {
	/** The resolved data from the last mutation. */
	data: Ref<TData | null>;
	/** The error from the last mutation. */
	error: Ref<ApiError | null>;
	/** Whether a mutation is in flight. */
	isLoading: Ref<boolean>;
	/** Whether the last mutation succeeded. */
	isSuccess: Ref<boolean>;
	/** Whether the last mutation failed. */
	isError: Ref<boolean>;
	/** Current status of the mutation. */
	status: Ref<"idle" | "loading" | "success" | "error">;
	/** Execute the mutation. */
	mutate: (variables: TVariables) => Promise<void>;
	/** Reset the mutation state. */
	reset: () => void;
}

// ============================================================
// useQuery
// ============================================================

/**
 * Vue composable that wraps the {@link QueryClient} with reactive state.
 * Integrates with the API manager — your `queryFn` typically calls
 * `useGetApi` or `useFetch` and returns the Safe Result.
 *
 * @param config - Query configuration with reactive query key.
 * @param client - Optional QueryClient instance (uses global singleton by default).
 * @returns Reactive `{ data, error, isLoading, isSuccess, isError, isStale, status, refetch }`.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useQuery } from "katanakit-js/adapters/vue";
 * import { useGetApi } from "katanakit-js";
 *
 * const { data, isLoading, error } = useQuery({
 *   queryKey: () => ["pokemon", id.value],
 *   queryFn: () => useGetApi("pokeapi", "pokemonById", { params: { id: id.value } }),
 *   staleTime: 60_000,
 * });
 * </script>
 * ```
 */
export function useQuery<T>(config: UseQueryConfig<T>, client?: QueryClient): UseQueryReturn<T> {
	const qc = client ?? useQueryClient();

	const data = shallowRef<T | null>(null);
	const error = ref<ApiError | null>(null);
	const isLoading = ref(false);
	const isSuccess = ref(false);
	const isError = ref(false);
	const isStale = ref(true);
	const status = ref<"idle" | "loading" | "success" | "error">("idle");

	let disposed = false;
	let stopSubscription: (() => void) | null = null;

	const syncFromState = (state: QueryState<T>) => {
		if (disposed) return;
		data.value = state.data;
		error.value = state.error;
		isLoading.value = state.isLoading;
		isSuccess.value = state.isSuccess;
		isError.value = state.isError;
		isStale.value = state.isStale;
		status.value = state.status;
	};

	const runQuery = async () => {
		if (disposed) return;
		const enabled = toValue(config.enabled) ?? true;
		if (!enabled) return;

		const qKey = toValue(config.queryKey);
		const staleTime = toValue(config.staleTime) ?? 0;
		const refetchOnFocus = toValue(config.refetchOnWindowFocus) ?? true;

		// Unsubscribe from previous key.
		stopSubscription?.();

		// Subscribe to state updates.
		stopSubscription = qc.subscribe<T>(qKey, (state) => {
			syncFromState(state as QueryState<T>);
		});

		// Sync initial state.
		const existing = qc.getQueryState<T>(qKey);
		if (existing) syncFromState(existing);

		// Fetch if needed.
		try {
			await qc.fetchQuery<T>({
				queryKey: qKey,
				queryFn: config.queryFn,
				staleTime,
				cacheTime: config.cacheTime,
				retry: config.retry,
				retryDelay: config.retryDelay,
				refetchOnWindowFocus: refetchOnFocus,
			});
		} catch {
			// Error is in state; no need to throw.
		}
	};

	// Watch reactive query key for changes.
	watch(
		() => toValue(config.queryKey),
		() => {
			void runQuery();
		},
		{ deep: true },
	);

	// Watch enabled flag.
	if (typeof config.enabled === "object" && "value" in config.enabled) {
		watch(
			() => toValue(config.enabled),
			(enabled) => {
				if (enabled) void runQuery();
			},
		);
	}

	// Initial fetch.
	void runQuery();

	// Cleanup on unmount.
	onUnmounted(() => {
		disposed = true;
		stopSubscription?.();
	});

	const refetch = async (): Promise<void> => {
		const qKey = toValue(config.queryKey);
		await qc.fetchQuery<T>({
			queryKey: qKey,
			queryFn: config.queryFn,
			staleTime: 0, // Force refetch.
			cacheTime: config.cacheTime,
			retry: config.retry,
			retryDelay: config.retryDelay,
		});
	};

	return { data, error, isLoading, isSuccess, isError, isStale, status, refetch };
}

// ============================================================
// useMutation
// ============================================================

/**
 * Vue composable for mutations (POST/PUT/PATCH/DELETE).
 * Does not cache — returns a `mutate` function that executes the mutation.
 *
 * @param config - Mutation configuration.
 * @param client - Optional QueryClient instance.
 * @returns Reactive `{ data, error, isLoading, isSuccess, isError, status, mutate, reset }`.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMutation, useQueryClient } from "katanakit-js/adapters/vue";
 * import { usePost } from "katanakit-js";
 *
 * const qc = useQueryClient();
 * const { mutate, isLoading } = useMutation({
 *   mutationFn: (name: string) => usePost("myApi", "createUser", { name }),
 *   onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
 * });
 * </script>
 * ```
 */
export function useMutation<TData = unknown, TVariables = unknown>(
	config: UseMutationConfig<TData, TVariables>,
	client?: QueryClient,
): UseMutationReturn<TData, TVariables> {
	const _qc = client ?? useQueryClient();

	const data = shallowRef<TData | null>(null);
	const error = ref<ApiError | null>(null);
	const isLoading = ref(false);
	const isSuccess = ref(false);
	const isError = ref(false);
	const status = ref<"idle" | "loading" | "success" | "error">("idle");

	const mutate = async (variables: TVariables): Promise<void> => {
		isLoading.value = true;
		isSuccess.value = false;
		isError.value = false;
		status.value = "loading";

		try {
			const result = await config.mutationFn(variables);

			if (result.ok) {
				data.value = result.data;
				error.value = null;
				isSuccess.value = true;
				status.value = "success";
				config.onSuccess?.(result.data, variables);
				config.onSettled?.(result.data, null, variables);
			} else {
				data.value = null;
				error.value = result.error;
				isError.value = true;
				status.value = "error";
				config.onError?.(result.error, variables);
				config.onSettled?.(null, result.error, variables);
			}
		} catch (err) {
			const apiError: ApiError =
				err instanceof Error
					? { message: err.message, status: 0 }
					: { message: String(err), status: 0 };
			data.value = null;
			error.value = apiError;
			isError.value = true;
			status.value = "error";
			config.onError?.(apiError, variables);
			config.onSettled?.(null, apiError, variables);
		} finally {
			isLoading.value = false;
		}
	};

	const reset = (): void => {
		data.value = null;
		error.value = null;
		isLoading.value = false;
		isSuccess.value = false;
		isError.value = false;
		status.value = "idle";
	};

	return { data, error, isLoading, isSuccess, isError, status, mutate, reset };
}
