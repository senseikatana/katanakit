import type { ThemeMode, ThemeOptions } from "../../types/index.js";
import {
	useAddClass,
	useGetRoot,
	useOn,
	useRemoveClass,
	useSetAttribute,
} from "../dom/dom.service.js";
import { useGetStorage, useRemoveStorage, useSetStorage } from "../storage/storage.service.js";

// ============================================================
// Constants and helpers
// ============================================================

const VALID_THEME_MODES: readonly ThemeMode[] = ["light", "dark", "system"];

function isThemeMode(value: unknown): value is ThemeMode {
	return typeof value === "string" && (VALID_THEME_MODES as readonly string[]).includes(value);
}

function isBrowser(): boolean {
	return typeof window !== "undefined" && typeof document !== "undefined";
}

// ============================================================
// Module-level state
// ============================================================

let mode: ThemeMode = "system";
let storageKey = "theme";
let attribute = "data-theme";
let target: HTMLElement | null = null;
let onChange: ((mode: ThemeMode, resolved: "light" | "dark") => void) | undefined;
let mediaQuery: MediaQueryList | null = null;
let cleanMediaQueryListener: (() => void) | null = null;

// ============================================================
// Internal helpers
// ============================================================

/**
 * Resolves the current theme to a concrete `"light"` or `"dark"` value.
 *
 * @returns The resolved color scheme.
 */
function getResolved(): "light" | "dark" {
	if (mode !== "system") return mode;
	return usePrefersColorScheme() ? "dark" : "light";
}

/**
 * Applies the current theme to the DOM target (attribute + CSS classes).
 */
function applyTheme(): void {
	if (!target) return;

	const resolved = getResolved();

	// Set the attribute, e.g. data-theme="dark".
	useSetAttribute(target, attribute, resolved);

	// Toggle CSS classes.
	useRemoveClass(target, ["light", "dark"]);
	useAddClass(target, resolved);

	onChange?.(mode, resolved);
}

/**
 * Registers a `matchMedia` listener that re-applies the theme when the
 * system color scheme changes (only relevant in `"system"` mode).
 */
function setupMediaQueryListener(): void {
	if (!isBrowser() || !window.matchMedia) return;

	// Clean up any existing listener before registering a new one.
	if (cleanMediaQueryListener) {
		cleanMediaQueryListener();
		cleanMediaQueryListener = null;
	}

	mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

	// Register the listener using DomService.
	cleanMediaQueryListener = useOn(mediaQuery, "change", () => {
		if (mode === "system") {
			applyTheme();
		}
	});
}

// ============================================================
// Public API
// ============================================================

/**
 * Initializes the theme system. Reads the stored preference (or falls back
 * to `defaultMode`), applies the theme, and registers a system color-scheme
 * listener for `"system"` mode.
 *
 * @param options - Configuration for the theme system.
 *
 * @example
 * ```ts
 * useInitTheme({
 *   defaultMode: "dark",
 *   storageKey: "app-theme",
 *   onChange: (mode, resolved) => console.log(mode, resolved),
 * });
 * ```
 */
export const useInitTheme = (options: ThemeOptions = {}): void => {
	if (!isBrowser()) return;

	storageKey = options.storageKey ?? "theme";
	attribute = options.attribute ?? "data-theme";
	target = options.target ?? useGetRoot();
	onChange = options.onChange;

	const stored = useGetStorage(storageKey);
	const defaultMode = isThemeMode(options.defaultMode) ? options.defaultMode : "system";
	mode = isThemeMode(stored) ? stored : defaultMode;

	applyTheme();
	setupMediaQueryListener();
};

/**
 * Sets the theme mode and persists it to storage.
 *
 * @param newMode - The desired theme mode (`"light"`, `"dark"`, or `"system"`).
 *
 * @example
 * ```ts
 * useSetThemeMode("dark");
 * ```
 */
export const useSetThemeMode = (newMode: ThemeMode): void => {
	if (!isBrowser()) return;

	mode = isThemeMode(newMode) ? newMode : "system";
	useSetStorage(storageKey, mode, "localStorage");
	applyTheme();
};

/**
 * Returns the current theme mode (may be `"system"`).
 *
 * @returns The active {@link ThemeMode}.
 *
 * @example
 * ```ts
 * const current = useGetThemeMode(); // "light" | "dark" | "system"
 * ```
 */
export const useGetThemeMode = (): ThemeMode => mode;

/**
 * Returns the resolved theme (`"light"` or `"dark"`), accounting for system
 * preference when mode is `"system"`.
 *
 * @returns The resolved color scheme.
 *
 * @example
 * ```ts
 * const scheme = useGetResolved(); // "light" or "dark"
 * ```
 */
export const useGetResolved = (): "light" | "dark" => {
	if (mode !== "system") return mode;
	return usePrefersColorScheme() ? "dark" : "light";
};

/**
 * Checks whether the user's OS is set to prefer a dark color scheme.
 *
 * @returns `true` if the system prefers dark mode.
 *
 * @example
 * ```ts
 * if (usePrefersColorScheme()) {
 *   // user prefers dark
 * }
 * ```
 */
export const usePrefersColorScheme = (): boolean => {
	if (!isBrowser() || !window.matchMedia) return false;
	return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Toggles between `"light"` and `"dark"` (ignores `"system"`).
 *
 * @example
 * ```ts
 * useToggleTheme(); // light -> dark, dark -> light
 * ```
 */
export const useToggleTheme = (): void => {
	const current = getResolved();
	useSetThemeMode(current === "light" ? "dark" : "light");
};

/**
 * Resets the theme to `"system"` and removes the stored preference.
 *
 * @example
 * ```ts
 * useResetTheme();
 * ```
 */
export const useResetTheme = (): void => {
	if (!isBrowser()) return;
	useRemoveStorage(storageKey);
	mode = "system";
	applyTheme();
};

/**
 * Cleans up the media-query listener. Call this when the theme system is
 * no longer needed (e.g. during teardown in tests).
 *
 * @example
 * ```ts
 * useDestroyTheme();
 * ```
 */
export const useDestroyTheme = (): void => {
	if (cleanMediaQueryListener) {
		cleanMediaQueryListener();
		cleanMediaQueryListener = null;
		mediaQuery = null;
	}
};
