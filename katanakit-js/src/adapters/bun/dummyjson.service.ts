import { useFetch, useInitApis } from "../../core/services/http.service.js";
import type { FetchResult } from "../../types/index.js";

/** Base URL of the public dummyjson.com REST API. */
export const DUMMYJSON_BASE_URL = "https://dummyjson.com";

/** Endpoints of the dummyjson.com REST API (relative to {@link DUMMYJSON_BASE_URL}). */
const DUMMYJSON_ENDPOINTS = {
	products: "/products",
	productById: "/products/:id",
	productSearch: "/products/search",
	productCategories: "/products/categories",
	productByCategory: "/products/category/:category",
	users: "/users",
	userById: "/users/:id",
	posts: "/posts",
	postById: "/posts/:id",
	quotes: "/quotes",
	quoteRandom: "/quotes/random",
};

/**
 * Registers the dummyjson.com API in the HTTP manager under the `dummyjson`
 * key. Call once before any {@link useDummyJsonProducts}-style handler.
 *
 * @example
 * ```ts
 * import { useInitDummyJson } from "katanakit-js/adapters/bun";
 *
 * useInitDummyJson();
 * ```
 */
export function useInitDummyJson(): void {
	useInitApis({
		dummyjson: {
			baseUri: DUMMYJSON_BASE_URL,
			endpoints: DUMMYJSON_ENDPOINTS,
		},
	});
}

/**
 * Converts a Safe Result into a JSON {@link Response}.
 *
 * @param result - The Safe Result from `useFetch`.
 * @param status - HTTP status override for success (default `200`).
 * @returns A JSON `Response` with the data or error body.
 */
function toResponse<T>(result: FetchResult<T>, status = 200): Response {
	if (result.ok) {
		return jsonResponse(result.data, status);
	}
	return jsonResponse({ message: result.error.message }, result.error.status || 500);
}

/** Serializes `data` into a JSON {@link Response}. */
export function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

/**
 * Lists products from dummyjson.com.
 *
 * @returns A JSON `Response` wrapping the product list.
 */
export async function useDummyJsonProducts(): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "products"));
}

/**
 * Fetches a single product by id.
 *
 * @param id - The product id.
 * @returns A JSON `Response` wrapping the product.
 */
export async function useDummyJsonProductById(id: string): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "productById", { urlOptions: { params: { id } } }));
}

/**
 * Searches products by a free-text query.
 *
 * @param query - The search term.
 * @returns A JSON `Response` wrapping the search results.
 */
export async function useDummyJsonProductSearch(query: string): Promise<Response> {
	return toResponse(
		await useFetch("dummyjson", "productSearch", { urlOptions: { query: { q: query } } }),
	);
}

/**
 * Lists all product categories.
 *
 * @returns A JSON `Response` wrapping the category list.
 */
export async function useDummyJsonProductCategories(): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "productCategories"));
}

/**
 * Lists products within a category.
 *
 * @param category - The category slug (e.g. `smartphones`).
 * @returns A JSON `Response` wrapping the products.
 */
export async function useDummyJsonProductsByCategory(category: string): Promise<Response> {
	return toResponse(
		await useFetch("dummyjson", "productByCategory", { urlOptions: { params: { category } } }),
	);
}

/**
 * Lists users from dummyjson.com.
 *
 * @returns A JSON `Response` wrapping the user list.
 */
export async function useDummyJsonUsers(): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "users"));
}

/**
 * Fetches a single user by id.
 *
 * @param id - The user id.
 * @returns A JSON `Response` wrapping the user.
 */
export async function useDummyJsonUserById(id: string): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "userById", { urlOptions: { params: { id } } }));
}

/**
 * Lists posts from dummyjson.com.
 *
 * @returns A JSON `Response` wrapping the post list.
 */
export async function useDummyJsonPosts(): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "posts"));
}

/**
 * Fetches a single post by id.
 *
 * @param id - The post id.
 * @returns A JSON `Response` wrapping the post.
 */
export async function useDummyJsonPostById(id: string): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "postById", { urlOptions: { params: { id } } }));
}

/**
 * Lists quotes from dummyjson.com.
 *
 * @returns A JSON `Response` wrapping the quote list.
 */
export async function useDummyJsonQuotes(): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "quotes"));
}

/**
 * Fetches a random quote from dummyjson.com.
 *
 * @returns A JSON `Response` wrapping the quote.
 */
export async function useDummyJsonRandomQuote(): Promise<Response> {
	return toResponse(await useFetch("dummyjson", "quoteRandom"));
}
