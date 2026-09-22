import { useLogger } from "../../core/services/logger.service.js";
import type {
	LazyLoaderEntry,
	ObserverCallback,
	ObserverConfig,
	ObserverEntry,
	ObserverTarget,
} from "../../types/index.js";

// ============================================================
// Module-level state
// ============================================================

/** Registry of active IntersectionObserver instances keyed by string. */
const registry: Map<string, ObserverEntry> = new Map();

/** Registry of active lazy-loader entries keyed by string. */
const lazyRegistry: Map<string, LazyLoaderEntry> = new Map();

// ============================================================
// Internal helpers
// ============================================================

/**
 * Resolves an `ObserverTarget` to an HTMLElement.
 *
 * @param element - A CSS selector string or an HTMLElement.
 * @returns The resolved element, or `null` if not found.
 */
function resolveTarget(element: ObserverTarget): HTMLElement | null {
	return typeof element === "string" ? document.querySelector<HTMLElement>(element) : element;
}

// ============================================================
// Observer functions
// ============================================================

/**
 * Checks whether `IntersectionObserver` is available in the current environment.
 *
 * @returns `true` if `IntersectionObserver` is supported.
 *
 * @example
 * ```ts
 * if (useIsSupported()) {
 *   // safe to use observer APIs
 * }
 * ```
 */
export function useIsSupported(): boolean {
	return typeof window !== "undefined" && "IntersectionObserver" in window;
}

/**
 * Creates an IntersectionObserver under the given key.
 * If an observer with the same key already exists, it is disconnected first.
 *
 * @param key - A unique identifier for this observer.
 * @param callback - Invoked when an observed element enters the viewport.
 * @param options - IntersectionObserver options (default: `{ threshold: 0.1 }`).
 * @param autoUnobserve - Whether to automatically unobserve after first intersection (default: `true`).
 *
 * @example
 * ```ts
 * useObserverCreate("hero", (entry) => {
 *   console.log("Hero is visible!", entry.target);
 * }, { threshold: 0.5 });
 * ```
 */
export function useObserverCreate(
	key: string,
	callback: ObserverCallback,
	options: IntersectionObserverInit = { threshold: 0.1 },
	autoUnobserve = true,
): void {
	if (!useIsSupported()) {
		useLogger("[ObserverService] IntersectionObserver not supported.", undefined, "warn");
		return;
	}

	if (registry.has(key)) {
		useObserverDisconnect(key);
	}

	const config: ObserverConfig = { callback, options, autoUnobserve };

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				config.callback(entry);
				if (config.autoUnobserve) {
					useObserverUnobserve(key, entry.target as HTMLElement);
				}
			}
		}
	}, config.options);

	registry.set(key, { config, observer, targets: new Set() });
}

/**
 * Starts observing a single element under an existing observer key.
 *
 * @param key - The observer key created via {@link useObserverCreate}.
 * @param element - A CSS selector string or an HTMLElement to observe.
 *
 * @example
 * ```ts
 * useObserverObserve("hero", "#hero-image");
 * ```
 */
export function useObserverObserve(key: string, element: ObserverTarget): void {
	const entry = registry.get(key);
	if (!entry?.observer) return;

	const target = resolveTarget(element);
	if (!target) {
		useLogger(`[ObserverService] Target not found for key "${key}":`, element, "warn");
		return;
	}

	entry.targets.add(target);
	entry.observer.observe(target);
}

/**
 * Observes all elements matching a CSS selector under an existing observer key.
 *
 * @param key - The observer key created via {@link useObserverCreate}.
 * @param selector - A CSS selector string matching all elements to observe.
 *
 * @example
 * ```ts
 * useObserverObserveAll("images", "img.lazy");
 * ```
 */
export function useObserverObserveAll(key: string, selector: string): void {
	if (!useIsSupported()) return;
	for (const el of document.querySelectorAll<HTMLElement>(selector)) {
		useObserverObserve(key, el);
	}
}

/**
 * Stops observing a specific element under an observer key.
 *
 * @param key - The observer key.
 * @param element - The HTMLElement to stop observing.
 */
export function useObserverUnobserve(key: string, element: HTMLElement): void {
	const entry = registry.get(key);
	if (!entry?.observer) return;

	entry.observer.unobserve(element);
	entry.targets.delete(element);
}

/**
 * Disconnects and removes an observer by key, cleaning up all observed targets.
 *
 * @param key - The observer key to disconnect.
 *
 * @example
 * ```ts
 * useObserverDisconnect("hero");
 * ```
 */
export function useObserverDisconnect(key: string): void {
	const entry = registry.get(key);
	if (!entry) return;

	entry.observer?.disconnect();
	entry.targets.clear();
	registry.delete(key);
}

/**
 * Disconnects and removes all registered observers.
 *
 * @example
 * ```ts
 * useObserverDisconnectAll(); // clean up everything
 * ```
 */
export function useObserverDisconnectAll(): void {
	for (const key of registry.keys()) {
		useObserverDisconnect(key);
	}
}

/**
 * Checks whether an observer with the given key exists.
 *
 * @param key - The observer key to check.
 * @returns `true` if an observer is registered under the key.
 */
export function useObserverHas(key: string): boolean {
	return registry.has(key);
}

/**
 * Returns a list of all registered observer keys.
 *
 * @returns An array of observer key strings.
 */
export function useObserverKeys(): string[] {
	return Array.from(registry.keys());
}

// ============================================================
// Lazy-loader functions
// ============================================================

/**
 * Initializes lazy loading for images using IntersectionObserver.
 * Elements matching the selector must have a `data-src` attribute with the real image URL.
 *
 * @param key - A unique identifier for this lazy-loader instance (default: `"default"`).
 * @param selector - CSS selector for lazy-loadable images (default: `"img[data-src]"`).
 * @param rootMargin - IntersectionObserver root margin (default: `"200px"`).
 *
 * @example
 * ```ts
 * useLazyLoaderInit("gallery", "img[data-src]", "300px");
 * ```
 */
export function useLazyLoaderInit(
	key = "default",
	selector = "img[data-src]",
	rootMargin = "200px",
): void {
	if (!useIsSupported()) return;

	if (lazyRegistry.has(key)) {
		useLazyLoaderStop(key);
	}

	const observerKey = `lazy_loader_${key}`;

	useObserverCreate(
		observerKey,
		(entry) => {
			const img = entry.target as HTMLImageElement;
			const dataSrc = img.dataset.src;
			if (dataSrc) {
				img.src = dataSrc;
				img.removeAttribute("data-src");
			}
		},
		{ rootMargin },
		true,
	);

	useObserverObserveAll(observerKey, selector);
	lazyRegistry.set(key, { selector, observerKey });
}

/**
 * Stops a lazy-loader instance and disconnects its underlying observer.
 *
 * @param key - The lazy-loader key to stop.
 */
export function useLazyLoaderStop(key: string): void {
	const entry = lazyRegistry.get(key);
	if (!entry) return;

	useObserverDisconnect(entry.observerKey);
	lazyRegistry.delete(key);
}

/**
 * Stops all active lazy-loader instances.
 */
export function useLazyLoaderStopAll(): void {
	for (const key of lazyRegistry.keys()) {
		useLazyLoaderStop(key);
	}
}

/**
 * Checks whether a lazy-loader with the given key is active.
 *
 * @param key - The lazy-loader key to check.
 * @returns `true` if the lazy-loader is registered.
 */
export function useLazyLoaderHas(key: string): boolean {
	return lazyRegistry.has(key);
}
