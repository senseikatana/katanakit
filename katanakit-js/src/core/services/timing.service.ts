import type { IntervalControl, TimeoutControl } from "../../types/index.js";
import { useLogger } from "./logger.service.js";

type TimerId = ReturnType<typeof setTimeout>;

/**
 * Executes a callback after `ms` milliseconds, returning a cancellable
 * promise that resolves with the callback's result.
 *
 * @typeParam T - The callback's return type.
 * @param callback - Function to execute after the delay.
 * @param ms - Delay in milliseconds.
 * @returns A `TimeoutControl` with `promise` and `cancel()`.
 *
 * @example
 * ```ts
 * const { promise, cancel } = useSetTimeout(() => 42, 1000);
 * cancel(); // rejects the promise with "Timeout cancelled"
 * ```
 */
export function useSetTimeout<T>(callback: () => T | Promise<T>, ms: number): TimeoutControl<T> {
	let timerId: TimerId | undefined;
	let isCancelled = false;
	let rejectFn: ((reason?: unknown) => void) | undefined;

	const promise = new Promise<T>((resolve, reject) => {
		rejectFn = reject;
		timerId = setTimeout(async () => {
			if (isCancelled) return;

			try {
				const result = await callback();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		}, ms);
	});

	const cancel = () => {
		if (isCancelled) return;
		isCancelled = true;
		if (timerId !== undefined) {
			clearTimeout(timerId);
		}
		rejectFn?.(new Error("Timeout cancelled"));
	};

	return { promise, cancel };
}

/**
 * Repeatedly executes a callback at `ms` intervals with pause/resume/stop
 * controls. Uses recursive `setTimeout` internally to avoid overlap.
 *
 * @param callback - Function executed on each tick.
 * @param ms - Interval in milliseconds.
 * @param immediate - If `true`, fires the callback immediately before the
 *   first interval (defaults to `false`).
 * @returns An `IntervalControl` with `pause`, `resume`, `stop`, and
 *   `isRunning`.
 *
 * @example
 * ```ts
 * const timer = useInterval(() => console.log("tick"), 1000);
 * setTimeout(() => timer.pause(), 3000);
 * setTimeout(() => timer.resume(), 5000);
 * setTimeout(() => timer.stop(), 10000);
 * ```
 */
export function useInterval(
	callback: () => void | Promise<void>,
	ms: number,
	immediate = false,
): IntervalControl {
	let timerId: TimerId | null = null;
	let isPaused = false;
	let isStopped = false;
	let isExecuting = false;

	const execute = async () => {
		if (isPaused || isStopped || isExecuting) return;

		isExecuting = true;
		try {
			await callback();
		} catch (error) {
			useLogger("error", "[interval] Callback error:", error);
		} finally {
			isExecuting = false;
		}
	};

	const scheduleNext = () => {
		if (isStopped || isPaused) return;
		timerId = setTimeout(async () => {
			await execute();
			scheduleNext();
		}, ms);
	};

	const stop = () => {
		isStopped = true;
		isPaused = false;
		if (timerId) {
			clearTimeout(timerId);
			timerId = null;
		}
	};

	const pause = () => {
		if (isStopped) return;
		isPaused = true;
		if (timerId) {
			clearTimeout(timerId);
			timerId = null;
		}
	};

	const resume = () => {
		if (isStopped || !isPaused) return;
		isPaused = false;
		scheduleNext();
	};

	const isRunning = () => !isStopped && !isPaused;

	if (immediate) {
		execute().then(() => scheduleNext());
	} else {
		scheduleNext();
	}

	return { pause, resume, stop, isRunning };
}

/**
 * Returns a debounced version of `func` that delays invocation until
 * `delayMs` milliseconds of quiet.
 *
 * @typeParam T - The wrapped function type.
 * @param func - Function to debounce.
 * @param delayMs - Debounce delay in milliseconds.
 * @returns A debounced function with the same signature.
 *
 * @example
 * ```ts
 * const debouncedSearch = useDebounce(fetchResults, 300);
 * input.addEventListener("input", () => debouncedSearch(input.value));
 * ```
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	delayMs: number,
): (...args: Parameters<T>) => void {
	let timeoutId: TimerId | undefined;

	return (...args: Parameters<T>) => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			try {
				func(...args);
			} catch (error) {
				useLogger("error", "[debounce] Callback error:", error);
			}
			timeoutId = undefined;
		}, delayMs);
	};
}

/**
 * Leading-edge debounce: fires immediately on the first call, then ignores
 * calls until `delayMs` of quiet. Additional calls during the wait window
 * schedule a single trailing invocation with the latest arguments.
 *
 * @typeParam T - The wrapped function type.
 * @param func - Function to debounce.
 * @param delayMs - Debounce delay in milliseconds.
 * @returns A debounced function with the same signature.
 *
 * @example
 * ```ts
 * const save = useDebounceImmediate(submitForm, 500);
 * save("a"); // fires immediately
 * save("b"); // queued
 * save("c"); // queued (replaces "b")
 * // after 500ms of quiet: fires with "c"
 * ```
 */
export function useDebounceImmediate<T extends (...args: unknown[]) => unknown>(
	func: T,
	delayMs: number,
): (...args: Parameters<T>) => void {
	let timeoutId: TimerId | undefined;
	let invoked = false;
	let lastArgs: Parameters<T> | null = null;

	return (...args: Parameters<T>) => {
		lastArgs = args;

		if (!invoked) {
			invoked = true;
			lastArgs = null;
			try {
				func(...args);
			} catch (error) {
				useLogger("error", "[debounceImmediate] Callback error:", error);
			}
		}

		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			if (lastArgs) {
				try {
					func(...lastArgs);
				} catch (error) {
					useLogger("error", "[debounceImmediate] Callback error:", error);
				}
			}
			invoked = false;
			lastArgs = null;
			timeoutId = undefined;
		}, delayMs);
	};
}

/**
 * Returns a throttled version of `func` that fires at most once per
 * `limitMs` milliseconds (leading edge).
 *
 * @typeParam T - The wrapped function type.
 * @param func - Function to throttle.
 * @param limitMs - Minimum interval between invocations in milliseconds.
 * @returns A throttled function with the same signature.
 *
 * @example
 * ```ts
 * const throttledScroll = useThrottle(onScroll, 100);
 * window.addEventListener("scroll", throttledScroll);
 * ```
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
	func: T,
	limitMs: number,
): (...args: Parameters<T>) => void {
	let inThrottle = false;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			try {
				func(...args);
			} catch (error) {
				useLogger("error", "[throttle] Callback error:", error);
			}
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limitMs);
		}
	};
}

/**
 * Throttle with trailing invocation: fires on the leading edge and also
 * fires once at the end of the throttle window with the latest arguments.
 *
 * @typeParam T - The wrapped function type.
 * @param func - Function to throttle.
 * @param limitMs - Minimum interval between invocations in milliseconds.
 * @returns A throttled function with the same signature.
 *
 * @example
 * ```ts
 * const throttledResize = useThrottleTrailing(onResize, 200);
 * window.addEventListener("resize", throttledResize);
 * ```
 */
export function useThrottleTrailing<T extends (...args: unknown[]) => unknown>(
	func: T,
	limitMs: number,
): (...args: Parameters<T>) => void {
	let inThrottle = false;
	let lastArgs: Parameters<T> | null = null;

	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			try {
				func(...args);
			} catch (error) {
				useLogger("error", "[throttleTrailing] Callback error:", error);
			}
			inThrottle = true;
			lastArgs = null;

			setTimeout(() => {
				inThrottle = false;
				if (lastArgs) {
					try {
						func(...lastArgs);
					} catch (error) {
						useLogger("error", "[throttleTrailing] Callback error:", error);
					}
				}
			}, limitMs);
		} else {
			lastArgs = args;
		}
	};
}

/**
 * Executes a callback `iterations` times with an optional delay between
 * each iteration.
 *
 * @param callback - Function called on each iteration with the current
 *   index (0-based).
 * @param iterations - Number of times to repeat.
 * @param delayMs - Delay between iterations in milliseconds (defaults to
 *   `0`).
 *
 * @example
 * ```ts
 * await useRepeat((i) => console.log(`Attempt ${i + 1}`), 3, 1000);
 * // Attempt 1 ... (1s) ... Attempt 2 ... (1s) ... Attempt 3
 * ```
 */
export async function useRepeat(
	callback: (iteration: number) => void | Promise<void>,
	iterations: number,
	delayMs = 0,
): Promise<void> {
	for (let i = 0; i < iterations; i++) {
		try {
			await callback(i);
		} catch (error) {
			useLogger("error", "[repeat] Callback error:", error);
		}

		if (i < iterations - 1 && delayMs > 0) {
			await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
		}
	}
}

/**
 * Races a promise against a timeout. Clears the timer when the promise
 * wins so the timeout rejection cannot become an unhandled rejection.
 *
 * @typeParam T - The promise's resolved type.
 * @param promise - The promise to race.
 * @param timeoutMs - Timeout in milliseconds.
 * @param errorMessage - Error message on timeout (defaults to
 *   `"Operation timed out"`).
 * @returns The resolved value of the promise.
 * @throws {Error} If the timeout fires first.
 *
 * @example
 * ```ts
 * try {
 *   const data = await useRace(fetch("/api"), 5000);
 * } catch (e) {
 *   console.error(e); // "Operation timed out"
 * }
 * ```
 */
export async function useRace<T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage = "Operation timed out",
): Promise<T> {
	let timeoutId: TimerId | undefined;
	let settled = false;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => {
			if (!settled) {
				reject(new Error(errorMessage));
			}
		}, timeoutMs);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		settled = true;
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}
	}
}
