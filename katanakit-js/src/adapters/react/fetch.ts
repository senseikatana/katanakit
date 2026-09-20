import { useCallback, useEffect, useRef, useState } from "react";

import { useFetch } from "../../core/services/http.service.js";
import type { ApiError, UrlOptions } from "../../types/index.js";

/** Reactive state exposed by the {@link useRequest} hook. */
export interface RequestState<T = unknown> {
	/** The resolved data on success, `null` otherwise. */
	data: T | null;
	/** The Safe Result error on failure, `null` otherwise. */
	error: ApiError | null;
	/** Whether a request is in flight. */
	loading: boolean;
	/** Re-runs the request manually. */
	refetch: () => Promise<void>;
}

/**
 * React hook that wraps KatanaKit's HTTP GET with `useState` reactivity.
 * Bridges the Safe Result pattern to idiomatic React state and never throws
 * on HTTP errors.
 *
 * Stale responses are ignored via a request version counter and AbortController;
 * in-flight requests are aborted on unmount. Re-fetches automatically when the
 * serialized `options` change.
 *
 * @param apiName - Name of the registered API (see `useInitApis`).
 * @param endpointName - Name of the endpoint inside that API.
 * @param options - Optional `UrlOptions` (path/query params).
 * @returns `{ data, error, loading, refetch }`.
 *
 * @example
 * ```tsx
 * import { useRequest } from "katanakit-js/adapters/react";
 *
 * function Pokemon({ id }: { id: number }) {
 *   const { data, error, loading } = useRequest<{ name: string }>(
 *     "pokeapi",
 *     "pokemonById",
 *     { params: { id } },
 *   );
 *   if (loading) return <div>Loading…</div>;
 *   if (error) return <div>{error.message}</div>;
 *   return <div>{data?.name}</div>;
 * }
 * ```
 */
export function useRequest<T>(
	apiName: string,
	endpointName: string,
	options?: UrlOptions,
): RequestState<T> {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<ApiError | null>(null);
	const [loading, setLoading] = useState(true);

	const versionRef = useRef(0);
	const controllerRef = useRef<AbortController | null>(null);
	const mountedRef = useRef(true);

	const optionsKey = JSON.stringify(options ?? null);

	const refetch = useCallback(async (): Promise<void> => {
		const version = ++versionRef.current;
		controllerRef.current?.abort();
		const controller = new AbortController();
		controllerRef.current = controller;

		setLoading(true);
		setError(null);

		const result = await useFetch<T>(apiName, endpointName, {
			method: "GET",
			urlOptions: options,
			signal: controller.signal,
		});

		if (!mountedRef.current || version !== versionRef.current) return;

		if (result.ok) {
			setData(result.data);
			setError(null);
		} else if (!controller.signal.aborted) {
			setError(result.error);
		}
		setLoading(false);
	}, [apiName, endpointName, optionsKey]);

	useEffect(() => {
		mountedRef.current = true;
		void refetch();
		return () => {
			mountedRef.current = false;
			controllerRef.current?.abort();
		};
	}, [refetch]);

	return { data, error, loading, refetch };
}
