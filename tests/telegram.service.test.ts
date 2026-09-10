import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	TELEGRAM_API_BASE,
	useHandleTelegramUpdate,
	useInitTelegram,
	useTelegramSendMessage,
} from "@/adapters/telegram/telegram.service";
import type { AssistantResult } from "@/types/index";

describe("Telegram adapter", () => {
	beforeEach(() => {
		useInitTelegram({ token: "bot-token" });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("sends a message to the Bot API", async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		await useTelegramSendMessage(42, "hello");

		expect(fetchMock).toHaveBeenCalledOnce();
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe(`${TELEGRAM_API_BASE}/botbot-token/sendMessage`);
		expect(JSON.parse(init.body as string)).toEqual({ chat_id: 42, text: "hello" });
	});

	it("replies to an inbound text update", async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		const reply = vi.fn<(sessionId: string, text: string) => Promise<AssistantResult>>(
			async (sessionId, text) => ({
				ok: true,
				data: { reply: `echo:${text}`, sessionId },
				error: null,
			}),
		);

		await useHandleTelegramUpdate({ message: { chat: { id: 99 }, text: "help me" } }, reply);

		expect(reply).toHaveBeenCalledWith("telegram:99", "help me");
		expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)).toEqual({
			chat_id: 99,
			text: "echo:help me",
		});
	});

	it("ignores updates without text", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const reply = vi.fn();

		await useHandleTelegramUpdate({ message: { chat: { id: 1 } } }, reply);

		expect(reply).not.toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
