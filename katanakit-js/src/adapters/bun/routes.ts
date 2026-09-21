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

/** Route table type for the Bun adapter (per-path handlers with params). */
export type DummyJsonRoutes = Bun.Serve.Routes<undefined, string>;

/**
 * Builds the Bun.serve `routes` table for the dummyjson.com demo.
 *
 * Maps KatanaKit's dummyjson handlers onto a Bun router: static routes,
 * `:param` routes, per-method handlers, and a `/api/*` catch-all.
 *
 * @returns A {@link DummyJsonRoutes} table ready for `Bun.serve({ routes })`.
 *
 * @example
 * ```ts
 * import { useBuildDummyJsonRoutes } from "katanakit-js/adapters/bun";
 *
 * const routes = useBuildDummyJsonRoutes();
 * Bun.serve({ routes, fetch: () => new Response("Not Found", { status: 404 }) });
 * ```
 */
export function useBuildDummyJsonRoutes(): DummyJsonRoutes {
	return {
		"/api/status": jsonResponse({ status: "ok", service: "katanakit-js/adapters/bun" }),

		// Products
		"/api/products": { GET: () => useDummyJsonProducts() },
		"/api/products/:id": { GET: (req) => useDummyJsonProductById(req.params.id) },
		"/api/products/search": {
			GET: (req) => {
				const query = new URL(req.url).searchParams.get("q") ?? "";
				return useDummyJsonProductSearch(query);
			},
		},
		"/api/products/categories": { GET: () => useDummyJsonProductCategories() },
		"/api/products/category/:category": {
			GET: (req) => useDummyJsonProductsByCategory(req.params.category),
		},

		// Users
		"/api/users": { GET: () => useDummyJsonUsers() },
		"/api/users/:id": { GET: (req) => useDummyJsonUserById(req.params.id) },

		// Posts
		"/api/posts": { GET: () => useDummyJsonPosts() },
		"/api/posts/:id": { GET: (req) => useDummyJsonPostById(req.params.id) },

		// Quotes
		"/api/quotes": { GET: () => useDummyJsonQuotes() },
		"/api/quotes/random": { GET: () => useDummyJsonRandomQuote() },

		// Offline seed
		"/api/seed": { GET: () => jsonResponse(useGetDummyJsonSeed()) },

		// Catch-all for unmatched /api/* routes
		"/api/*": jsonResponse({ message: "Not found" }, 404),
	};
}
