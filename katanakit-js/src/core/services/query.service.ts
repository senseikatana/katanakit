import {
	QueryClient,
	type QueryClientConfig,
	type QueryFunctionContext,
} from "@tanstack/query-core";

import type { FetchResult } from "../../types/index.js";

/**
 * Query engine — a thin facade over {@link https://tanstack.com/query | TanStack Query Core}.
 *
 * The full `@tanstack/query-core` API is re-exported from here (and therefore
 * from `katanakit-js`), so consumers get TanStack's cache, retries, stale-while-
 * revalidate, focus/reconnect refetch, garbage collection and infinite queries
 * without installing TanStack separately.
 */
export * from "@tanstack/query-core";

/** Module-level {@link QueryClient} singleton shared by every adapter (browser). */
let instance: QueryClient | null = null;

/**
 * Creates a **new** {@link QueryClient}. Use this on the server (SSR) to get one
 * client per request and avoid sharing a process-global cache across users.
 *
 * @param config - TanStack {@link QueryClientConfig} (caches, default options).
 * @returns A fresh {@link QueryClient}.
 *
 * @example
 * ```ts
 * // Server: one client per request, then dehydrate/hydrate.
 * const client = useCreateQueryClient();
 * await client.prefetchQuery({ queryKey, queryFn });
 * const state = dehydrate(client);
 * ```
 */
export function useCreateQueryClient(config: QueryClientConfig = {}): QueryClient {
	return new QueryClient(config);
}

/**
 * Returns the shared {@link QueryClient} singleton, creating one on first call.
 *
 * This is a **process-global** instance: it is the right default in the browser,
 * but on the server it would leak cached data across requests. Use
 * {@link useCreateQueryClient} per request when running under SSR.
 *
 * @returns The shared {@link QueryClient}.
 *
 * @example
 * ```ts
 * import { useQueryClient } from "katanakit-js";
 *
 * const client = useQueryClient();
 * await client.invalidateQueries({ queryKey: ["users"] });
 * ```
 */
export function useQueryClient(): QueryClient {
	return (instance ??= new QueryClient());
}

/**
 * Replaces the shared {@link QueryClient} singleton with a configured instance.
 * The previous client's caches are cleared before swapping.
 *
 * @param config - TanStack {@link QueryClientConfig} (caches, default options).
 * @returns The newly created {@link QueryClient}.
 *
 * @example
 * ```ts
 * import { useInitQueryClient } from "katanakit-js";
 *
 * useInitQueryClient({
 *   defaultOptions: { queries: { staleTime: 60_000, retry: 2 } },
 * });
 * ```
 */
export function useInitQueryClient(config: QueryClientConfig = {}): QueryClient {
	instance?.clear();
	instance = new QueryClient(config);
	return instance;
}

/**
 * Bridges a KatanaKit Safe Result fetcher into a TanStack `queryFn`.
 *
 * TanStack expects `queryFn` to resolve with data and **throw** on failure;
 * KatanaKit returns `{ data, error, ok }`. This adapter unwraps the Safe Result
 * so the two fit together. Throws a real `Error` (with `status`) so `instanceof`
 * checks and error boundaries work; the upstream response body is **not** placed
 * on the thrown error.
 *
 * Receives TanStack's {@link QueryFunctionContext}, so you can forward
 * `signal` for real request cancellation.
 *
 * @typeParam T - The resolved data type.
 * @param fn - A function returning a Safe Result (e.g. `() => useGetApi(...)`).
 * @returns A `queryFn` that throws on error.
 *
 * @example
 * ```ts
 * import { useSafeQueryFn, useGetApi, useFetch } from "katanakit-js";
 *
 * // Simple: the Safe Result gate.
 * queryFn: useSafeQueryFn(() => useGetApi("pokeapi", "pokemonById", { params: { id } }))
 *
 * // With cancellation: forward TanStack's AbortSignal into the request.
 * queryFn: useSafeQueryFn(({ signal }) =>
 *   useFetch("pokeapi", "pokemonById", { method: "GET", urlOptions: { params: { id } }, signal }),
 * )
 * ```
 */
export function useSafeQueryFn<T>(
	fn: (context: QueryFunctionContext) => Promise<FetchResult<T>>,
): (context: QueryFunctionContext) => Promise<T> {
	return async (context) => {
		const result = await fn(context);
		if (!result.ok) {
			throw Object.assign(new Error(result.error.message), { status: result.error.status });
		}
		return result.data as T;
	};
}
