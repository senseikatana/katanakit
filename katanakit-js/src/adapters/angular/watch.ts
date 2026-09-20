import { effect } from "@angular/core";

/** Options for {@link useWatch}. Accepted for API parity; Angular tracks signal reads natively. */
export interface UseWatchOptions {
	deep?: boolean;
}

/**
 * Angular signal watcher that invokes `callback` whenever any signal read
 * inside `source` changes. Tracks the previous value so the callback receives
 * `(value, previous)`.
 *
 * Must be called within an injection context; the effect auto-disposes with
 * the owning scope. Angular tracks nested signal reads automatically, so
 * `deep` is effectively always on.
 *
 * @typeParam T - The watched value type.
 * @param source - A getter that reads the signals to watch.
 * @param callback - Invoked on change as `(value, previous)`.
 * @param options - Accepted for API parity (ignored).
 *
 * @example
 * ```ts
 * import { Component, signal } from "@angular/core";
 * import { useWatch } from "katanakit-js/adapters/angular";
 *
 * @Component({ selector: "app-form", template: "" })
 * export class FormComponent {
 *   readonly product = signal({ name: "", price: 0 });
 *   constructor() {
 *     useWatch(() => this.product(), (next, prev) => console.log(next, prev));
 *   }
 * }
 * ```
 */
export function useWatch<T>(
	source: () => T,
	callback: (value: T, previous: T | undefined) => void,
	_options: UseWatchOptions = {},
): void {
	let previous: T | undefined;

	effect(() => {
		const value = source();
		callback(value, previous);
		previous = value;
	});
}
