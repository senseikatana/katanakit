import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	useCreateMemoryStore,
	useCreateSession,
	useGetHistory,
	useInitAssistant,
	useReply,
	useResetSession,
	useSessionExists,
} from "@/core/services/assistant.service";

function jsonResponse(payload: unknown, status = 200): Response {
	return new Response(JSON.stringify(payload), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("Assistant", () => {
	beforeEach(() => {
		useInitAssistant({ apiKey: "test-key", store: useCreateMemoryStore() });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("creates a session and returns a reply", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					jsonResponse({
						choices: [{ message: { content: "Hello from Kitt" }, finish_reason: "stop" }],
					}),
				),
		);

		const result = await useReply(undefined, "Hi");

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.reply).toBe("Hello from Kitt");
			expect(result.data.sessionId).toBeTruthy();
			const history = await useGetHistory(result.data.sessionId);
			expect(history).toHaveLength(2);
			expect(history[0]).toEqual({ role: "user", content: "Hi" });
			expect(history[1]).toEqual({ role: "assistant", content: "Hello from Kitt" });
		}
	});

	it("reuses an existing session id", async () => {
		const sessionId = await useCreateSession("rest");
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					jsonResponse({ choices: [{ message: { content: "ok" }, finish_reason: "stop" }] }),
				),
		);

		const result = await useReply(sessionId, "again");

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.sessionId).toBe(sessionId);
	});

	it("does not persist messages when the provider fails", async () => {
		const sessionId = await useCreateSession();
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(jsonResponse({ error: { message: "nope" } }, 500)),
		);

		const result = await useReply(sessionId, "fail please");

		expect(result.ok).toBe(false);
		expect(await useGetHistory(sessionId)).toEqual([]);
	});

	it("resets a session", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					jsonResponse({ choices: [{ message: { content: "ok" }, finish_reason: "stop" }] }),
				),
		);
		const result = await useReply(undefined, "hello");
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		await useResetSession(result.data.sessionId);
		expect(await useGetHistory(result.data.sessionId)).toEqual([]);
	});

	it("reports session existence", async () => {
		const sessionId = await useCreateSession();
		expect(await useSessionExists(sessionId)).toBe(true);
		expect(await useSessionExists("does-not-exist")).toBe(false);
	});

	it("rejects a reply for an unknown session", async () => {
		const result = await useReply("ghost-session", "hello");
		expect(result.ok).toBe(false);
		expect(result.error?.status).toBe(404);
	});
});
