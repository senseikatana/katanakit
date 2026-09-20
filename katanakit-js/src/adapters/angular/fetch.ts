import { DestroyRef, inject, type Signal, signal } from "@angular/core";

import { useFetch } from "../../core/services/http.service.js";
import type { ApiError, UrlOptions } from "../../types/index.js";

/** Reactive state exposed by the {@link useRequest} factory (Angular signals). */
export interface RequestState<T = unknown> {
	data: Signal<T | null>;
	error: Signal<ApiError | null>;
	loading: Signal<boolean>;
	refetch: () => Promise<void>;
}

/**
 * Angular signal factory that wraps KatanaKit's HTTP GET. Bridges the Safe
 * Result pattern to Angular signals and never throws on HTTP errors.
 *
 * Must be called within an injection context (component field initializer,
 * constructor, or service) so it can abort in-flight requests via `DestroyRef`.
 * Stale responses are ignored via a request version counter.
 *
 * @param apiName - Name of the registered API (see `useInitApis`).
 * @param endpointName - Name of the endpoint inside that API.
 * @param options - Optional `UrlOptions` (path/query params).
 * @returns Signals `{ data, error, loading }` plus `refetch`.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { useRequest } from "katanakit-js/adapters/angular";
 *
 * @Component({ selector: "app-pokemon", template: `@if (loading()) { Loading… } @else { {{ data()?.name }} }` })
 * export class PokemonComponent {
 *   readonly result = useRequest<{ name: string }>("pokeapi", "pokemonById", { params: { id: 25 } });
 *   readonly data = this.result.data;
 *   readonly loading = this.result.loading;
 * }
 * ```
 */
export function useRequest<T>(
	apiName: string,
	endpointName: string,
	options?: UrlOptions,
): RequestState<T> {
	const destroyRef = inject(DestroyRef);

	const data = signal<T | null>(null);
	const error = signal<ApiError | null>(null);
	const loading = signal(true);

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

	destroyRef.onDestroy(() => {
		disposed = true;
		controller?.abort();
	});

	void refetch();

	return { data, error, loading, refetch };
}
