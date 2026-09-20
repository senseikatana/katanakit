import { useEffect, useRef } from "react";

/** Options for {@link useWatch}. */
export interface UseWatchOptions {
	/**
	 * Compare values deeply (via JSON serialization) instead of by reference.
	 * Defaults to `true`, matching the Vue adapter.
	 */
	deep?: boolean;
}

/**
 * React effect-based watcher that invokes `callback` whenever the value
 * produced by `source` changes. Tracks the previous value so the callback
 * receives `(value, previous)`.
 *
 * Runs once on mount (with `previous` undefined) and on every change. Cleans
 * up automatically on unmount.
 *
 * @typeParam T - The watched value type.
 * @param source - A getter returning the value to watch.
 * @param callback - Invoked on change as `(value, previous)`.
 * @param options - `deep` (default `true`) serializes objects for comparison.
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { useWatch } from "katanakit-js/adapters/react";
 *
 * function Form() {
 *   const [product, setProduct] = useState({ name: "", price: 0 });
 *   useWatch(() => product, (next, prev) => {
 *     console.log("changed:", next, prev);
 *   });
 *   // ...
 * }
 * ```
 */
export function useWatch<T>(
	source: () => T,
	callback: (value: T, previous: T | undefined) => void,
	options: UseWatchOptions = {},
): void {
	const { deep = true } = options;
	const previous = useRef<T | undefined>(undefined);
	const current = source();
	const dep = deep ? JSON.stringify(current) : current;

	useEffect(() => {
		callback(current, previous.current);
		previous.current = current;
	}, [dep]);
}
