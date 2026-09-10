import "dotenv/config";

import { useInitAssistant } from "../../core/services/assistant.service.js";
import { useInitTelegram, useStartTelegramPolling } from "./telegram.service.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
	throw new Error("[telegram] TELEGRAM_BOT_TOKEN is not set.");
}

useInitAssistant();
useInitTelegram({ token });

useStartTelegramPolling();
