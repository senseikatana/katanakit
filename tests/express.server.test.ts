import http from "node:http";
import rateLimit from "express-rate-limit";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { useCreateAssistantRouter } from "@/adapters/assistant/assistant.service";
import { useExpressCreate, useExpressFinalize } from "@/adapters/express/server";
import { useCreateMemoryStore, useInitAssistant } from "@/core/services/assistant.service";

interface HttpResult {
	status: number;
	body: string;
}

function request(
	port: number,
	method: "GET" | "POST",
	path: string,
	body?: unknown,
): Promise<HttpResult> {
	return new Promise((resolvePromise, rejectPromise) => {
		const data = body === undefined ? undefined : JSON.stringify(body);
		const req = http.request(
			{
				host: "127.0.0.1",
				port,
				path,
				method,
				headers: data
					? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
					: {},
			},
			(res) => {
				let raw = "";
				res.on("data", (chunk) => {
					raw += chunk;
				});
				res.on("end", () => resolvePromise({ status: res.statusCode ?? 0, body: raw }));
			},
		);
		req.on("error", rejectPromise);
		if (data) req.write(data);
		req.end();
	});
}

describe("Express server channel routing", () => {
	let server: http.Server | null = null;

	beforeEach(() => {
		useInitAssistant({ apiKey: "test-key", store: useCreateMemoryStore() });
	});

	afterAll(() => {
		server?.close();
		vi.unstubAllGlobals();
	});

	it("mounts channel routers, 404s unknown routes, and rate-limits /chat", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockImplementation(() =>
					Promise.resolve(
						new Response(
							JSON.stringify({ choices: [{ message: { content: "hi back" }, finish_reason: "stop" }] }),
							{ status: 200, headers: { "Content-Type": "application/json" } },
						),
					),
				),
		);

		const app = useExpressCreate();
		app.use(
			"/assistant",
			useCreateAssistantRouter({
				rateLimit: rateLimit({
					windowMs: 60_000,
					max: 1,
					standardHeaders: "draft-7",
					legacyHeaders: false,
					message: { ok: false, data: null, error: { message: "Too many requests", status: 429 } },
				}),
			}),
		);
		useExpressFinalize();

		await new Promise<void>((resolvePromise) => {
			server = app.listen(0, "127.0.0.1", () => resolvePromise());
		});
		const port = (server?.address() as { port: number }).port;

		// 1. Known route works
		const chat = await request(port, "POST", "/assistant/chat", { message: "hello" });
		expect(chat.status).toBe(200);
		expect(JSON.parse(chat.body)).toMatchObject({ ok: true, data: { reply: "hi back" } });

		// 2. Unknown route → 404
		const missing = await request(port, "GET", "/definitely/not/here");
		expect(missing.status).toBe(404);

		// 3. Rate limit (max: 1) — second POST is rejected
		const overflow = await request(port, "POST", "/assistant/chat", { message: "overflow" });
		expect(overflow.status).toBe(429);
	});
});
