import type { StorageStrategy, StorageTarget } from "../../types/index.js";

// ============================================================
// Strategy factories (plain objects implementing StorageStrategy)
// ============================================================

/**
 * Creates a `StorageStrategy` backed by a Web Storage backend (`localStorage`
 * or `sessionStorage`) with safe JSON serialization and error handling.
 *
 * @param storage - A native `Storage` instance (e.g. `window.localStorage`).
 * @returns A {@link StorageStrategy} object.
 */
function createWebStorageStrategy(storage: Storage): StorageStrategy {
	return {
		useGetItem<T = unknown>(key: string): T | null {
			try {
				const raw = storage.getItem(key);
				return raw ? (JSON.parse(raw) as T) : null;
			} catch {
				try {
					return storage.getItem(key) as unknown as T;
				} catch {
					return null;
				}
			}
		},

		useSetItem(key: string, value: unknown): void {
			try {
				const serialized = typeof value === "string" ? value : JSON.stringify(value);
				storage.setItem(key, serialized);
			} catch {
				// Quota exceeded, private mode, or unavailable storage — ignore.
			}
		},

		useRemoveItem(key: string): void {
			try {
				storage.removeItem(key);
			} catch {
				// Ignore unavailable storage.
			}
		},

		useClear(): void {
			try {
				storage.clear();
			} catch {
				// Ignore unavailable storage.
			}
		},
	};
}

// ============================================================
// In-memory Storage implementation
// ============================================================

/**
 * Creates a new in-memory `Storage` instance used as an SSR / private-mode
 * fallback. Each call owns its own Map — never share one across requests.
 *
 * @returns An object conforming to the Web Storage API.
 *
 * @example
 * ```ts
 * const mem = createMemoryStorage();
 * mem.setItem("key", JSON.stringify({ a: 1 }));
 * ```
 */
export function createMemoryStorage(): Storage {
	const store = new Map<string, string>();

	return {
		get length(): number {
			return store.size;
		},
		clear(): void {
			store.clear();
		},
		getItem(key: string): string | null {
			return store.get(key) ?? null;
		},
		key(index: number): string | null {
			return Array.from(store.keys())[index] ?? null;
		},
		removeItem(key: string): void {
			store.delete(key);
		},
		setItem(key: string, value: string): void {
			store.set(key, value);
		},
	};
}

// ============================================================
// Concrete strategy factories
// ============================================================

/**
 * Creates a strategy backed by `window.localStorage`.
 *
 * @param storage - Optional storage instance (defaults to `window.localStorage`).
 * @returns A {@link StorageStrategy}.
 *
 * @example
 * ```ts
 * const strategy = LocalStorageStrategy();
 * strategy.useSetItem("token", "abc123");
 * ```
 */
export function LocalStorageStrategy(storage?: Storage): StorageStrategy {
	const resolved = storage ?? getDefaultLocalStorage();
	return resolved ? createWebStorageStrategy(resolved) : MemoryStorageStrategy();
}

/**
 * Creates a strategy backed by `window.sessionStorage`.
 *
 * @param storage - Optional storage instance (defaults to `window.sessionStorage`).
 * @returns A {@link StorageStrategy}.
 *
 * @example
 * ```ts
 * const strategy = SessionStorageStrategy();
 * strategy.useSetItem("session", data);
 * ```
 */
export function SessionStorageStrategy(storage?: Storage): StorageStrategy {
	const resolved = storage ?? getDefaultSessionStorage();
	return resolved ? createWebStorageStrategy(resolved) : MemoryStorageStrategy();
}

/**
 * Creates a strategy backed by an in-memory store (SSR / private-mode fallback).
 *
 * @returns A {@link StorageStrategy} using an in-memory `Storage` backend.
 *
 * @example
 * ```ts
 * const strategy = MemoryStorageStrategy();
 * strategy.useSetItem("temp", "value");
 * ```
 */
export function MemoryStorageStrategy(): StorageStrategy {
	return createWebStorageStrategy(createMemoryStorage());
}

// ============================================================
// SSR-safe Web Storage accessors
// ============================================================

/**
 * Returns `window.localStorage` in browser, or `null` in SSR/Node.
 */
function getDefaultLocalStorage(): Storage | null {
	return typeof window !== "undefined" ? window.localStorage : null;
}

/**
 * Returns `window.sessionStorage` in browser, or `null` in SSR/Node.
 */
function getDefaultSessionStorage(): Storage | null {
	return typeof window !== "undefined" ? window.sessionStorage : null;
}

// ============================================================
// AsyncLocalStorage shim (browser-safe)
// ============================================================

/**
 * Minimal ALS-compatible shim for browser environments.
 * `getStore()` always returns `undefined`; `run()` just calls `fn()` directly.
 * This avoids importing `node:async_hooks` at the top level, which crashes browsers.
 */
interface AsyncLocalStorageLike<T> {
	getStore(): T | undefined;
	run<R>(store: T, fn: () => R): R;
}

function createBrowserAlsShim<T>(): AsyncLocalStorageLike<T> {
	return {
		getStore: () => undefined,
		run: (_store, fn) => fn(),
	};
}

/**
 * SSR-safe ALS instance. Starts as a browser shim; replaced with the real
 * `AsyncLocalStorage` once `getRealALS()` resolves in a Node environment.
 * This reference is mutated exactly once, so `getStrategies()` can read it
 * synchronously on every call.
 */
let ssrStorageALS: AsyncLocalStorageLike<StrategyMap> = createBrowserAlsShim();

/**
 * Lazily-loaded real AsyncLocalStorage for Node.js SSR.
 * On first call in Node, dynamically imports `node:async_hooks`, creates the
 * real ALS, and swaps `ssrStorageALS` so subsequent `getStrategies()` calls
 * see the scoped store.
 */
let realALSReady: Promise<void> | null = null;

async function ensureRealALS(): Promise<void> {
	if (realALSReady) return realALSReady;

	realALSReady = (async () => {
		try {
			const mod = await import("node:async_hooks");
			const AlsClass = mod.AsyncLocalStorage;
			if (typeof AlsClass === "function") {
				ssrStorageALS = new AlsClass() as AsyncLocalStorageLike<StrategyMap>;
			}
		} catch {
			// Fallback: not available (shouldn't happen in Node, but be safe).
		}
	})();

	return realALSReady;
}

// ============================================================
// Internal strategy resolution
// ============================================================

type StrategyMap = Record<StorageTarget, StorageStrategy>;

/** Lazily-initialized browser strategies (cached once). */
let browserStrategies: StrategyMap | null = null;

function createMemoryStrategies(): StrategyMap {
	return {
		localStorage: MemoryStorageStrategy(),
		sessionStorage: MemoryStorageStrategy(),
	};
}

function tryCreateBrowserStrategies(): StrategyMap {
	const local = tryCreateWebStorage("localStorage");
	const session = tryCreateWebStorage("sessionStorage");
	return {
		localStorage: local ?? MemoryStorageStrategy(),
		sessionStorage: session ?? MemoryStorageStrategy(),
	};
}

/**
 * Probes Web Storage availability (Safari private mode throws on setItem).
 *
 * @param kind - Which storage backend to probe.
 * @returns A {@link StorageStrategy} or `null` if the backend is unavailable.
 */
function tryCreateWebStorage(kind: "localStorage" | "sessionStorage"): StorageStrategy | null {
	if (typeof window === "undefined") return null;
	try {
		const storage = window[kind];
		const probeKey = "__kk_storage_probe__";
		storage.setItem(probeKey, "1");
		storage.removeItem(probeKey);
		return kind === "localStorage" ? LocalStorageStrategy(storage) : SessionStorageStrategy(storage);
	} catch {
		return null;
	}
}

/**
 * Resolves the active strategy map: browser strategies (cached), ALS-scoped
 * strategies (SSR request), or ephemeral memory strategies (SSR fallback).
 */
function getStrategies(): StrategyMap {
	const hasWindow = typeof window !== "undefined";

	if (hasWindow) {
		if (!browserStrategies) {
			browserStrategies = tryCreateBrowserStrategies();
		}
		return browserStrategies;
	}

	// SSR: prefer ALS-scoped strategies (isolated per request).
	const scoped = ssrStorageALS.getStore();
	if (scoped) return scoped;

	// No scope — ephemeral store (no cross-request leak, no cross-call persistence).
	return createMemoryStrategies();
}

// ============================================================
// Public API
// ============================================================

/**
 * Runs `fn` with request-isolated in-memory storage (SSR).
 * Use this around a request handler so `useSetStorage` / `useGetStorage`
 * share state within the request but not across requests.
 *
 * In browser environments, this simply calls `fn()` directly (no ALS needed).
 *
 * @typeParam T - Return type of `fn`.
 * @param fn - The function to run within the storage scope.
 * @returns The return value of `fn`.
 *
 * @example
 * ```ts
 * import { useRunStorageScope, useSetStorage, useGetStorage } from "katanakit-js";
 *
 * export default defineEventHandler((event) => {
 *   return useRunStorageScope(() => {
 *     useSetStorage("req-id", event.context.id);
 *     return useGetStorage("req-id");
 *   });
 * });
 * ```
 */
export async function useRunStorageScope<T>(fn: () => T | Promise<T>): Promise<T> {
	if (typeof window !== "undefined") {
		// Browser: no ALS needed, just run directly.
		return fn();
	}
	// Node SSR: load real ALS (once), then run with isolated strategies.
	await ensureRealALS();
	return ssrStorageALS.run(createMemoryStrategies(), fn);
}

/**
 * Retrieves a value from storage by key.
 *
 * @typeParam T - Expected value type.
 * @param key - The storage key.
 * @param target - Which storage backend to use (default: `"localStorage"`).
 * @returns The deserialized value, or `null` if not found.
 *
 * @example
 * ```ts
 * const token = useGetStorage<string>("auth_token");
 * const session = useGetStorage<SessionData>("session", "sessionStorage");
 * ```
 */
export const useGetStorage = <T = unknown>(
	key: string,
	target: StorageTarget = "localStorage",
): T | null => getStrategies()[target].useGetItem<T>(key);

/**
 * Stores a value under the given key (serialized as JSON).
 *
 * @param key - The storage key.
 * @param value - The value to store.
 * @param target - Which storage backend to use (default: `"localStorage"`).
 *
 * @example
 * ```ts
 * useSetStorage("auth_token", "abc123");
 * useSetStorage("user", { name: "Alice" }, "sessionStorage");
 * ```
 */
export const useSetStorage = (
	key: string,
	value: unknown,
	target: StorageTarget = "localStorage",
): void => getStrategies()[target].useSetItem(key, value);

/**
 * Removes a value from storage by key.
 *
 * @param key - The storage key to remove.
 * @param target - Which storage backend to use (default: `"localStorage"`).
 *
 * @example
 * ```ts
 * useRemoveStorage("auth_token");
 * ```
 */
export const useRemoveStorage = (key: string, target: StorageTarget = "localStorage"): void =>
	getStrategies()[target].useRemoveItem(key);

/**
 * Clears all values from the specified storage backend.
 *
 * @param target - Which storage backend to clear (default: `"localStorage"`).
 *
 * @example
 * ```ts
 * useClearStorage("sessionStorage");
 * ```
 */
export const useClearStorage = (target: StorageTarget = "localStorage"): void =>
	getStrategies()[target].useClear();
