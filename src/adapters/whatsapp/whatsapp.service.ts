import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { type Response as ExpressResponse, type Request, Router } from "express";
import rateLimit from "express-rate-limit";

import { useReply } from "../../core/services/assistant.service.js";
import { useLogger } from "../../core/services/logger.service.js";
import type { AssistantResult } from "../../types/index.js";
import { useExpressGetApp, useExpressStart, useGetRawBody } from "../express/server.js";

/** Default WhatsApp Cloud API (Graph) base URL. */
export const WHATSAPP_API_BASE = "https://graph.facebook.com";

/** Default Graph API version. */
export const WHATSAPP_API_VERSION = "v21.0";

/** Cap of inbound messages processed per webhook payload (cost-amplification guard). */
export const WHATSAPP_MAX_MESSAGES_PER_WEBHOOK = 5;

/** Configuration for the WhatsApp Cloud API integration. */
export interface WhatsAppConfig {
	token: string;
	phoneNumberId: string;
	verifyToken: string;
	/** Meta app secret used to verify webhook signatures (`X-Hub-Signature-256`). */
	appSecret: string;
	apiVersion?: string;
	apiBaseUrl?: string;
}

/** Callback producing an assistant reply for a channel session. */
export type WhatsAppReplyFn = (sessionId: string, text: string) => Promise<AssistantResult>;

/** Module-level integration configuration. */
let config: WhatsAppConfig | null = null;

/** Retrieves the configured integration or throws. */
function getConfig(): WhatsAppConfig {
	if (!config) {
		throw new Error("[WhatsApp] Not configured. Call useInitWhatsApp() first.");
	}
	return config;
}

/**
 * Registers the WhatsApp Cloud API configuration.
 *
 * @param cfg - Access token, phone number id and webhook verify token.
 *
 * @example
 * ```ts
 * useInitWhatsApp({
 *   token: process.env.WHATSAPP_TOKEN,
 *   phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
 *   verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
 *   appSecret: process.env.WHATSAPP_APP_SECRET,
 * });
 * ```
 */
export function useInitWhatsApp(cfg: WhatsAppConfig): void {
	config = { ...cfg };
}

/** Constant-time string comparison (hashes both sides to drop the length oracle). */
function timingSafeStringEqual(a: string, b: string): boolean {
	if (a.length === 0 || b.length === 0) return false;
	const digestA = createHash("sha256").update(a).digest();
	const digestB = createHash("sha256").update(b).digest();
	return timingSafeEqual(digestA, digestB);
}

/**
 * Verifies a Meta webhook delivery signature (`X-Hub-Signature-256`).
 *
 * @param rawBody - The raw request body buffer captured by the JSON parser.
 * @param signatureHeader - Value of the `X-Hub-Signature-256` header.
 * @returns `true` when the signature matches the app secret HMAC.
 *
 * @example
 * ```ts
 * const ok = useVerifyWhatsAppSignature(useGetRawBody(req), req.header("x-hub-signature-256"));
 * ```
 */
export function useVerifyWhatsAppSignature(
	rawBody: Buffer | undefined,
	signatureHeader: string | undefined,
): boolean {
	const { appSecret } = getConfig();
	if (!rawBody || !signatureHeader) return false;
	const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
	return timingSafeStringEqual(expected, signatureHeader);
}

/**
 * Verifies a Meta webhook challenge. Returns the challenge to echo on success,
 * or `null` when the mode or token is invalid.
 *
 * @param mode - `hub.mode` query param.
 * @param verifyToken - `hub.verify_token` query param.
 * @param challenge - `hub.challenge` query param.
 * @returns The challenge string when valid, otherwise `null`.
 */
export function useVerifyWhatsAppWebhook(
	mode: string,
	verifyToken: string,
	challenge: string,
): string | null {
	const { verifyToken: expected } = getConfig();
	if (mode === "subscribe" && timingSafeStringEqual(verifyToken, expected)) {
		return challenge;
	}
	return null;
}

/**
 * Sends a text message to a WhatsApp number via the Cloud API.
 *
 * @param to - Destination number (E.164).
 * @param text - Message body.
 * @returns The Graph API response.
 */
export async function useSendWhatsAppMessage(to: string, text: string): Promise<Response> {
	const { token, phoneNumberId, apiVersion, apiBaseUrl } = getConfig();
	const base = apiBaseUrl ?? WHATSAPP_API_BASE;
	const version = apiVersion ?? WHATSAPP_API_VERSION;

	return fetch(`${base}/${version}/${phoneNumberId}/messages`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			messaging_product: "whatsapp",
			to,
			type: "text",
			text: { body: text },
		}),
	});
}

/** Minimal inbound WhatsApp message shape. */
interface WhatsAppInbound {
	from: string;
	type?: string;
	text?: { body?: string };
}

/** Minimal webhook payload shape. */
interface WhatsAppWebhookPayload {
	entry?: Array<{
		changes?: Array<{
			value?: { messages?: WhatsAppInbound[] };
		}>;
	}>;
}

/**
 * Handles a WhatsApp webhook payload: replies to each inbound text message.
 *
 * @param payload - The JSON webhook body from Meta.
 * @param reply - Reply callback. Defaults to the assistant {@link useReply}.
 *
 * @example
 * ```ts
 * await useHandleWhatsAppMessage(payload);
 * ```
 */
export async function useHandleWhatsAppMessage(
	payload: unknown,
	reply: WhatsAppReplyFn = useReply,
): Promise<void> {
	const messages = (payload as WhatsAppWebhookPayload)?.entry?.[0]?.changes?.[0]?.value?.messages;
	const bounded = (messages ?? []).slice(0, WHATSAPP_MAX_MESSAGES_PER_WEBHOOK);

	for (const message of bounded) {
		const text = message?.text?.body;
		if (!text || text.trim() === "") continue;

		const sessionId = `wa:${message.from}`;
		const result = await reply(sessionId, text);

		if (result.ok) {
			await useSendWhatsAppMessage(message.from, result.data.reply);
		}
	}
}

/** Builds the Express router exposing the WhatsApp webhook. */
export function useCreateWhatsAppRouter(): Router {
	const router = Router();

	router.get("/webhook", (request: Request, response: ExpressResponse) => {
		const mode = String(request.query["hub.mode"] ?? "");
		const verifyToken = String(request.query["hub.verify_token"] ?? "");
		const challenge = String(request.query["hub.challenge"] ?? "");

		const valid = useVerifyWhatsAppWebhook(mode, verifyToken, challenge);
		if (valid) {
			response.status(200).type("text/plain").send(challenge);
			return;
		}
		response.status(403).json({ error: "Forbidden" });
	});

	const webhookRateLimit = rateLimit({
		windowMs: 60_000,
		max: 60,
		standardHeaders: "draft-7",
		legacyHeaders: false,
		message: { error: "Too many requests" },
	});

	router.post("/webhook", webhookRateLimit, (request: Request, response: ExpressResponse) => {
		const signature = request.header("x-hub-signature-256");
		if (!useVerifyWhatsAppSignature(useGetRawBody(request), signature)) {
			response.status(401).json({ error: "Invalid signature" });
			return;
		}

		// Ack fast so Meta does not retry; process the reply asynchronously.
		response.status(200).json({ status: "ok" });
		void useHandleWhatsAppMessage(request.body).catch((error: unknown) => {
			const message = error instanceof Error ? error.message : String(error);
			useLogger("error", `[WhatsApp] ${message}`);
		});
	});

	return router;
}

/** Module-level mount guard for the standalone webhook. */
let mounted = false;

/**
 * Mounts the WhatsApp webhook on the shared Express app and starts the server.
 *
 * @param port - Port to listen on (default: 3000)
 * @param host - Host to bind to (default: "localhost")
 * @param mountPath - Base path for the webhook routes (default: "/whatsapp")
 *
 * @example
 * ```ts
 * useStartWhatsApp(3000, "localhost");
 * // GET /whatsapp/webhook (verify), POST /whatsapp/webhook (messages)
 * ```
 */
export function useStartWhatsApp(port = 3000, host = "localhost", mountPath = "/whatsapp"): void {
	if (mounted) return;
	mounted = true;

	useExpressGetApp().use(mountPath, useCreateWhatsAppRouter());
	useExpressStart(port, host);
}
