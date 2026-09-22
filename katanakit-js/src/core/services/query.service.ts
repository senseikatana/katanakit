import type { ApiError, FetchResult } from "../../types/index.js";

// ============================================================
// Types
// ============================================================

/** Status of a cached query. */
export type QueryStatus = "idle" | "loading" | "success" | "error";

/** Serializable query key — array of primitives or nested arrays/objects. */
export type QueryKey = readonly unknown[];

/** Fetcher function that returns a Safe Result. */
export type QueryFn<T> = () => Promise<FetchResult<T>>;

/** Configuration for a single query. */
export interface QueryConfig<T = unknown> {
	queryKey: QueryKey;
	queryFn: QueryFn<T>;
	/** Time in ms before cached data is considered stale (default: 0). */
	staleTime?: number;
	/** Time in ms to keep unused data in cache (default: 5 min). */
	cacheTime?: number;
	/** Number of retry attempts on failure (default: 3). */
	retry?: number;
	/** Base delay in ms for exponential backoff (default: 1000). */
	retryDelay?: number;
	/** Refetch when the window/tab regains focus (default: true). */
	refetchOnWindowFocus?: boolean;
	/** Refetch when the network reconnects (default: true). */
	refetchOnReconnect?: boolean;
	/** Whether the query is enabled (default: true). */
	enabled?: boolean;
	/** Called on successful fetch. */
	onSuccess?: (data: T) => void;
	/** Called on error. */
	onError?: (error: ApiError) => void;
}

/** Reactive state of a query. */
export interface QueryState<T = unknown> {
	status: QueryStatus;
	data: T | null;
	error: ApiError | null;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	isStale: boolean;
	dataUpdatedAt: number;
	errorUpdatedAt: number;
	fetchCount: number;
}

/** Observer (subscriber) that listens to query state changes. */
export type QueryObserver<T = unknown> = (state: QueryState<T>) => void;

/** Configuration for a mutation. */
export interface MutationConfig<TData = unknown, TVariables = unknown> {
	mutationFn: (variables: TVariables) => Promise<FetchResult<TData>>;
	onSuccess?: (data: TData, variables: TVariables) => void;
	onError?: (error: ApiError, variables: TVariables) => void;
	onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void;
}

/** State of a mutation. */
export interface MutationState<TData = unknown> {
	status: "idle" | "loading" | "success" | "error";
	data: TData | null;
	error: ApiError | null;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
}

/** Default configuration for all queries. */
export interface QueryClientConfig {
	defaultOptions?: {
		queries?: Partial<Omit<QueryConfig, "queryKey" | "queryFn">>;
	};
}

// ============================================================
// Helpers
// ============================================================

const FIVE_MINUTES = 5 * 60 * 1_000;

function hashQueryKey(key: QueryKey): string {
	return JSON.stringify(key, (_, v) =>
		typeof v === "object" && v !== null && !Array.isArray(v)
			? Object.keys(v as Record<string, unknown>)
					.sort()
					.reduce(
						(sorted, k) => {
							(sorted as Record<string, unknown>)[k] = (v as Record<string, unknown>)[k];
							return sorted;
						},
						{} as Record<string, unknown>,
					)
			: v,
	);
}

function delayMs(base: number, attempt: number): number {
	return Math.min(base * 2 ** attempt, 30_000);
}

// ============================================================
// QueryCache — manages individual query entries
// ============================================================

class QueryCache {
	private entries = new Map<string, QueryEntry<any>>();

	get<T>(hash: string): QueryEntry<T> | undefined {
		return this.entries.get(hash) as QueryEntry<T> | undefined;
	}

	set<T>(hash: string, entry: QueryEntry<T>): void {
		this.entries.set(hash, entry as QueryEntry<any>);
	}

	delete(hash: string): void {
		const entry = this.entries.get(hash);
		if (entry?.gcTimeout) clearTimeout(entry.gcTimeout);
		this.entries.delete(hash);
	}

	entries_(): Map<string, QueryEntry<any>> {
		return this.entries;
	}

	scheduleGC<T>(hash: string, cacheTime: number): void {
		const entry = this.get<T>(hash);
		if (!entry || entry.subscriberCount > 0) return;
		entry.gcTimeout = setTimeout(() => {
			this.delete(hash);
		}, cacheTime);
	}

	cancelGC<T>(hash: string): void {
		const entry = this.get<T>(hash);
		if (entry?.gcTimeout) {
			clearTimeout(entry.gcTimeout);
			entry.gcTimeout = null;
		}
	}
}

// ============================================================
// QueryEntry — internal state for a single query
// ============================================================

interface QueryEntry<T> {
	state: QueryState<T>;
	config: QueryConfig<T>;
	observers: Set<QueryObserver<T>>;
	gcTimeout: ReturnType<typeof setTimeout> | null;
	retryCount: number;
	fetchPromise: Promise<FetchResult<T>> | null;
	subscriberCount: number;
	cancelled: boolean;
}

// ============================================================
// QueryClient — the main public API
// ============================================================

export class QueryClient {
	private cache: QueryCache;
	private defaults: QueryClientConfig["defaultOptions"];

	constructor(config: QueryClientConfig = {}) {
		this.cache = new QueryCache();
		this.defaults = config.defaultOptions ?? {};
	}

	// ----------------------------------------------------------
	// Core: fetchQuery
	// ----------------------------------------------------------

	/**
	 * Fetches data for a query key, using the cache when possible.
	 * Returns the cached data immediately if fresh, then optionally
	 * refetches in the background (stale-while-revalidate).
	 */
	async fetchQuery<T>(config: QueryConfig<T>): Promise<T> {
		const mergedConfig = this.mergeDefaults(config);
		const hash = hashQueryKey(mergedConfig.queryKey);
		let entry = this.cache.get<T>(hash);

		if (!entry) {
			entry = this.createEntry<T>(mergedConfig);
			this.cache.set(hash, entry);
		} else {
			// `subscribe()` may have created a placeholder entry whose `queryFn`
			// returns an empty result. Always refresh the config with the real one.
			entry.config = mergedConfig;
		}

		// Cancel GC if the entry was scheduled for removal.
		this.cache.cancelGC(hash);

		// A new fetch supersedes any prior cancellation.
		entry.cancelled = false;

		// If data is fresh, return it immediately.
		if (entry.state.status === "success" && !this.isStale(entry)) {
			return entry.state.data as T;
		}

		// If a fetch is already in flight, deduplicate.
		if (entry.fetchPromise) {
			const result = await entry.fetchPromise;
			if (result.ok) return result.data;
			throw result.error;
		}

		// Execute fetch.
		return this.executeFetch(entry, hash);
	}

	/**
	 * Prefetches data into the cache without returning it.
	 * Useful for anticipatory fetching.
	 */
	async prefetchQuery<T>(config: QueryConfig<T>): Promise<void> {
		try {
			await this.fetchQuery(config);
		} catch {
			// Prefetch errors are silently ignored.
		}
	}

	/**
	 * Returns the cached data for a query key, or undefined if not cached.
	 */
	getQueryData<T>(queryKey: QueryKey): T | undefined {
		const hash = hashQueryKey(queryKey);
		const entry = this.cache.get<T>(hash);
		return entry?.state.data ?? undefined;
	}

	/**
	 * Sets query data directly in the cache (optimistic updates).
	 */
	setQueryData<T>(queryKey: QueryKey, updater: T | ((old: T | undefined) => T)): void {
		const hash = hashQueryKey(queryKey);
		const entry = this.cache.get<T>(hash);
		if (!entry) return;

		const oldData = entry.state.data;
		const newData =
			typeof updater === "function" ? (updater as (old: T | null) => T)(oldData) : updater;

		entry.state = {
			...entry.state,
			data: newData,
			status: "success",
			dataUpdatedAt: Date.now(),
			isLoading: false,
			isSuccess: true,
			isError: false,
		};

		this.notifyObservers(entry);
	}

	/**
	 * Marks queries matching the filter as stale and optionally refetches
	 * active queries.
	 */
	async invalidateQueries(filters?: { queryKey?: QueryKey }): Promise<void> {
		const prefix = filters?.queryKey ? hashQueryKey(filters.queryKey) : undefined;

		for (const [hash, entry] of this.cache.entries_()) {
			if (prefix && !hash.startsWith(prefix)) continue;
			(entry as QueryEntry<unknown>).state.isStale = true;
			this.notifyObservers(entry as QueryEntry<unknown>);
		}
	}

	/**
	 * Removes a query from the cache.
	 */
	removeQueries(queryKey: QueryKey): void {
		const hash = hashQueryKey(queryKey);
		this.cache.delete(hash);
	}

	/**
	 * Clears the entire cache.
	 */
	clear(): void {
		for (const [hash] of this.cache.entries_()) {
			this.cache.delete(hash);
		}
	}

	/**
	 * Returns the current state of a cached query (reactive signal).
	 * Subscribes to future updates.
	 */
	getQueryState<T>(queryKey: QueryKey): QueryState<T> | undefined {
		const hash = hashQueryKey(queryKey);
		const entry = this.cache.get<T>(hash);
		return entry?.state;
	}

	/**
	 * Subscribes to state changes for a specific query.
	 * Returns an unsubscribe function.
	 */
	subscribe<T>(queryKey: QueryKey, observer: QueryObserver<T>): () => void {
		const hash = hashQueryKey(queryKey);
		let entry = this.cache.get<T>(hash);

		if (!entry) {
			entry = this.createEntry<T>({
				queryKey,
				queryFn: () =>
					Promise.resolve({ data: null as T, error: null, url: "", status: 0, ok: true as const }),
			});
			this.cache.set(hash, entry);
		}

		entry.observers.add(observer as QueryObserver<unknown>);
		entry.subscriberCount++;
		this.cache.cancelGC(hash);

		const captured = entry;
		return () => {
			captured.observers.delete(observer as QueryObserver<unknown>);
			captured.subscriberCount--;
			if (captured.subscriberCount === 0) {
				this.cache.scheduleGC(hash, captured.config.cacheTime ?? FIVE_MINUTES);
			}
		};
	}

	/**
	 * Cancels an in-flight request for a query.
	 *
	 * Marks the entry as cancelled; the next time its fetch resolves, the
	 * result is discarded without updating state or notifying observers.
	 */
	cancelQueries(queryKey: QueryKey): void {
		const hash = hashQueryKey(queryKey);
		const entry = this.cache.get(hash);
		if (!entry) return;
		entry.cancelled = true;
		entry.fetchPromise = null;
	}

	// ----------------------------------------------------------
	// Internal
	// ----------------------------------------------------------

	private mergeDefaults<T>(config: QueryConfig<T>): QueryConfig<T> {
		const qDefaults = this.defaults?.queries ?? {};
		return {
			staleTime: 0,
			cacheTime: FIVE_MINUTES,
			retry: 3,
			retryDelay: 1000,
			refetchOnWindowFocus: true,
			refetchOnReconnect: true,
			enabled: true,
			...qDefaults,
			...config,
		};
	}

	private createEntry<T>(config: QueryConfig<T>): QueryEntry<T> {
		return {
			state: {
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
			},
			config,
			observers: new Set(),
			gcTimeout: null,
			retryCount: 0,
			fetchPromise: null,
			subscriberCount: 0,
			cancelled: false,
		};
	}

	private isStale(entry: QueryEntry<any>): boolean {
		if (entry.state.isStale) return true;
		const staleTime = entry.config.staleTime ?? 0;
		if (staleTime === Infinity) return false;
		return Date.now() - entry.state.dataUpdatedAt > staleTime;
	}

	private async executeFetch<T>(entry: QueryEntry<T>, hash: string): Promise<T> {
		const maxRetries = entry.config.retry ?? 3;
		const baseDelay = entry.config.retryDelay ?? 1000;

		entry.state = {
			...entry.state,
			status: "loading",
			isLoading: true,
			fetchCount: entry.state.fetchCount + 1,
		};
		this.notifyObservers(entry);

		const fetchWithRetry = async (attempt: number): Promise<FetchResult<T>> => {
			const result = await entry.config.queryFn();

			if (!result.ok && attempt < maxRetries) {
				await new Promise((r) => setTimeout(r, delayMs(baseDelay, attempt)));
				entry.retryCount = attempt + 1;
				return fetchWithRetry(attempt + 1);
			}

			return result;
		};

		const fetchPromise = fetchWithRetry(0);
		entry.fetchPromise = fetchPromise;

		let result: FetchResult<T>;
		try {
			result = await fetchPromise;
		} catch (err) {
			entry.fetchPromise = null;
			const error: ApiError =
				err instanceof Error
					? { message: err.message, status: 0 }
					: { message: String(err), status: 0 };
			this.applyError(entry, hash, error);
			throw error;
		}

		entry.fetchPromise = null;

		// Cancellation wins over result application.
		if (entry.cancelled) {
			return Promise.reject({
				message: "Query cancelled",
				status: 0,
			} as ApiError);
		}

		// If the entry was removed or superseded, discard.
		if (this.cache.get(hash) !== entry) {
			return result.ok ? result.data : Promise.reject(result.error);
		}

		if (result.ok) {
			entry.state = {
				status: "success",
				data: result.data,
				error: null,
				isLoading: false,
				isSuccess: true,
				isError: false,
				isStale: false,
				dataUpdatedAt: Date.now(),
				errorUpdatedAt: entry.state.errorUpdatedAt,
				fetchCount: entry.state.fetchCount,
			};
			entry.retryCount = 0;
			entry.config.onSuccess?.(result.data);
			this.notifyObservers(entry);
			return result.data;
		}

		this.applyError(entry, hash, result.error);
		entry.config.onError?.(result.error);
		throw result.error;
	}

	private applyError<T>(entry: QueryEntry<T>, hash: string, error: ApiError): void {
		if (this.cache.get(hash) !== entry) return;
		entry.state = {
			...entry.state,
			status: "error",
			error,
			isLoading: false,
			isSuccess: false,
			isError: true,
			errorUpdatedAt: Date.now(),
		};
		this.notifyObservers(entry);
	}

	private notifyObservers(entry: QueryEntry<any>): void {
		for (const observer of entry.observers) {
			try {
				observer(entry.state);
			} catch {
				// Observer errors are swallowed.
			}
		}
	}
}

// ============================================================
// Singleton facade
// ============================================================

let instance: QueryClient | null = null;

/**
 * Returns the global {@link QueryClient} singleton.
 * Creates one with default options on first call.
 */
export function useQueryClient(): QueryClient {
	if (!instance) {
		instance = new QueryClient();
	}
	return instance;
}

/**
 * Initialises the global {@link QueryClient} singleton with custom options.
 * Must be called before any `useQuery` call.
 */
export function useInitQueryClient(config: QueryClientConfig): QueryClient {
	instance = new QueryClient(config);
	return instance;
}
