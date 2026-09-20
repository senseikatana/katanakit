import { onDestroy } from "svelte";
import type { Readable } from "svelte/store";

/** Options for {@link useWatch}. Accepted for API parity; stores deliver changes directly. */
export interface UseWatchOptions {
	deep?: boolean;
}

/**
 * Svelte store watcher that invokes `callback` whenever `source` emits a new
 * value. Tracks the previous value so the callback receives `(value, previous)`.
 *
 * Fires once immediately (Svelte stores push their current value to new
 * subscribers) and on every subsequent change. Unsubscribes automatically on
 * component destroy when called during init.
 *
 * @typeParam T - The watched value type.
 * @param source - A readable store to watch.
 * @param callback - Invoked on change as `(value, previous)`.
 * @param options - Accepted for API parity (ignored).
 * @returns The unsubscribe function (for manual teardown outside a component).
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { writable } from "svelte/store";
 *   import { useWatch } from "katanakit-js/adapters/svelte";
 *
 *   const product = writable({ name: "", price: 0 });
 *   useWatch(product, (next, prev) => console.log(next, prev));
 * </script>
 * ```
 */
export function useWatch<T>(
	source: Readable<T>,
	callback: (value: T, previous: T | undefined) => void,
	_options: UseWatchOptions = {},
): () => void {
	let previous: T | undefined;

	const unsubscribe = source.subscribe((value) => {
		callback(value, previous);
		previous = value;
	});

	try {
		onDestroy(unsubscribe);
	} catch {
		// Not inside a component init — the caller owns teardown.
	}

	return unsubscribe;
}
