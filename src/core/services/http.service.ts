import type {
	ApiEntry,
	ApisConfig,
	FetchOptions,
	FetchResult,
	UrlOptions,
} from "../../types/index.js";

/** Module-level API registry. */
let apis: ApisConfig = {};

/**
 * Internal: retrieves a registered API entry or throws.
 *
 * @param apiName - The key of the API in the registry.
 * @returns The {@link ApiEntry} for the given name.
 * @throws {Error} If the API is not registered.
 */
function getApiEntry(apiName: string): ApiEntry {
	const api = apis[apiName];
	if (!api) {
		throw new Error(`[FetchApiManager] API "${apiName}" is not registered.`);
	}
	return api;
}

/**
 * Internal: reads a Response body, attempting JSON parse for JSON content types.
 *
 * @param response - The fetch Response to read.
 * @returns The parsed body or `null` for empty responses.
 */
async function readBody(response: Response): Promise<unknown> {
	const text = await response.text();
	if (!text) return null;

	const contentType = response.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) {
		try {
			return JSON.parse(text) as unknown;
		} catch {
			return text;
		}
	}

	try {
		return JSON.parse(text) as unknown;
	} catch {
		return text;
	}
}

/**
 * Internal: serializes a request body.
 * Leaves FormData / Blob / URLSearchParams / ArrayBuffer / TypedArray /
 * ReadableStream / string untouched (no forced JSON Content-Type so the
 * runtime can set the multipart boundary).
 *
 * @param body - The body to serialize.
 * @returns An object with optional `body` and `headers` for `fetch`.
 */
function serializeBody(body: unknown): { body?: BodyInit; headers?: HeadersInit } {
	if (body === undefined) return {};

	const isRawBody =
		(typeof FormData !== "undefined" && body instanceof FormData) ||
		(typeof Blob !== "undefined" && body instanceof Blob) ||
		(typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) ||
		(typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) ||
		ArrayBuffer.isView(body) ||
		(typeof ReadableStream !== "undefined" && body instanceof ReadableStream) ||
		typeof body === "string";

	if (isRawBody) {
		return { body: body as BodyInit };
	}

	return {
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	};
}

/**
 * Registers (merges) API definitions into the client registry.
 * Prefer the clearer alias {@link useInitApis}.
 *
 * @param apisConfig - The API definitions to merge into the registry.
 *
 * @example
 * ```ts
 * import { useInit } from "katanakit-js";
 *
 * useInit({
 *   pokeapi: {
 *     baseUri: "https://pokeapi.co/api/v2",
 *     endpoints: { pokemonById: "/pokemon/:id/" },
 *   },
 * });
 * ```
 */
export function useInit(apisConfig: ApisConfig): void {
	apis = { ...apis, ...apisConfig };
}

/**
 * Registers (merges) API definitions into the client registry.
 *
 * @param apisConfig - The API definitions to merge into the registry.
 *
 * @example
 * ```ts
 * import { useInitApis } from "katanakit-js";
 *
 * useInitApis({
 *   pokeapi: {
 *     baseUri: "https://pokeapi.co/api/v2",
 *     endpoints: { pokemonById: "/pokemon/:id/" },
 *   },
 * });
 * ```
 */
export function useInitApis(apisConfig: ApisConfig): void {
	useInit(apisConfig);
}

/**
 * Returns a shallow copy of the registered APIs (safe to mutate locally).
 *
 * @returns A shallow copy of the current API registry.
 *
 * @example
 * ```ts
 * import { useGetApis } from "katanakit-js";
 *
 * const apis = useGetApis();
 * ```
 */
export function useGetApis(): ApisConfig {
	return { ...apis };
}

/**
 * Returns a shallow copy of the registered APIs.
 * Alias for {@link useGetApis}.
 *
 * @returns A shallow copy of the current API registry.
 *
 * @example
 * ```ts
 * import { useGetApisConfig } from "katanakit-js";
 *
 * const apis = useGetApisConfig();
 * ```
 */
export function useGetApisConfig(): ApisConfig {
	return useGetApis();
}

/**
 * Builds a safe http(s) URL from a registered API + endpoint without making
 * a network request.
 *
 * Use cases:
 * - **Navigation links** — generate `<a href>` URLs for download links, pagination, etc.
 * - **Image/file sources** — build `<img src>` or `<video src>` URLs from API endpoints.
 * - **Third-party libraries** — pass URLs to charting, mapping, or analytics libraries that
 *   handle their own fetching.
 * - **Debugging** — log the full URL before making a request to verify params and query strings.
 * - **SSR** — construct URLs server-side for pre-rendering or metadata generation.
 *
 * @param apiName - The registered API key (from `useInitApis`).
 * @param endpointName - The endpoint key within that API.
 * @param options - Optional URL building options (path params, query params, ignore defaults).
 * @returns The fully constructed URL string.
 * @throws {Error} If the API or endpoint is not registered, or the URL scheme is not http(s).
 *
 * @example
 * ```ts
 * import { useBuildUrl } from "katanakit-js";
 *
 * // Basic URL with path params
 * const url = useBuildUrl("pokeapi", "pokemonById", { params: { id: 25 } });
 * // → "https://pokeapi.co/api/v2/pokemon/25"
 *
 * // URL with query params
 * const download = useBuildUrl("myApi", "export", { query: { format: "pdf" } });
 * // → "https://api.myapp.com/v1/export?format=pdf"
 *
 * // Use in a template
 * <a href={useBuildUrl("myApi", "download", { params: { id: 42 } })}>Download</a>
 *
 * // Debug before fetching
 * console.log("Will fetch:", useBuildUrl("myApi", "users", { query: { page: 1 } }));
 * ```
 */
export function useBuildUrl(
	apiName: string,
	endpointName: string,
	options: UrlOptions = {},
): string {
	const { params, query, ignoreDefaultQuery = false } = options;
	const api = getApiEntry(apiName);
	let path = api.endpoints?.[endpointName] ?? "";

	if (!path) {
		throw new Error(`[FetchApiManager] Endpoint "${endpointName}" not found in API "${apiName}".`);
	}

	if (params) {
		const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		path = Object.entries(params).reduce(
			(acc, [key, value]) =>
				acc.replace(new RegExp(`:${escapeRegex(key)}\\b`, "g"), encodeURIComponent(String(value))),
			path,
		);
	}

	const baseStr = api.baseUri instanceof URL ? api.baseUri.toString() : api.baseUri;
	const baseClean = baseStr.endsWith("/") ? baseStr.slice(0, -1) : baseStr;
	const pathClean = path.startsWith("/") ? path : `/${path}`;
	const url = new URL(`${baseClean}${pathClean}`);

	// Only allow http(s) to prevent SSRF and `javascript:` URLs.
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error(`[FetchApiManager] Scheme "${url.protocol}" is not allowed.`);
	}

	const defaultParams = ignoreDefaultQuery ? {} : (api.defaultQueryParams?.[endpointName] ?? {});

	const mergedQuery = { ...defaultParams, ...query };

	for (const [key, value] of Object.entries(mergedQuery)) {
		if (value !== undefined && value !== null) {
			url.searchParams.set(key, String(value));
		}
	}

	return url.toString();
}

/**
 * Builds a safe http(s) URL from a registered API + endpoint.
 * Alias for {@link useBuildUrl}.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param options - Optional URL building options.
 * @returns The fully constructed URL string.
 *
 * @example
 * ```ts
 * import { useBuildApiUrl } from "katanakit-js";
 *
 * const url = useBuildApiUrl("pokeapi", "pokemonById", { params: { id: 25 } });
 * ```
 */
export function useBuildApiUrl(
	apiName: string,
	endpointName: string,
	options: UrlOptions = {},
): string {
	return useBuildUrl(apiName, endpointName, options);
}

/**
 * Fetches a registered endpoint and returns a Safe Result.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param options - Optional fetch options (method, headers, body, urlOptions).
 * @returns A {@link FetchResult} with data or error.
 *
 * @example
 * ```ts
 * import { useFetch } from "katanakit-js";
 *
 * const result = await useFetch("pokeapi", "pokemonById", {
 *   method: "GET",
 *   urlOptions: { params: { id: 25 } },
 * });
 * if (result.ok) console.log(result.data);
 * ```
 */
export async function useFetch<T = unknown>(
	apiName: string,
	endpointName: string,
	{ urlOptions, ...init }: FetchOptions = {},
): Promise<FetchResult<T>> {
	let url = "";

	try {
		url = useBuildUrl(apiName, endpointName, urlOptions);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return {
			data: null,
			error: {
				message: `Config Error: ${message}`,
				status: 0,
			},
			url,
			status: 0,
			ok: false,
		};
	}

	try {
		const response = await fetch(url, init);

		if (!response.ok) {
			const errorDetails = await readBody(response);

			return {
				data: null,
				error: {
					message: `HTTP Error: ${response.statusText || "Unsuccessful response"}`,
					status: response.status,
					details: errorDetails,
				},
				url: response.url || url,
				status: response.status,
				ok: false,
			};
		}

		// 204 No Content and empty bodies are valid success responses.
		if (response.status === 204) {
			return {
				data: null as T,
				error: null,
				url: response.url || url,
				status: 204,
				ok: true,
			};
		}

		const body = await readBody(response);

		return {
			data: body as T,
			error: null,
			url: response.url || url,
			status: response.status,
			ok: true,
		};
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return {
			data: null,
			error: {
				message: `Network/Client Error: ${message}`,
				status: 0,
			},
			url,
			status: 0,
			ok: false,
		};
	}
}

/**
 * Fetches a registered endpoint and returns a Safe Result.
 * Alias for {@link useFetch}.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param options - Optional fetch options.
 * @returns A {@link FetchResult} with data or error.
 *
 * @example
 * ```ts
 * import { useFetchApi } from "katanakit-js";
 *
 * const result = await useFetchApi("pokeapi", "pokemonById", {
 *   method: "GET",
 *   urlOptions: { params: { id: 25 } },
 * });
 * if (result.ok) console.log(result.data);
 * ```
 */
export async function useFetchApi<T = unknown>(
	apiName: string,
	endpointName: string,
	options?: FetchOptions,
): Promise<FetchResult<T>> {
	return useFetch<T>(apiName, endpointName, options);
}

/**
 * GET helper over a registered API endpoint.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param urlOptions - Optional URL building options.
 * @returns A {@link FetchResult} with data or error.
 *
 * @example
 * ```ts
 * import { useGet } from "katanakit-js";
 *
 * const result = await useGet<{ name: string }>("pokeapi", "pokemonById", {
 *   params: { id: 25 },
 * });
 * ```
 */
export async function useGet<T = unknown>(
	apiName: string,
	endpointName: string,
	urlOptions?: UrlOptions,
): Promise<FetchResult<T>> {
	return useFetch<T>(apiName, endpointName, { method: "GET", urlOptions });
}

/**
 * GET helper over a registered API endpoint.
 * Alias for {@link useGet}.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param urlOptions - Optional URL building options.
 * @returns A {@link FetchResult} with data or error.
 *
 * @example
 * ```ts
 * import { useGetApi } from "katanakit-js";
 *
 * const result = await useGetApi<{ name: string }>("pokeapi", "pokemonById", {
 *   params: { id: 25 },
 * });
 * ```
 */
export async function useGetApi<T = unknown>(
	apiName: string,
	endpointName: string,
	urlOptions?: UrlOptions,
): Promise<FetchResult<T>> {
	return useGet<T>(apiName, endpointName, urlOptions);
}

/**
 * POST helper over a registered API endpoint.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param body - Optional request body (auto-serialized to JSON unless raw).
 * @param urlOptions - Optional URL building options.
 * @returns A {@link FetchResult} with data or error.
 *
 * @example
 * ```ts
 * import { usePost } from "katanakit-js";
 *
 * const result = await usePost("pokeapi", "createPokemon", { name: "Pikachu" });
 * ```
 */
export async function usePost<T = unknown>(
	apiName: string,
	endpointName: string,
	body?: unknown,
	urlOptions?: UrlOptions,
): Promise<FetchResult<T>> {
	return useFetch<T>(apiName, endpointName, {
		method: "POST",
		...serializeBody(body),
		urlOptions,
	});
}

/**
 * PUT helper over a registered API endpoint.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param body - Optional request body (auto-serialized to JSON unless raw).
 * @param urlOptions - Optional URL building options.
 * @returns A {@link FetchResult} with data or error.
 *
 * @example
 * ```ts
 * import { usePut } from "katanakit-js";
 *
 * const result = await usePut("pokeapi", "updatePokemon", { name: "Raichu" }, { params: { id: 25 } });
 * ```
 */
export async function usePut<T = unknown>(
	apiName: string,
	endpointName: string,
	body?: unknown,
	urlOptions?: UrlOptions,
): Promise<FetchResult<T>> {
	return useFetch<T>(apiName, endpointName, {
		method: "PUT",
		...serializeBody(body),
		urlOptions,
	});
}

/**
 * PATCH helper over a registered API endpoint.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param body - Optional request body (auto-serialized to JSON unless raw).
 * @param urlOptions - Optional URL building options.
 * @returns A {@link FetchResult} with data or error.
 *
 * @example
 * ```ts
 * import { usePatch } from "katanakit-js";
 *
 * const result = await usePatch("pokeapi", "updatePokemon", { name: "Raichu" }, { params: { id: 25 } });
 * ```
 */
export async function usePatch<T = unknown>(
	apiName: string,
	endpointName: string,
	body?: unknown,
	urlOptions?: UrlOptions,
): Promise<FetchResult<T>> {
	return useFetch<T>(apiName, endpointName, {
		method: "PATCH",
		...serializeBody(body),
		urlOptions,
	});
}

/**
 * DELETE helper over a registered API endpoint.
 *
 * @param apiName - The registered API key.
 * @param endpointName - The endpoint key within the API.
 * @param urlOptions - Optional URL building options.
 * @returns A {@link FetchResult} with data or error.
 *
 * @example
 * ```ts
 * import { useDelete } from "katanakit-js";
 *
 * const result = await useDelete("pokeapi", "deletePokemon", { params: { id: 25 } });
 * ```
 */
export async function useDelete<T = unknown>(
	apiName: string,
	endpointName: string,
	urlOptions?: UrlOptions,
): Promise<FetchResult<T>> {
	return useFetch<T>(apiName, endpointName, {
		method: "DELETE",
		urlOptions,
	});
}
