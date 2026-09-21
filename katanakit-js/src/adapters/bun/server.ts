/// <reference types="bun-types" />

import { type DummyJsonRoutes, useBuildDummyJsonRoutes } from "./routes.js";

/** Module-level Bun server singleton. */
let server: Bun.Server<undefined> | null = null;

/** Options accepted by {@link useBunCreate}. */
export interface BunServerOptions {
	/** Port to listen on (default `3000`). */
	port?: string | number;
	/** Hostname to bind to (default `"localhost"`). */
	hostname?: string;
	/** Route table (defaults to {@link useBuildDummyJsonRoutes}). */
	routes?: DummyJsonRoutes;
	/** Optional fallback handler for unmatched routes. */
	fetch?: (req: Request, server: Bun.Server<undefined>) => Response | Promise<Response>;
}

/**
 * Creates (or returns the existing) Bun HTTP server with the dummyjson route
 * table. Idempotent — subsequent calls return the same server.
 *
 * Requires the Bun runtime (Bun v1.2.3+ for the `routes` API).
 *
 * @param options - Optional port, hostname, routes and fetch handler.
 * @returns The running {@link Bun.Server}.
 *
 * @example
 * ```ts
 * import { useInitDummyJson, useBunCreate } from "katanakit-js/adapters/bun";
 *
 * useInitDummyJson();
 * const server = useBunCreate({ port: 3000 });
 * console.log(`Server running at ${server.url}`);
 * ```
 */
export function useBunCreate(options: BunServerOptions = {}): Bun.Server<undefined> {
	if (server) return server;

	server = Bun.serve<undefined>({
		port: options.port ?? 3000,
		hostname: options.hostname ?? "localhost",
		routes: options.routes ?? useBuildDummyJsonRoutes(),
		...(options.fetch ? { fetch: options.fetch } : {}),
	});

	return server;
}

/**
 * Starts the Bun server on the given port/hostname (Singleton).
 *
 * @param port - Port to listen on (default `3000`).
 * @param hostname - Hostname to bind to (default `"localhost"`).
 * @returns The running {@link Bun.Server}.
 */
export function useBunStart(port?: string | number, hostname?: string): Bun.Server<undefined> {
	return useBunCreate({ port, hostname });
}

/**
 * Returns the current Bun server singleton, or `null` before {@link useBunCreate}.
 *
 * @returns The {@link Bun.Server} or `null`.
 */
export function useBunGetServer(): Bun.Server<undefined> | null {
	return server;
}

/**
 * Stops the Bun server and clears the singleton.
 *
 * @param closeActiveConnections - Immediately terminate in-flight requests.
 * @returns A promise that resolves once all connections are closed.
 */
export async function useBunStop(closeActiveConnections = false): Promise<void> {
	if (server) {
		await server.stop(closeActiveConnections);
		server = null;
	}
}
