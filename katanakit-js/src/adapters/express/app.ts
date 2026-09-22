import type { Application } from "express";

import { useExpressCreate, useExpressGetApp, useExpressStart } from "./server.js";

/** Lazily-resolved Express app instance (created on first access). */
let appInstance: Application | null = null;

function getApp(): Application {
	return (appInstance ??= useExpressCreate());
}

/**
 * Re-exported Express application instance (lazy — built on first access so
 * importing this module has no side effects).
 *
 * @example
 * ```ts
 * import { app } from "katanakit-js/adapters/express";
 * app.get("/custom", (req, res) => res.json({ ok: true }));
 * ```
 */
export const app: Application = new Proxy({} as Application, {
	get(_target, prop: string | symbol) {
		const real = getApp();
		const value = Reflect.get(real, prop, real);
		return typeof value === "function" ? value.bind(real) : value;
	},
});

/**
 * Get the Express application instance.
 *
 * @example
 * ```ts
 * import { useGetApp } from "katanakit-js/adapters/express";
 * const expressApp = useGetApp();
 * ```
 */
export const useGetApp = useExpressGetApp;

/**
 * Start the Express HTTP server.
 *
 * @example
 * ```ts
 * import { useStart } from "katanakit-js/adapters/express";
 * useStart(3000, "localhost");
 * ```
 */
export const useStart = useExpressStart;
