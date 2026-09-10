/**
 * Generic digital assistant demo (copy this into another project).
 *
 * In a consumer app:
 *   import { useInitAssistant, useReply } from "katanakit-js";
 *   import { useStartAssistant } from "katanakit-js/adapters/assistant";
 *   import { useInitTelegram, useStartTelegramPolling } from "katanakit-js/adapters/telegram";
 *   import { useInitWhatsApp, useStartWhatsApp } from "katanakit-js/adapters/whatsapp";
 *
 * Run from this repo:
 *   DASHSCOPE_API_KEY=... yarn assistant:demo
 *   KITT_CHANNEL=telegram TELEGRAM_BOT_TOKEN=... yarn assistant:demo
 *   KITT_CHANNEL=whatsapp WHATSAPP_TOKEN=... WHATSAPP_PHONE_NUMBER_ID=... WHATSAPP_VERIFY_TOKEN=... yarn assistant:demo
 */
import "dotenv/config";
import { appendFile, readFile, realpath } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { useStartAssistant } from "../../src/adapters/assistant/assistant.service.js";
import {
	useInitTelegram,
	useStartTelegramPolling,
} from "../../src/adapters/telegram/telegram.service.js";
import { useInitWhatsApp, useStartWhatsApp } from "../../src/adapters/whatsapp/whatsapp.service.js";
import { useInitAssistant } from "../../src/core/services/assistant.service.js";
import type { AiTool } from "../../src/types/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const knowledgePath = join(here, "knowledge-base.md");
const notesPath = join(here, "notes.jsonl");

/** Resolves `requested` inside `root`, rejecting traversal and sibling prefixes. */
async function resolveConfined(root: string, requested: string): Promise<string | null> {
	const realRoot = await realpath(root);
	const candidate = resolve(realRoot, requested);
	if (candidate !== realRoot && !candidate.startsWith(realRoot + sep)) {
		return null;
	}
	return realpath(candidate).catch(() => null);
}

const demoTools: AiTool[] = [
	{
		name: "readFile",
		description: "Reads the local knowledge base. Path must stay under examples/assistant/.",
		parameters: {
			type: "object",
			properties: { path: { type: "string" } },
			required: ["path"],
		},
		execute: async (input) => {
			const requested = (input as { path: string }).path;
			const resolved = await resolveConfined(here, requested);
			if (!resolved) {
				return { error: "Path is outside the demo folder." };
			}
			return readFile(resolved, "utf8");
		},
	},
	{
		name: "saveNote",
		description: "Persists a short note (action, reminder, follow-up) and confirms it.",
		parameters: {
			type: "object",
			properties: { note: { type: "string" } },
			required: ["note"],
		},
		execute: async (input) => {
			const note = (input as { note: string }).note;
			await appendFile(notesPath, `${JSON.stringify({ note, at: new Date().toISOString() })}\n`);
			return { saved: true, note };
		},
	},
];

useInitAssistant({
	systemPrompt: [
		"You are Kitt, a generic digital assistant.",
		"Use readFile on knowledge-base.md when the user asks about hours, contact or policies.",
		"Use saveNote when the user asks you to remember something.",
		"Answer clearly. If you do not know, say so.",
	].join(" "),
	tools: demoTools,
	maxSteps: 6,
});

const channel = process.env.KITT_CHANNEL ?? "rest";

if (channel === "telegram") {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required for KITT_CHANNEL=telegram");
	useInitTelegram({ token });
	await useStartTelegramPolling();
} else if (channel === "whatsapp") {
	const token = process.env.WHATSAPP_TOKEN;
	const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
	const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
	const appSecret = process.env.WHATSAPP_APP_SECRET;
	if (!token || !phoneNumberId || !verifyToken || !appSecret) {
		throw new Error(
			"WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN and WHATSAPP_APP_SECRET are required",
		);
	}
	useInitWhatsApp({ token, phoneNumberId, verifyToken, appSecret });
	useStartWhatsApp(Number(process.env.PORT ?? 3000), process.env.HOST ?? "localhost");
} else {
	console.log(`Kitt REST demo. Knowledge base: ${knowledgePath}`);
	useStartAssistant(Number(process.env.PORT ?? 3000), process.env.HOST ?? "localhost");
}
