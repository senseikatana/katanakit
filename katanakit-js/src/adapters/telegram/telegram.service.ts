import { useReply } from "../../core/services/assistant.service.js";
import { useLogger } from "../../core/services/logger.service.js";
import { useSleep } from "../../core/services/utils.service.js";
import type { AssistantResult } from "../../types/index.js";

/** Default Telegram Bot API base URL. */
export const TELEGRAM_API_BASE = "https://api.telegram.org";

/** Configuration for a Telegram bot. */
export interface TelegramConfig {
	token: string;
	apiBaseUrl?: string;
}

/** Callback producing an assistant reply for a channel session. */
export type TelegramReplyFn = (sessionId: string, text: string) => Promise<AssistantResult>;

/** Module-level bot configuration. */
let config: TelegramConfig | null = null;

/** Retrieves the configured bot or throws. */
function getConfig(): TelegramConfig {
	if (!config) {
		throw new Error("[Telegram] Not configured. Call useInitTelegram() first.");
	}
	return config;
}

/**
 * Registers the Telegram bot configuration.
 *
 * @param cfg - Bot token (from BotFather) and optional API base URL.
 *
 * @example
 * ```ts
 * useInitTelegram({ token: process.env.TELEGRAM_BOT_TOKEN });
 * ```
 */
export function useInitTelegram(cfg: TelegramConfig): void {
	config = { ...cfg };
}

/**
 * Sends a text message to a Telegram chat.
 *
 * @param chatId - Destination chat id.
 * @param text - Message body.
 * @returns The Telegram API response.
 */
export async function useTelegramSendMessage(chatId: number, text: string): Promise<Response> {
	const { token, apiBaseUrl } = getConfig();
	return fetch(`${apiBaseUrl ?? TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ chat_id: chatId, text }),
	});
}

/** Minimal inbound Telegram message shape. */
interface TelegramMessage {
	chat: { id: number };
	text?: string;
}

/**
 * Handles a single Telegram update: replies to inbound text messages.
 *
 * @param update - A Telegram update object (from `getUpdates` or a webhook).
 * @param reply - Reply callback. Defaults to the assistant {@link useReply}.
 *
 * @example
 * ```ts
 * await useHandleTelegramUpdate(update);
 * ```
 */
export async function useHandleTelegramUpdate(
	update: unknown,
	reply: TelegramReplyFn = useReply,
): Promise<void> {
	const message = (update as { message?: TelegramMessage })?.message;
	if (!message?.text || message.text.trim() === "") return;

	const sessionId = `telegram:${message.chat.id}`;
	const result = await reply(sessionId, message.text);

	if (result.ok) {
		await useTelegramSendMessage(message.chat.id, result.data.reply);
	}
}

/** Options for the long-polling loop. */
export interface TelegramPollingOptions {
	intervalMs?: number;
	signal?: AbortSignal;
	reply?: TelegramReplyFn;
}

/**
 * Starts the long-polling loop that keeps fetching and answering updates.
 * Runs until the provided signal aborts (or forever).
 *
 * @param options - Polling cadence, abort signal and reply callback.
 *
 * @example
 * ```ts
 * useStartTelegramPolling();
 * ```
 */
export async function useStartTelegramPolling(options: TelegramPollingOptions = {}): Promise<void> {
	const { intervalMs = 2000, signal, reply = useReply } = options;
	const { token, apiBaseUrl } = getConfig();
	const base = apiBaseUrl ?? TELEGRAM_API_BASE;

	let offset = 0;

	while (!signal?.aborted) {
		try {
			const response = await fetch(`${base}/bot${token}/getUpdates?timeout=30&offset=${offset}`, {
				signal,
			});

			if (!response.ok) {
				throw new Error(`getUpdates HTTP ${response.status}`);
			}

			const data = (await response.json()) as {
				ok: boolean;
				result?: Array<{ update_id: number }>;
			};

			for (const update of data.result ?? []) {
				offset = Math.max(offset, update.update_id + 1);
				await useHandleTelegramUpdate(update, reply);
			}
		} catch (error: unknown) {
			if (signal?.aborted) break;
			const message = error instanceof Error ? error.message : String(error);
			useLogger("error", `[Telegram] ${message}`);
		}

		await useSleep(intervalMs);
	}
}
