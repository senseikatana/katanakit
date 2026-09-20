import { createSignal, onCleanup, type Signal } from "solid-js";

import { useFetch } from "../../core/services/http.service.js";
import type { ApiError, UrlOptions } from "../../types/index.js";

/** Reactive state exposed by the {@link useRequest} primitive (Solid accessors). */
export interface RequestState<T = unknown> {
	data: Signal<T | null>[0];
	error: Signal<ApiError | null>[0];
	loading: Signal<boolean>[0];
	refetch: () => Promise<void>;
}

/**
 * Solid primitive that wraps KatanaKit's HTTP GET with fine-grained signals.
 * Bridges the Safe Result pattern to idiomatic Solid state and never throws
 * on HTTP errors.
 *
 * Stale responses are ignored via a request version counter and AbortController;
 * in-flight requests are aborted on cleanup.
 *
 * @param apiName - Name of the registered API (see `useInitApis`).
 * @param endpointName - Name of the endpoint inside that API.
 * @param options - Optional `UrlOptions` (path/query params).
 * @returns Signal accessors `{ data, error, loading }` plus `refetch`.
 *
 * @example
 * ```tsx
 * import { Show } from "solid-js";
 * import { useRequest } from "katanakit-js/adapters/solid";
 *
 * function Pokemon() {
 *   const { data, error, loading } = useRequest<{ name: string }>(
 *     "pokeapi",
 *     "pokemonById",
 *     { params: { id: 25 } },
 *   );
 *   return (
 *     <Show when={!loading() && !error()} fallback={<div>Loading…</div>}>
 *       <div>{data()?.name}</div>
 *     </Show>
 *   );
 * }
 * ```
 */
export function useRequest<T>(
	apiName: string,
	endpointName: string,
	options?: UrlOptions,
): RequestState<T> {
	const [data, setData] = createSignal<T | null>(null);
	const [error, setError] = createSignal<ApiError | null>(null);
	const [loading, setLoading] = createSignal(true);

	let version = 0;
	let controller: AbortController | null = null;
	let disposed = false;

	const refetch = async (): Promise<void> => {
		const current = ++version;
		controller?.abort();
		const next = new AbortController();
		controller = next;

		setLoading(true);
		setError(null);

		const result = await useFetch<T>(apiName, endpointName, {
			method: "GET",
			urlOptions: options,
			signal: next.signal,
		});

		if (disposed || current !== version) return;

		if (result.ok) {
			setData(() => result.data);
			setError(null);
		} else if (!next.signal.aborted) {
			setError(result.error);
		}
		setLoading(false);
	};

	onCleanup(() => {
		disposed = true;
		controller?.abort();
	});

	void refetch();

	return { data, error, loading, refetch };
}
