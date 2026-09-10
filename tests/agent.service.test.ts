import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	KITT_BASE_URL,
	KITT_DEFAULT_MODEL,
	KITT_SYSTEM_PROMPT,
	useChat,
	useInitAgent,
	useRunAgent,
} from "@/core/services/agent.service";

function jsonResponse(payload: unknown, status = 200): Response {
	return new Response(JSON.stringify(payload), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("AiAgent", () => {
	beforeEach(() => {
		useInitAgent({ apiKey: "test-key" });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("injects the Kitt system prompt when no system message is present", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				jsonResponse({ choices: [{ message: { content: "ok" }, finish_reason: "stop" }] }),
			);
		vi.stubGlobal("fetch", fetchMock);

		await useChat([{ role: "user", content: "hi" }]);

		expect(fetchMock).toHaveBeenCalledOnce();
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe(`${KITT_BASE_URL}/chat/completions`);

		const body = JSON.parse(init.body as string);
		expect(body.model).toBe(KITT_DEFAULT_MODEL);
		expect(body.messages[0]).toEqual({ role: "system", content: KITT_SYSTEM_PROMPT });
		expect(body.messages[1]).toEqual({ role: "user", content: "hi" });
	});

	it("respects an explicit system message instead of injecting Kitt", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				jsonResponse({ choices: [{ message: { content: "ok" }, finish_reason: "stop" }] }),
			);
		vi.stubGlobal("fetch", fetchMock);

		await useChat([
			{ role: "system", content: "Be terse." },
			{ role: "user", content: "hi" },
		]);

		const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
		expect(body.messages).toHaveLength(2);
		expect(body.messages[0]).toEqual({ role: "system", content: "Be terse." });
	});

	it("sends the Bearer token and returns the assistant content", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				jsonResponse({
					choices: [{ message: { content: "Solar! Solar! Solar!" }, finish_reason: "stop" }],
				}),
			);
		vi.stubGlobal("fetch", fetchMock);

		const result = await useChat([{ role: "user", content: "energy?" }]);

		expect(result.ok).toBe(true);
		expect(result.data).toBe("Solar! Solar! Solar!");

		const init = fetchMock.mock.calls[0][1] as RequestInit;
		expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
	});

	it("returns a safe error result on a non-2xx response", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(jsonResponse({ error: { message: "Invalid API key" } }, 401));
		vi.stubGlobal("fetch", fetchMock);

		const result = await useChat([{ role: "user", content: "hi" }]);

		expect(result.ok).toBe(false);
		expect(result.error?.status).toBe(401);
		expect(result.error?.message).toContain("Invalid API key");
	});

	it("does not leak the API key into the request body", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				jsonResponse({ choices: [{ message: { content: "ok" }, finish_reason: "stop" }] }),
			);
		vi.stubGlobal("fetch", fetchMock);

		await useChat([{ role: "user", content: "hi" }]);

		const body = (fetchMock.mock.calls[0][1] as RequestInit).body as string;
		expect(body).not.toContain("test-key");
	});

	it("enters the tool loop and resolves to a final answer", async () => {
		const firstCall = {
			choices: [
				{
					message: {
						content: null,
						tool_calls: [
							{
								id: "call_1",
								type: "function",
								function: { name: "double", arguments: '{"value":21}' },
							},
						],
					},
					finish_reason: "tool_calls",
				},
			],
		};
		const secondCall = {
			choices: [{ message: { content: "The answer is 42." }, finish_reason: "stop" }],
		};

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(firstCall))
			.mockResolvedValueOnce(jsonResponse(secondCall));
		vi.stubGlobal("fetch", fetchMock);

		const result = await useRunAgent("Double 21", {
			tools: [
				{
					name: "double",
					description: "Doubles a number",
					parameters: {
						type: "object",
						properties: { value: { type: "number" } },
					},
					execute: (input) => (input as { value: number }).value * 2,
				},
			],
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.finalMessage).toBe("The answer is 42.");
			expect(result.data.steps).toHaveLength(1);
			expect(result.data.steps[0].toolResults).toEqual([42]);
		}
	});

	it("returns an error result when the tool budget runs out", async () => {
		const toolCall = {
			choices: [
				{
					message: {
						content: null,
						tool_calls: [
							{
								id: "call_1",
								type: "function",
								function: { name: "ping", arguments: "{}" },
							},
						],
					},
					finish_reason: "tool_calls",
				},
			],
		};
		const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse(toolCall)));
		vi.stubGlobal("fetch", fetchMock);

		const result = await useRunAgent("Keep pinging", {
			tools: [
				{
					name: "ping",
					description: "Pings",
					parameters: { type: "object", properties: {} },
					execute: () => "pong",
				},
			],
			maxSteps: 2,
		});

		expect(result.ok).toBe(false);
		expect(result.error?.message).toContain("Max steps");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("returns a safe error for an unknown tool", async () => {
		useInitAgent({ apiKey: "test-key", model: "qwen3.8-max" });
		const toolCall = {
			choices: [
				{
					message: {
						content: null,
						tool_calls: [
							{
								id: "call_1",
								type: "function",
								function: { name: "ghost", arguments: "{}" },
							},
						],
					},
					finish_reason: "tool_calls",
				},
			],
		};
		const final = {
			choices: [{ message: { content: "idk" }, finish_reason: "stop" }],
		};
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(toolCall))
			.mockResolvedValueOnce(jsonResponse(final));
		vi.stubGlobal("fetch", fetchMock);

		const result = await useRunAgent("Do something", { maxSteps: 2 });

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.steps[0].toolResults[0]).toMatchObject({ error: 'Unknown tool "ghost".' });
		}
	});

	it("returns status 0 on a network failure", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

		const result = await useChat([{ role: "user", content: "hi" }]);

		expect(result.ok).toBe(false);
		expect(result.error?.status).toBe(0);
		expect(result.error?.message).toContain("boom");
	});

	it("captures a throwing tool as a tool error instead of failing the run", async () => {
		const toolCall = {
			choices: [
				{
					message: {
						content: null,
						tool_calls: [
							{
								id: "call_1",
								type: "function",
								function: { name: "explode", arguments: "{}" },
							},
						],
					},
					finish_reason: "tool_calls",
				},
			],
		};
		const final = { choices: [{ message: { content: "done" }, finish_reason: "stop" }] };
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(toolCall))
			.mockResolvedValueOnce(jsonResponse(final));
		vi.stubGlobal("fetch", fetchMock);

		const result = await useRunAgent("Do it", {
			tools: [
				{
					name: "explode",
					description: "Always throws",
					parameters: { type: "object", properties: {} },
					execute: () => {
						throw new Error("tool crashed");
					},
				},
			],
			maxSteps: 3,
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.finalMessage).toBe("done");
			expect(result.data.steps[0].toolResults[0]).toMatchObject({
				error: 'Tool "explode" failed: tool crashed',
			});
		}
	});

	it("rejects a non-https baseUrl", () => {
		expect(() => useInitAgent({ apiKey: "k", baseUrl: "http://insecure.example" })).toThrow(/https/);
	});
});
