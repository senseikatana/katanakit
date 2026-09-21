import { afterEach, describe, expect, it, vi } from "vitest";

import {
	useDummyJsonProductById,
	useDummyJsonProducts,
	useInitDummyJson,
} from "@/adapters/bun/dummyjson.service.js";
import { useBuildDummyJsonRoutes } from "@/adapters/bun/routes.js";
import { dummyJsonSeed, useGetDummyJsonSeed } from "@/adapters/bun/seed.js";

afterEach(() => {
	vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("bun/dummyjson.service", () => {
	it("lists products from the dummyjson API", async () => {
		useInitDummyJson();
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(jsonResponse({ products: [{ id: 1, title: "iPhone X" }] })),
		);

		const response = await useDummyJsonProducts();

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ products: [{ id: 1, title: "iPhone X" }] });
	});

	it("fetches a product by id using the right URL", async () => {
		useInitDummyJson();
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 42, title: "Widget" }));
		vi.stubGlobal("fetch", fetchMock);

		const response = await useDummyJsonProductById("42");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ id: 42, title: "Widget" });
		expect(String(fetchMock.mock.calls[0][0])).toContain("/products/42");
	});

	it("returns a safe error response on failure", async () => {
		useInitDummyJson();
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ message: "nope" }, 404)));

		const response = await useDummyJsonProductById("999");

		expect(response.status).toBe(404);
		expect(((await response.json()) as { message: string }).message).toContain("HTTP Error");
	});
});

describe("bun/seed", () => {
	it("returns the seed data", () => {
		expect(useGetDummyJsonSeed()).toEqual(dummyJsonSeed);
		expect(dummyJsonSeed.products.length).toBeGreaterThan(0);
		expect(dummyJsonSeed.products[0]).toHaveProperty("title");
		expect(dummyJsonSeed.users[0]).toHaveProperty("username");
	});
});

describe("bun/routes", () => {
	it("builds the dummyjson route table", () => {
		const routes = useBuildDummyJsonRoutes();

		expect(routes).toHaveProperty("/api/status");
		expect(routes).toHaveProperty("/api/products");
		expect(routes).toHaveProperty("/api/products/:id");
		expect(routes).toHaveProperty("/api/products/search");
		expect(routes).toHaveProperty("/api/products/category/:category");
		expect(routes).toHaveProperty("/api/users/:id");
		expect(routes).toHaveProperty("/api/posts");
		expect(routes).toHaveProperty("/api/quotes/random");
		expect(routes).toHaveProperty("/api/seed");
		expect(routes).toHaveProperty("/api/*");
	});
});
