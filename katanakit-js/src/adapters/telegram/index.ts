export type {
	TelegramConfig,
	TelegramPollingOptions,
	TelegramReplyFn,
} from "./telegram.service.js";
export {
	TELEGRAM_API_BASE,
	useHandleTelegramUpdate,
	useInitTelegram,
	useStartTelegramPolling,
	useTelegramSendMessage,
} from "./telegram.service.js";
