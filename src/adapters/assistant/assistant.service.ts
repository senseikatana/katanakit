import { type Request, type RequestHandler, type Response, Router } from "express";
import rateLimit from "express-rate-limit";

import {
	useGetHistory,
	useReply,
	useResetSession,
	useSessionExists,
} from "../../core/services/assistant.service.js";
import { useExpressGetApp, useExpressStart } from "../express/server.js";

/** Options for the assistant HTTP router. */
export interface AssistantRouterOptions {
	/** Optional auth guard (e.g. Bearer token). Applied before every route. */
	guard?: RequestHandler;
	/** Optional rate limiter for POST /chat. Defaults to 20 req/min per IP. */
	rateLimit?: RequestHandler;
}

/** Default rate limiter: 20 requests per minute per IP. */
const defaultChatRateLimit = rateLimit({
	windowMs: 60_000,
	max: 20,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: { ok: false, data: null, error: { message: "Too many requests", status: 429 } },
});

/** Builds a fresh Express router exposing the assistant over HTTP. */
export function useCreateAssistantRouter(options: AssistantRouterOptions = {}): Router {
	const router = Router();

	if (options.guard) {
		router.use(options.guard);
	}

	router.post(
		"/chat",
		options.rateLimit ?? defaultChatRateLimit,
		async (request: Request, response: Response) => {
			const { sessionId, message } = (request.body ?? {}) as {
				sessionId?: string;
				message?: string;
			};

			if (typeof message !== "string" || message.trim() === "") {
				response.status(400).json({
					ok: false,
					data: null,
					error: { message: "Field `message` is required", status: 400 },
				});
				return;
			}

			const result = await useReply(sessionId, message);
			response.status(result.ok ? 200 : 502).json(result);
		},
	);

	router.get("/sessions/:id", async (request: Request, response: Response) => {
		const id = String(request.params.id);
		if (!(await useSessionExists(id))) {
			response.status(404).json({ error: "Session not found" });
			return;
		}
		const messages = await useGetHistory(id);
		response.json({ sessionId: id, messages });
	});

	router.delete("/sessions/:id", async (request: Request, response: Response) => {
		const id = String(request.params.id);
		if (!(await useSessionExists(id))) {
			response.status(404).json({ error: "Session not found" });
			return;
		}
		await useResetSession(id);
		response.status(204).end();
	});

	return router;
}

/** Module-level mount guard for the standalone assistant. */
let mounted = false;

/**
 * Mounts the assistant routes on the shared Express app and starts the server.
 * Idempotent — subsequent calls are no-ops.
 *
 * @param port - Port to listen on (default: 3000)
 * @param host - Host to bind to (default: "localhost")
 * @param mountPath - Base path for the assistant routes (default: "/assistant")
 * @param options - Router options (e.g. an auth `guard`)
 *
 * @example
 * ```ts
 * useStartAssistant(3000, "localhost", "/assistant", { guard: requireAuth });
 * // POST /assistant/chat
 * ```
 */
export function useStartAssistant(
	port = 3000,
	host = "localhost",
	mountPath = "/assistant",
	options: AssistantRouterOptions = {},
): void {
	if (mounted) return;
	mounted = true;

	useExpressGetApp().use(mountPath, useCreateAssistantRouter(options));
	useExpressStart(port, host);
}
