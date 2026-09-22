import { useGetStorage, useSetStorage } from "../../infrastructure/storage/storage.service.js";
import type {
	SignalGetter,
	SignalListener,
	SignalSetter,
	StorageTarget,
	Subscribable,
	ToggleSignalSetter,
} from "../../types/index.js";
import { useLogger } from "./logger.service.js";

// Module-level batching state.
let isBatching = false;
const batchQueue: Set<() => void> = new Set();

/**
 * Internal: schedules a notification function. If batching is active the
 * notification is queued; otherwise it executes immediately.
 *
 * @param notifyFn - The callback to schedule.
 */
function NOTIFY(notifyFn: () => void): void {
	if (isBatching) {
		batchQueue.add(notifyFn);
	} else {
		notifyFn();
	}
}

/**
 * Creates a reactive signal with a getter and setter.
 *
 * The getter is callable and also exposes a `useSubscribe` method for
 * listening to value changes. The setter accepts either a direct value or
 * an updater function.
 *
 * @typeParam T - The signal value type.
 * @param initialValue - The initial value of the signal.
 * @returns A tuple of `[getter, setter]`.
 *
 * @example
 * ```ts
 * const [count, setCount] = useCreateSignal(0);
 * count(); // 0
 * setCount(1);
 * count(); // 1
 * setCount(prev => prev + 1);
 * count(); // 2
 *
 * const unsub = count.useSubscribe((newVal, oldVal) => {
 *   console.log(`${oldVal} -> ${newVal}`);
 * });
 * ```
 */
export function useCreateSignal<T>(initialValue: T): [SignalGetter<T>, SignalSetter<T>] {
	let value = initialValue;
	const listeners = new Set<SignalListener<T>>();

	const get = (() => value) as SignalGetter<T>;

	const set: SignalSetter<T> = (nextValue) => {
		const oldValue = value;
		value = typeof nextValue === "function" ? (nextValue as (prev: T) => T)(oldValue) : nextValue;

		if (value !== oldValue) {
			NOTIFY(() => {
				for (const listener of listeners) {
					try {
						listener(value, oldValue);
					} catch (error) {
						useLogger("[createSignal] Listener error:", error, "error");
					}
				}
			});
		}
	};

	get.useSubscribe = (listener: SignalListener<T>): (() => void) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	};

	return [get, set];
}

/**
 * Creates a side effect that re-runs whenever any of the provided signals
 * emit a new value. An optional cleanup function returned from the callback
 * is invoked before each re-run and on disposal.
 *
 * @param callback - Effect body. May return a cleanup function.
 * @param signals - Array of subscribable signals to react to.
 * @returns A dispose function that tears down all subscriptions and runs
 *   the final cleanup.
 *
 * @example
 * ```ts
 * const [name, setName] = useCreateSignal("world");
 * const dispose = useCreateEffect(() => {
 *   console.log(`Hello, ${name()}!`);
 *   return () => console.log("cleaning up");
 * }, [name]);
 *
 * setName("Katana"); // logs "Hello, Katana!"
 * dispose();         // logs "cleaning up"
 * ```
 */
export function useCreateEffect(
	callback: () => void | (() => void),
	signals: Subscribable<unknown>[],
): () => void {
	let cleanup: void | (() => void);

	const execute = () => {
		if (typeof cleanup === "function") {
			try {
				cleanup();
			} catch (error) {
				useLogger("[createEffect] Previous cleanup error:", error, "error");
			}
		}

		try {
			cleanup = callback() as void | (() => void);
		} catch (error) {
			useLogger("[createEffect] Effect execution error:", error, "error");
		}
	};

	const unsubscribes = signals.map((signal) => {
		if (signal && typeof signal.useSubscribe === "function") {
			return signal.useSubscribe(execute);
		}
		return () => {};
	});

	execute();

	return () => {
		if (typeof cleanup === "function") {
			try {
				cleanup();
			} catch (error) {
				useLogger("[createEffect] Final cleanup error:", error, "error");
			}
		}
		for (const unsub of unsubscribes) {
			unsub();
		}
	};
}

/**
 * Creates a memoised signal whose value is derived from a computation.
 * The computation re-runs whenever any of the provided signals change.
 *
 * @typeParam T - The computed value type.
 * @param computation - Pure function that derives the value.
 * @param signals - Signals the computation depends on.
 * @returns A read-only getter for the memoised value.
 *
 * @example
 * ```ts
 * const [a, setA] = useCreateSignal(2);
 * const [b, setB] = useCreateSignal(3);
 * const sum = useCreateMemo(() => a() + b(), [a, b]);
 * sum(); // 5
 * setA(10);
 * sum(); // 13
 * ```
 */
export function useCreateMemo<T>(
	computation: () => T,
	signals: Subscribable<unknown>[],
): SignalGetter<T> {
	const [get, set] = useCreateSignal<T>(computation());

	useCreateEffect(() => {
		set(computation());
	}, signals);

	return get;
}

/**
 * Creates a boolean toggle signal.
 *
 * @param initialValue - Starting value (defaults to `false`).
 * @returns A tuple of `[getter, { useSet, useToggle }]`.
 *
 * @example
 * ```ts
 * const [isOpen, { useSet, useToggle }] = useCreateToggle();
 * isOpen();    // false
 * useToggle();
 * isOpen();    // true
 * useSet(false);
 * isOpen();    // false
 * ```
 */
export function useCreateToggle(initialValue = false): [SignalGetter<boolean>, ToggleSignalSetter] {
	const [get, set] = useCreateSignal<boolean>(initialValue);
	const toggle = () => set((prev) => !prev);

	return [get, { useSet: set, useToggle: toggle }];
}

/**
 * Creates a signal that persists its value to a storage backend
 * (localStorage, sessionStorage, etc.). Reads the initial value from
 * storage on creation.
 *
 * @typeParam T - The signal value type.
 * @param key - Storage key.
 * @param fallbackValue - Value used when the key is not in storage.
 * @param target - Storage backend (defaults to `"localStorage"`).
 * @returns A tuple of `[getter, setter]`. The setter writes through to
 *   storage.
 *
 * @example
 * ```ts
 * const [theme, setTheme] = useCreateStorageSignal("theme", "dark");
 * theme(); // "dark" (or whatever was stored)
 * setTheme("light"); // persists to localStorage
 * ```
 */
export function useCreateStorageSignal<T>(
	key: string,
	fallbackValue: T,
	target: StorageTarget = "localStorage",
): [SignalGetter<T>, SignalSetter<T>] {
	let initial: T = fallbackValue;

	try {
		const stored = useGetStorage<T>(key, target);
		if (stored !== null && stored !== undefined) {
			initial = stored;
		}
	} catch (error) {
		useLogger(`[createStorageSignal] Error reading from ${target}:`, error, "error");
	}

	const [get, set] = useCreateSignal<T>(initial);

	const setWithStorage: SignalSetter<T> = (nextValue) => {
		set((prev) => {
			const newValue = typeof nextValue === "function" ? (nextValue as (p: T) => T)(prev) : nextValue;

			try {
				useSetStorage(key, newValue, target);
			} catch (error) {
				useLogger(`[createStorageSignal] Error writing to ${target}:`, error, "error");
			}

			return newValue;
		});
	};

	return [get, setWithStorage];
}

/**
 * Creates a signal whose setter debounces writes by `delayMs` milliseconds.
 * Useful for search inputs or any value that triggers expensive work.
 *
 * @typeParam T - The signal value type.
 * @param initialValue - The initial value.
 * @param delayMs - Debounce delay in milliseconds (defaults to `300`).
 * @returns A tuple of `[getter, debouncedSetter]`. The setter exposes a
 *   `useCancel()` method to abort a pending write.
 *
 * @example
 * ```ts
 * const [query, setQuery] = useCreateDebouncedSignal("", 250);
 * setQuery("hello"); // won't update until 250ms of quiet
 * setQuery.useCancel(); // abort pending write
 * ```
 */
export function useCreateDebouncedSignal<T>(
	initialValue: T,
	delayMs = 300,
): [SignalGetter<T>, SignalSetter<T> & { useCancel: () => void }] {
	const [get, set] = useCreateSignal<T>(initialValue);
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	const debouncedSet: SignalSetter<T> & { useCancel: () => void } = ((nextValue) => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			set(nextValue);
			timeoutId = undefined;
		}, delayMs);
	}) as SignalSetter<T> & { useCancel: () => void };

	debouncedSet.useCancel = () => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
			timeoutId = undefined;
		}
	};

	return [get, debouncedSet];
}

/**
 * Returns a batch function that defers signal notifications until the
 * callback completes. Nested calls are supported -- only the outermost
 * batch flushes the queue.
 *
 * @returns A `batch(callback)` function.
 *
 * @example
 * ```ts
 * const batch = useCreateBatch();
 * const [a, setA] = useCreateSignal(0);
 * const [b, setB] = useCreateSignal(0);
 *
 * batch(() => {
 *   setA(1);
 *   setB(2);
 *   // listeners fire only once here, not twice
 * });
 * ```
 */
export function useCreateBatch(): (callback: () => void) => void {
	return (callback: () => void) => {
		const wasBatching = isBatching;
		isBatching = true;
		try {
			callback();
		} catch (error) {
			useLogger("[createBatch] Batch block error:", error, "error");
		} finally {
			if (!wasBatching) {
				isBatching = false;
				const queue = Array.from(batchQueue);
				batchQueue.clear();
				for (const notify of queue) {
					notify();
				}
			}
		}
	};
}
