import { onDestroy } from "svelte";
import { type Readable, writable } from "svelte/store";

import { useFetch } from "../../core/services/http.service.js";
import type { ApiError, UrlOptions } from "../../types/index.js";

/** Reactive state exposed by the {@link useRequest} factory (Svelte stores). */
export interface RequestState<T = unknown> {
	data: Readable<T | null>;
	error: Readable<ApiError | null>;
	loading: Readable<boolean>;
	refetch: () => Promise<void>;
}

/**
 * Svelte store factory that wraps KatanaKit's HTTP GET. Bridges the Safe
 * Result pattern to idiomatic Svelte stores and never throws on HTTP errors.
 *
 * Stale responses are ignored via a request version counter and AbortController;
 * in-flight requests are aborted on component destroy.
 *
 * @param apiName - Name of the registered API (see `useInitApis`).
 * @param endpointName - Name of the endpoint inside that API.
 * @param options - Optional `UrlOptions` (path/query params).
 * @returns Readable stores `{ data, error, loading }` plus `refetch`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useRequest } from "katanakit-js/adapters/svelte";
 *
 *   const { data, error, loading } = useRequest("pokeapi", "pokemonById", { params: { id: 25 } });
 * </script>
 *
 * {#if $loading}
 *   <div>Loading…</div>
 * {:else if $error}
 *   <div>{$error.message}</div>
 * {:else}
 *   <div>{$data?.name}</div>
 * {/if}
 * ```
 */
export function useRequest<T>(
	apiName: string,
	endpointName: string,
	options?: UrlOptions,
): RequestState<T> {
	const data = writable<T | null>(null);
	const error = writable<ApiError | null>(null);
	const loading = writable(true);

	let version = 0;
	let controller: AbortController | null = null;
	let disposed = false;

	const refetch = async (): Promise<void> => {
		const current = ++version;
		controller?.abort();
		const next = new AbortController();
		controller = next;

		loading.set(true);
		error.set(null);

		const result = await useFetch<T>(apiName, endpointName, {
			method: "GET",
			urlOptions: options,
			signal: next.signal,
		});

		if (disposed || current !== version) return;

		if (result.ok) {
			data.set(result.data);
			error.set(null);
		} else if (!next.signal.aborted) {
			error.set(result.error);
		}
		loading.set(false);
	};

	try {
		onDestroy(() => {
			disposed = true;
			controller?.abort();
		});
	} catch {
		// Not inside a component init — the caller owns teardown.
	}

	void refetch();

	return { data, error, loading, refetch };
}
