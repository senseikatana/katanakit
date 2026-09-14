import { getCurrentInstance, onUnmounted, watch } from "vue";

import type {
	WatchCallback,
	WatchOptions,
	WatchSource,
	WatchStopHandle,
} from "../../types/index.js";

/**
 * Generic reactive watcher for any Vue state.
 *
 * Thin wrapper around Vue's `watch` with `deep: true` by default, so nested
 * mutations on refs, reactive objects or getter functions re-trigger the
 * callback. Accepts a ref, a reactive object, a getter function or an array
 * of those, exactly like `watch`.
 *
 * The watcher stops automatically on component unmount when called inside
 * `setup`. Outside a component the returned stop handle can be called
 * manually. No DOM access, so it is SSR-safe.
 *
 * @typeParam T - The watched value type.
 * @param source - Native `watch` source: ref, reactive object, getter
 *   function or array of sources.
 * @param callback - Native `watch` callback. Any internal function works:
 *   sync or async, with `(newValue, oldValue)` args or with no args
 *   (e.g. `() => checkValidations()`).
 * @param options - Native `watch` options. `deep` defaults to `true`.
 * @returns Native stop handle that tears down the watcher.
 *
 * @example
 * ```ts
 * import { ref } from "vue";
 * import { useKatanaWatch } from "katanakit-js/adapters/vue";
 *
 * const product = ref({ name: "", price: 0 });
 * const stop = useKatanaWatch(product, (next) => {
 *   console.log("changed:", next);
 * });
 *
 * stop(); // teardown manually
 * ```
 *
 * @example
 * ```ts
 * // Schema-agnostic validation (Zod, Valibot, ArkType, Yup or custom):
 * import { ref } from "vue";
 * import { useKatanaWatch } from "katanakit-js/adapters/vue";
 *
 * const newProduct = ref({ name: "", price: 0 });
 * const fieldErrors = ref<Record<string, string>>({});
 *
 * const checkValidations = (): boolean => {
 *   fieldErrors.value = {};
 *   const result = productSchema.safeParse(newProduct.value);
 *   if (!result.success) {
 *     for (const issue of result.error.issues) {
 *       const field = issue.path[0];
 *       if (typeof field === "string") fieldErrors.value[field] = issue.message;
 *     }
 *     return false;
 *   }
 *   return true;
 * };
 *
 * useKatanaWatch(newProduct, () => checkValidations(), { deep: true });
 * ```
 */
export function useKatanaWatch<T>(
	source: WatchSource<T> | Array<WatchSource<unknown>>,
	callback: WatchCallback<T, T | undefined>,
	options: WatchOptions = {},
): WatchStopHandle {
	const stop = watch(source as never, callback as never, { deep: true, ...options });

	if (getCurrentInstance()) {
		onUnmounted(stop);
	}

	return stop;
}

/**
 * Alias of {@link useKatanaWatch} with the short name requested for
 * everyday use. Both share the same signature and behaviour.
 *
 * @example
 * ```ts
 * import { useWatch } from "katanakit-js/adapters/vue";
 *
 * useWatch(() => cart.total, (total) => console.log(total));
 * ```
 */
export const useWatch = useKatanaWatch;
