/// <reference types="bun-types" />

import {
	jsonResponse,
	useDummyJsonPostById,
	useDummyJsonPosts,
	useDummyJsonProductById,
	useDummyJsonProductCategories,
	useDummyJsonProducts,
	useDummyJsonProductsByCategory,
	useDummyJsonProductSearch,
	useDummyJsonQuotes,
	useDummyJsonRandomQuote,
	useDummyJsonUserById,
	useDummyJsonUsers,
} from "./dummyjson.service.js";
import { useGetDummyJsonSeed } from "./seed.js";

/**
 * Builds the Bun.serve `routes` table for the dummyjson.com demo.
 *
 * Maps KatanaKit's dummyjson handlers onto a Bun router: static routes,
 * `:param` routes (with typed `req.params`), per-method handlers, and a
 * `/api/*` catch-all.
 *
 * @returns A route table ready for `Bun.serve({ routes })`.
 *
 * @example
 * ```ts
 * import { useBuildDummyJsonRoutes } from "katanakit-js/adapters/bun";
 *
 * Bun.serve({
 *   routes: useBuildDummyJsonRoutes(),
 *   fetch: () => new Response("Not Found", { status: 404 }),
 * });
 * ```
 */
export function useBuildDummyJsonRoutes() {
	return {
		"/api/status": jsonResponse({ status: "ok", service: "katanakit-js/adapters/bun" }),

		// Products
		"/api/products": { GET: () => useDummyJsonProducts() },
		"/api/products/:id": {
			GET: (req: Bun.BunRequest<"/api/products/:id">) => useDummyJsonProductById(req.params.id),
		},
		"/api/products/search": {
			GET: (req: Request) => {
				const query = new URL(req.url).searchParams.get("q") ?? "";
				return useDummyJsonProductSearch(query);
			},
		},
		"/api/products/categories": { GET: () => useDummyJsonProductCategories() },
		"/api/products/category/:category": {
			GET: (req: Bun.BunRequest<"/api/products/category/:category">) =>
				useDummyJsonProductsByCategory(req.params.category),
		},

		// Users
		"/api/users": { GET: () => useDummyJsonUsers() },
		"/api/users/:id": {
			GET: (req: Bun.BunRequest<"/api/users/:id">) => useDummyJsonUserById(req.params.id),
		},

		// Posts
		"/api/posts": { GET: () => useDummyJsonPosts() },
		"/api/posts/:id": {
			GET: (req: Bun.BunRequest<"/api/posts/:id">) => useDummyJsonPostById(req.params.id),
		},

		// Quotes
		"/api/quotes": { GET: () => useDummyJsonQuotes() },
		"/api/quotes/random": { GET: () => useDummyJsonRandomQuote() },

		// Offline seed
		"/api/seed": { GET: () => jsonResponse(useGetDummyJsonSeed()) },

		// Catch-all for unmatched /api/* routes
		"/api/*": jsonResponse({ message: "Not found" }, 404),
	};
}

/** Route table type inferred from {@link useBuildDummyJsonRoutes}. */
export type DummyJsonRoutes = ReturnType<typeof useBuildDummyJsonRoutes>;
