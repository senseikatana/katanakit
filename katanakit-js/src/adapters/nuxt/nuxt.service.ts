import { createRequire } from "node:module";

import type { FetchResult } from "../../types/index.js";

type H3CreateError = (input: {
	statusCode?: number;
	statusMessage?: string;
	message?: string;
}) => Error;

let cachedCreateError: H3CreateError | null | undefined;

function tryLoadH3CreateError(): H3CreateError | null {
	if (cachedCreateError !== undefined) return cachedCreateError;
	try {
		const require = createRequire(import.meta.url);
		const h3 = require("h3") as { createError?: H3CreateError };
		cachedCreateError = typeof h3.createError === "function" ? h3.createError : null;
	} catch {
		cachedCreateError = null;
	}
	return cachedCreateError;
}

/**
 * Unwraps a KatanaKit Safe Result, throwing an H3-compatible error on failure.
 * Returns the data directly on success.
 *
 * Prefers `h3.createError` when available so Nuxt/H3 status codes work correctly.
 *
 * @param result - The Safe Result from `useFetch`, `useGet`, `usePost`, etc.
 * @param context - Optional context prefix for the error message.
 * @returns The data from the result.
 * @throws H3-compatible error with the appropriate status code.
 *
 * @example
 * ```ts
 * // server/api/pokemon/[id].ts
 * import { useGetApi } from "katanakit-js";
 * import { useUnwrap } from "katanakit-js/adapters/nuxt";
 *
 * export default defineEventHandler(async (event) => {
 *   const id = getRouterParam(event, "id");
 *   const result = await useGetApi("pokeapi", "pokemonById", { params: { id } });
 *   return useUnwrap(result, `Pokemon ${id}`);
 * });
 * ```
 */
export function useUnwrap<T>(result: FetchResult<T>, context?: string): T {
	if (result.ok) {
		return result.data;
	}

	const message = context ? `${context}: ${result.error.message}` : result.error.message;

	const statusCode = result.error.status || 500;

	throw createH3Error(statusCode, message);
}

/**
 * Creates a Safe Result response for Nuxt API routes.
 * Returns the data with proper status code on success,
 * or an error response on failure.
 *
 * @param result - The Safe Result from any KatanaKit fetch method.
 * @returns An H3-compatible response object.
 *
 * @example
 * ```ts
 * // server/api/users.ts
 * import { useGetApi } from "katanakit-js";
 * import { useSafeResponse } from "katanakit-js/adapters/nuxt";
 *
 * export default defineEventHandler(async () => {
 *   const result = await useGetApi("api", "users");
 *   return useSafeResponse(result);
 * });
 * ```
 */
export function useSafeResponse<T>(result: FetchResult<T>): {
	data: T | null;
	error: { message: string; status: number } | null;
	ok: boolean;
} {
	if (result.ok) {
		return { data: result.data, error: null, ok: true };
	}

	return {
		data: null,
		error: {
			message: result.error.message,
			status: result.error.status,
		},
		ok: false,
	};
}

/**
 * Maps a KatanaKit Safe Result to an H3 event response.
 * Sets the appropriate status code and returns the data or error.
 *
 * @param event - The H3 event object.
 * @param result - The Safe Result from any KatanaKit fetch method.
 * @returns The data on success.
 *
 * @example
 * ```ts
 * // server/api/products.ts
 * import { useFetchApi } from "katanakit-js";
 * import { useEventResponse } from "katanakit-js/adapters/nuxt";
 *
 * export default defineEventHandler(async (event) => {
 *   const result = await useFetchApi("shop", "products");
 *   return useEventResponse(event, result);
 * });
 * ```
 */
export function useEventResponse<T>(
	event: { node: { res: { statusCode: number } } },
	result: FetchResult<T>,
): T | { error: string; status: number } {
	if (result.ok) {
		event.node.res.statusCode = 200;
		return result.data;
	}

	event.node.res.statusCode = result.error.status || 500;
	return {
		error: result.error.message,
		status: result.error.status,
	};
}

/**
 * Creates an error that H3/Nuxt recognize (statusCode / statusMessage).
 * Uses `h3.createError` when the peer is installed; otherwise brands a plain Error.
 */
function createH3Error(statusCode: number, message: string): Error {
	const createError = tryLoadH3CreateError();
	if (createError) {
		return createError({ statusCode, statusMessage: message, message });
	}

	const error = new Error(message) as Error & {
		statusCode: number;
		status: number;
		statusMessage: string;
		name: string;
	};
	error.statusCode = statusCode;
	error.status = statusCode;
	error.statusMessage = message;
	error.name = "H3Error";
	return error;
}
