import type { AiMessage, AiRole, ConversationStore } from "../types/index.js";
import { db } from "./db.js";

/**
 * Prisma-backed conversation store for the assistant.
 *
 * Persists conversations and messages so history survives restarts. Requires
 * `DATABASE_URL` to be set and the contract to be applied (`prisma db init`).
 */
export function useCreatePrismaStore(): ConversationStore {
	const useCreate = async (channel?: string): Promise<string> => {
		const row = await db.orm.public.Conversation.create(channel ? { channel } : {});
		return row.id;
	};

	const useExists = async (sessionId: string): Promise<boolean> => {
		const row = await db.orm.public.Conversation.where({ id: sessionId }).first();
		return row !== null;
	};

	const useAppend = async (sessionId: string, message: AiMessage): Promise<void> => {
		await db.orm.public.Message.create({
			conversationId: sessionId,
			role: message.role,
			content: message.content ?? "",
		});
	};

	const useGetHistory = async (sessionId: string): Promise<AiMessage[]> => {
		const rows = await db.orm.public.Message.where({ conversationId: sessionId })
			.orderBy((m) => m.createdAt.asc())
			.all();

		return rows.map((row) => ({
			role: row.role as AiRole,
			content: row.content,
		}));
	};

	const useReset = async (sessionId: string): Promise<void> => {
		await db.orm.public.Conversation.where({ id: sessionId }).delete();
	};

	return { useCreate, useExists, useAppend, useGetHistory, useReset };
}

/** Shared default store backed by the Prisma client. */
export const PrismaConversationStore: ConversationStore = useCreatePrismaStore();
