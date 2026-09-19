import type { Application } from "express";

import { useExpressCreate, useExpressGetApp, useExpressStart } from "./server.js";

/**
 * Re-exported Express application instance.
 *
 * @example
 * ```ts
 * import { app } from "katanakit-js/adapters/express";
 * app.get("/custom", (req, res) => res.json({ ok: true }));
 * ```
 */
export const app: Application = useExpressCreate();

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
