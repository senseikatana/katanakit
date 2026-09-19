import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	useHandleWhatsAppMessage,
	useInitWhatsApp,
	useSendWhatsAppMessage,
	useVerifyWhatsAppSignature,
	useVerifyWhatsAppWebhook,
	WHATSAPP_API_BASE,
	WHATSAPP_API_VERSION,
} from "@/adapters/whatsapp/whatsapp.service";
import type { AssistantResult } from "@/types/index";

const APP_SECRET = "app-secret";

describe("WhatsApp adapter", () => {
	beforeEach(() => {
		useInitWhatsApp({
			token: "wa-token",
			phoneNumberId: "123456",
			verifyToken: "secret",
			appSecret: APP_SECRET,
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("echoes the challenge when the verify token matches", () => {
		expect(useVerifyWhatsAppWebhook("subscribe", "secret", "challenge-1")).toBe("challenge-1");
		expect(useVerifyWhatsAppWebhook("subscribe", "wrong", "challenge-1")).toBeNull();
		expect(useVerifyWhatsAppWebhook("unsubscribe", "secret", "challenge-1")).toBeNull();
	});

	it("rejects an empty verify token", () => {
		expect(useVerifyWhatsAppWebhook("subscribe", "", "challenge-1")).toBeNull();
	});

	it("accepts a valid X-Hub-Signature-256", () => {
		const body = Buffer.from(JSON.stringify({ entry: [] }));
		const signature = `sha256=${createHmac("sha256", APP_SECRET).update(body).digest("hex")}`;
		expect(useVerifyWhatsAppSignature(body, signature)).toBe(true);
	});

	it("rejects a tampered signature or missing input", () => {
		const body = Buffer.from(JSON.stringify({ entry: [] }));
		const valid = `sha256=${createHmac("sha256", APP_SECRET).update(body).digest("hex")}`;
		expect(useVerifyWhatsAppSignature(body, "sha256=deadbeef")).toBe(false);
		expect(useVerifyWhatsAppSignature(body, undefined)).toBe(false);
		expect(useVerifyWhatsAppSignature(undefined, valid)).toBe(false);
	});

	it("sends a Cloud API text message", async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		await useSendWhatsAppMessage("5491100000000", "hola");

		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe(`${WHATSAPP_API_BASE}/${WHATSAPP_API_VERSION}/123456/messages`);
		expect((init.headers as Record<string, string>).Authorization).toBe("Bearer wa-token");
		expect(JSON.parse(init.body as string)).toMatchObject({
			messaging_product: "whatsapp",
			to: "5491100000000",
			type: "text",
			text: { body: "hola" },
		});
	});

	it("replies to inbound text messages from the webhook payload", async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		const reply = vi.fn<(sessionId: string, text: string) => Promise<AssistantResult>>(
			async (sessionId, text) => ({
				ok: true,
				data: { reply: `got:${text}`, sessionId },
				error: null,
			}),
		);

		await useHandleWhatsAppMessage(
			{
				entry: [
					{
						changes: [
							{
								value: {
									messages: [{ from: "5491100000000", type: "text", text: { body: "precio?" } }],
								},
							},
						],
					},
				],
			},
			reply,
		);

		expect(reply).toHaveBeenCalledWith("wa:5491100000000", "precio?");
		expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string).text.body).toBe(
			"got:precio?",
		);
	});
});
