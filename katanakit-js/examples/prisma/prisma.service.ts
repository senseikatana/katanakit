/**
 * Example: Prisma + Accelerate singleton.
 *
 * Function-based singleton (no class). Requires `@prisma/client` and
 * `@prisma/extension-accelerate` installed in your project (they are not
 * dependencies of this library):
 *
 *   npm install -D prisma
 *   npm install @prisma/client @prisma/extension-accelerate
 *   npx prisma init
 */
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createExtendedPrismaClient = () =>
	new PrismaClient({
		datasources: { db: { url: process.env.DATABASE_URL } },
	}).$extends(withAccelerate());

export type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;

declare global {
	var __prismaClientInstance: ExtendedPrismaClient | undefined;
}

/** Public surface of the Prisma singleton service. */
export interface PrismaServiceApi {
	readonly client: ExtendedPrismaClient;
	useConnect(): Promise<void>;
	useDisconnect(): Promise<void>;
}

/** Module-level singleton handle. */
let instance: PrismaServiceApi | null = null;

/** Resolves the client: globalThis cache survives HMR in dev; fresh client in prod. */
function useResolveClient(): ExtendedPrismaClient {
	if (process.env.NODE_ENV === "production") {
		return createExtendedPrismaClient();
	}
	globalThis.__prismaClientInstance ??= createExtendedPrismaClient();
	return globalThis.__prismaClientInstance;
}

/**
 * Lazily-created singleton service (replaces the `PrismaService` class).
 *
 * @returns The shared {@link PrismaServiceApi} instance.
 *
 * @example
 * ```ts
 * const service = usePrismaService();
 * await service.useConnect();
 * ```
 */
export function usePrismaService(): PrismaServiceApi {
	if (!instance) {
		const client = useResolveClient();
		instance = {
			client,
			useConnect: () => client.$connect(),
			useDisconnect: () => client.$disconnect(),
		};
	}
	return instance;
}

export const PRISMA_SERVICE = usePrismaService();
export const db = PRISMA_SERVICE.client;
