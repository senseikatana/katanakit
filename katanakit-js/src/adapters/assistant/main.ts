import "dotenv/config";

import { useInitAssistant } from "../../core/services/assistant.service.js";
import { useStartAssistant } from "./assistant.service.js";

if (process.env.DATABASE_URL) {
	const { useCreatePrismaStore } = await import("../../prisma/assistant.store.js");
	useInitAssistant({ store: useCreatePrismaStore() });
} else {
	useInitAssistant();
}

useStartAssistant(Number(process.env.PORT ?? 3000), process.env.HOST ?? "localhost");
