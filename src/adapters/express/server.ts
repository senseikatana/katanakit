import type { IncomingMessage } from "node:http";
import cors from "cors";
import express, { type Application, type NextFunction, type Request, type Response } from "express";

import { useLogger } from "../../core/services/logger.service.js";
import router from "./router.js";

/** Module-level state for the Express server. */
let app: Application | null = null;
let started = false;
let finalized = false;

/** An HTTP request augmented with the raw JSON body captured during parsing. */
type RequestWithRawBody = IncomingMessage & { rawBody?: Buffer };

/**
 * Returns the raw request body buffer captured by the JSON parser, if any.
 * Needed to verify webhook signatures (e.g. `X-Hub-Signature-256`).
 *
 * @param request - The Express request.
 * @returns The raw body buffer, or `undefined` when not available.
 */
export function useGetRawBody(request: Request): Buffer | undefined {
	return (request as unknown as RequestWithRawBody).rawBody;
}

/**
 * Set up CORS, JSON body parser and URL-encoded middleware.
 * The JSON parser also captures the raw body for signature verification.
 *
 * @param expressApp - Express application instance
 *
 * @example
 * ```ts
 * const expressApp = express();
 * useExpressSetupMiddlewares(expressApp);
 * ```
 */
function useExpressSetupMiddlewares(expressApp: Application): void {
	const origins = (process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"])
		.map((origin) => origin.trim())
		.filter(Boolean);

	expressApp.use(
		cors({
			origin: origins,
			methods: ["GET", "POST", "PUT", "DELETE"],
		}),
	);
	expressApp.disable("x-powered-by");
	expressApp.use(
		express.json({
			limit: "100kb",
			verify: (req, _res, buf) => {
				(req as RequestWithRawBody).rawBody = buf;
			},
		}),
	);
	expressApp.use(express.urlencoded({ extended: true, limit: "100kb" }));
}

/**
 * Set up health check and application routes.
 *
 * @param expressApp - Express application instance
 *
 * @example
 * ```ts
 * useExpressSetupRoutes(expressApp);
 * // GET /health returns { status: "ok", timestamp: "..." }
 * ```
 */
function useExpressSetupRoutes(expressApp: Application): void {
	expressApp.get("/health", (_request: Request, response: Response) => {
		return response.json({
			status: "ok",
			timestamp: new Date().toISOString(),
		});
	});

	expressApp.use("/", router);
}

/**
 * Set up global error handling and 404 fallback. Register this AFTER all
 * channel routers are mounted so it does not shadow them.
 *
 * @param expressApp - Express application instance
 *
 * @example
 * ```ts
 * useExpressSetupErrorHandling(expressApp);
 * // Unhandled errors return 500, unknown routes return 404
 * ```
 */
function useExpressSetupErrorHandling(expressApp: Application): void {
	expressApp.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
		useLogger("error", "Unhandled error:", err);
		res.status(500).json({ error: "Internal Server Error" });
	});

	expressApp.use((_req: Request, res: Response) => {
		res.status(404).json({ error: "Not Found" });
	});
}

/**
 * Create and configure the Express application. Mount channel routers on the
 * returned app BEFORE calling {@link useExpressFinalize} / {@link useExpressStart},
 * otherwise the 404 catch-all will shadow them.
 *
 * @returns Configured Express Application instance
 *
 * @example
 * ```ts
 * const expressApp = useExpressCreate();
 * expressApp.use("/assistant", useCreateAssistantRouter());
 * useExpressStart();
 * ```
 */
export const useExpressCreate = (): Application => {
	if (app) return app;

	app = express();
	useExpressSetupMiddlewares(app);
	useExpressSetupRoutes(app);

	return app;
};

/**
 * Registers the error handler and 404 catch-all. Idempotent. Call this after
 * mounting every channel router so it runs last. {@link useExpressStart}
 * invokes it automatically.
 *
 * @example
 * ```ts
 * useExpressGetApp().use("/assistant", useCreateAssistantRouter());
 * useExpressFinalize();
 * ```
 */
export const useExpressFinalize = (): void => {
	if (finalized) return;
	finalized = true;
	useExpressSetupErrorHandling(useExpressCreate());
};

/**
 * Start the Express HTTP server. Idempotent — subsequent calls are no-ops.
 * Finalizes error handling before listening.
 *
 * @param port - Port to listen on (default: 3000)
 * @param host - Host to bind to (default: "localhost")
 *
 * @example
 * ```ts
 * useExpressStart(3000, "localhost");
 * // Server running on http://localhost:3000
 * ```
 */
export const useExpressStart = (port = 3000, host = "localhost"): void => {
	if (started) return;
	started = true;

	useExpressFinalize();
	const expressApp = useExpressCreate();

	expressApp.listen(port, host, () => {
		useLogger("info", `Server running on http://${host}:${port}`);
	});
};

/**
 * Get the Express application instance. Creates it if it doesn't exist.
 *
 * @returns Express Application instance
 *
 * @example
 * ```ts
 * const expressApp = useExpressGetApp();
 * expressApp.get("/custom", (req, res) => res.json({ ok: true }));
 * ```
 */
export const useExpressGetApp = (): Application => useExpressCreate();
