import type { WorkerFunc, WorkerPoolEntry } from "../../types/index.js";

// ============================================================
// Module-level state
// ============================================================

/** Registry of reusable Worker pools keyed by string. */
const pools = new Map<string, WorkerPoolEntry>();

// ============================================================
// Internal helpers
// ============================================================

/**
 * Checks whether the Web Worker API is available.
 *
 * @returns `true` if `Worker` is available in the current environment.
 */
function isWorkerSupported(): boolean {
	return typeof window !== "undefined" && "Worker" in window;
}

// ============================================================
// Public API
// ============================================================

/**
 * Runs a pure function in a one-shot Worker and destroys it afterwards.
 * Falls back to running on the main thread when Workers are unavailable (SSR).
 * Async worker functions are awaited (Promise resolved before postMessage).
 *
 * @typeParam TInput - Input data type.
 * @typeParam TOutput - Output data type.
 * @param workerFunc - The pure function to execute off the main thread.
 * @param data - The input data passed to the function.
 * @returns A Promise resolving to the function's output.
 *
 * @example
 * ```ts
 * const doubled = await useRun((n: number) => n * 2, 21);
 * console.log(doubled); // 42
 * ```
 */
export async function useRun<TInput, TOutput>(
	workerFunc: WorkerFunc<TInput, TOutput>,
	data: TInput,
): Promise<TOutput> {
	if (!isWorkerSupported()) {
		return Promise.resolve(workerFunc(data));
	}

	return new Promise((resolve, reject) => {
		let worker: Worker | undefined;
		let workerUrl: string | undefined;

		const cleanup = () => {
			if (worker) {
				worker.terminate();
				worker = undefined;
			}
			if (workerUrl) {
				URL.revokeObjectURL(workerUrl);
				workerUrl = undefined;
			}
		};

		try {
			const funcString = workerFunc.toString();
			const blob = new Blob(
				[
					`self.onmessage = (e) => {
						Promise.resolve((${funcString})(e.data))
							.then((payload) => self.postMessage({ ok: true, payload }))
							.catch((err) => self.postMessage({ ok: false, error: String(err && err.message ? err.message : err) }));
					}`,
				],
				{ type: "application/javascript" },
			);
			workerUrl = URL.createObjectURL(blob);
			worker = new Worker(workerUrl);

			worker.onmessage = (event) => {
				cleanup();
				if (event.data?.ok === false) {
					reject(new Error(event.data.error ?? "Worker function failed"));
					return;
				}
				resolve(event.data?.payload as TOutput);
			};
			worker.onerror = (error) => {
				cleanup();
				reject(new Error(`Worker error: ${error.message}`));
			};
			worker.onmessageerror = () => {
				cleanup();
				reject(new Error("Worker returned a non-cloneable value."));
			};

			worker.postMessage(data);
		} catch (error) {
			cleanup();
			reject(error);
		}
	});
}

/**
 * Creates a reusable Worker pool under a unique key. If a pool with the same
 * key already exists, it is terminated first.
 *
 * @typeParam TInput - Input data type.
 * @typeParam TOutput - Output data type.
 * @param key - A unique identifier for this pool.
 * @param workerFunc - The pure function the pool will execute.
 *
 * @example
 * ```ts
 * useCreatePool("heavy", (n: number) => n ** 2);
 * const result = await useRunPool("heavy", 9); // 81
 * useTerminate("heavy");
 * ```
 */
export function useCreatePool<TInput, TOutput>(
	key: string,
	workerFunc: WorkerFunc<TInput, TOutput>,
): void {
	if (!isWorkerSupported()) {
		pools.set(key, {
			worker: null as unknown as Worker,
			workerUrl: "",
			func: workerFunc as WorkerFunc,
			pending: new Map(),
		});
		return;
	}

	if (pools.has(key)) {
		useTerminate(key);
	}

	const funcString = workerFunc.toString();
	const blob = new Blob(
		[
			`self.onmessage = (e) => {
				const taskId = e.data.__taskId;
				Promise.resolve((${funcString})(e.data.payload))
					.then((payload) => self.postMessage({ __taskId: taskId, ok: true, payload }))
					.catch((err) => self.postMessage({
						__taskId: taskId,
						ok: false,
						error: String(err && err.message ? err.message : err),
					}));
			}`,
		],
		{ type: "application/javascript" },
	);
	const workerUrl = URL.createObjectURL(blob);
	const worker = new Worker(workerUrl);

	pools.set(key, {
		worker,
		workerUrl,
		func: workerFunc as WorkerFunc,
		pending: new Map(),
	});
}

/**
 * Runs a task on an existing Worker pool. Tasks are correlated by `__taskId`
 * so concurrent tasks do not stomp each other's handlers.
 *
 * @typeParam TInput - Input data type.
 * @typeParam TOutput - Output data type.
 * @param key - The pool key created via {@link useCreatePool}.
 * @param data - The input data to pass to the pool's function.
 * @returns A Promise resolving to the function's output.
 * @throws {Error} If the pool does not exist.
 *
 * @example
 * ```ts
 * useCreatePool("math", (n: number) => n * 10);
 * const result = await useRunPool("math", 5); // 50
 * ```
 */
export function useRunPool<TInput, TOutput>(key: string, data: TInput): Promise<TOutput> {
	const entry = pools.get(key) as WorkerPoolEntry<TInput, TOutput> | undefined;

	if (!entry) {
		return Promise.reject(new Error(`Worker pool "${key}" not found`));
	}

	if (!isWorkerSupported()) {
		return Promise.resolve(entry.func(data));
	}

	const taskId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

	return new Promise((resolve, reject) => {
		const onMessage = (event: MessageEvent) => {
			if (event.data?.__taskId !== taskId) return;
			cleanup();
			if (event.data.ok === false) {
				reject(new Error(event.data.error ?? "Worker function failed"));
				return;
			}
			resolve(event.data.payload as TOutput);
		};

		const onError = (error: ErrorEvent) => {
			cleanup();
			reject(new Error(`Worker error: ${error.message}`));
		};

		const cleanup = () => {
			entry.worker.removeEventListener("message", onMessage);
			entry.worker.removeEventListener("error", onError);
			entry.pending.delete(taskId);
		};

		entry.pending.set(taskId, {
			reject: (reason) => reject(reason),
			cleanup,
		});

		entry.worker.addEventListener("message", onMessage);
		entry.worker.addEventListener("error", onError);
		entry.worker.postMessage({ __taskId: taskId, payload: data });
	});
}

/**
 * Terminates a specific Worker pool and rejects any in-flight tasks.
 *
 * @param key - The pool key to terminate.
 *
 * @example
 * ```ts
 * useTerminate("heavy");
 * ```
 */
export function useTerminate(key: string): void {
	const entry = pools.get(key);
	if (!entry) return;

	for (const pending of entry.pending.values()) {
		pending.cleanup();
		pending.reject(new Error(`Worker pool "${key}" was terminated`));
	}
	entry.pending.clear();

	if (isWorkerSupported() && entry.worker) {
		entry.worker.terminate();
		if (entry.workerUrl) {
			URL.revokeObjectURL(entry.workerUrl);
		}
	}
	pools.delete(key);
}

/**
 * Terminates all active Worker pools and rejects any in-flight tasks.
 *
 * @example
 * ```ts
 * useTerminateAll();
 * ```
 */
export function useTerminateAll(): void {
	for (const key of pools.keys()) {
		useTerminate(key);
	}
}

/**
 * Checks whether a Worker pool with the given key exists.
 *
 * @param key - The pool key to check.
 * @returns `true` if the pool is registered.
 */
export function useHasWorker(key: string): boolean {
	return pools.has(key);
}

/**
 * Returns a list of all active Worker pool keys.
 *
 * @returns An array of pool key strings.
 */
export function useWorkerKeys(): string[] {
	return Array.from(pools.keys());
}
