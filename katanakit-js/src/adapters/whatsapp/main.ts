import "dotenv/config";

import { useInitAssistant } from "../../core/services/assistant.service.js";
import { useInitWhatsApp, useStartWhatsApp } from "./whatsapp.service.js";

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
const appSecret = process.env.WHATSAPP_APP_SECRET;

if (!token || !phoneNumberId || !verifyToken || !appSecret) {
	throw new Error(
		"[whatsapp] WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN and WHATSAPP_APP_SECRET must be set.",
	);
}

useInitAssistant();
useInitWhatsApp({ token, phoneNumberId, verifyToken, appSecret });

useStartWhatsApp(Number(process.env.PORT ?? 3000), process.env.HOST ?? "localhost");
