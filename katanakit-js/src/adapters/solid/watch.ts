import { createEffect } from "solid-js";

/** Options for {@link useWatch}. Accepted for API parity; Solid tracks deep reads natively. */
export interface UseWatchOptions {
	deep?: boolean;
}

/**
 * Solid effect-based watcher that invokes `callback` whenever any signal read
 * inside `source` changes. Tracks the previous value so the callback receives
 * `(value, previous)`.
 *
 * Solid's fine-grained reactivity means nested mutations are tracked
 * automatically, so `deep` is effectively always on. Runs once on creation and
 * on every tracked change; cleans up with the owning component.
 *
 * @typeParam T - The watched value type.
 * @param source - A getter that reads the signals to watch.
 * @param callback - Invoked on change as `(value, previous)`.
 * @param options - Accepted for API parity (ignored).
 *
 * @example
 * ```tsx
 * import { createSignal } from "solid-js";
 * import { useWatch } from "katanakit-js/adapters/solid";
 *
 * function Form() {
 *   const [product, setProduct] = createSignal({ name: "", price: 0 });
 *   useWatch(() => product(), (next, prev) => console.log(next, prev));
 *   // ...
 * }
 * ```
 */
export function useWatch<T>(
	source: () => T,
	callback: (value: T, previous: T | undefined) => void,
	_options: UseWatchOptions = {},
): void {
	let previous: T | undefined;

	createEffect(() => {
		const value = source();
		callback(value, previous);
		previous = value;
	});
}
