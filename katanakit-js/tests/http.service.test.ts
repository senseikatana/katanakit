import { afterEach, describe, expect, it, vi } from "vitest";

import {
	useBuildUrl,
	useFetch,
	useGetApis,
	useInit,
	useInitApis,
} from "@/core/services/http.service";

describe("FetchApiManager", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});
	it("builds a URL with path params and query params", () => {
		useInitApis({
			pokeapi: {
				baseUri: "https://pokeapi.co/api/v2",
				endpoints: { pokemonById: "/pokemon/:id/" },
			},
		});

		const url = useBuildUrl("pokeapi", "pokemonById", {
			params: { id: "pikachu" },
			query: { limit: 20 },
		});

		expect(url).toBe("https://pokeapi.co/api/v2/pokemon/pikachu/?limit=20");
	});

	it("encodes path params safely", () => {
		useInit({
			api: {
				baseUri: "https://example.com",
				endpoints: { user: "/users/:name" },
			},
		});

		const url = useBuildUrl("api", "user", { params: { name: "john doe/2024" } });

		expect(url).toBe("https://example.com/users/john%20doe%2F2024");
	});

	it("registers apis and exposes a shallow copy", () => {
		useInitApis({ sample: { baseUri: "https://sample.com", endpoints: { all: "/all" } } });
		const apis = useGetApis();
		expect(apis.sample).toBeDefined();
		apis.sample = { baseUri: "https://mutated.com", endpoints: {} };
		expect(useGetApis().sample?.baseUri).toBe("https://sample.com");
	});

	it("returns a config error (not network) for an unknown api", async () => {
		const result = await useFetch("unknown-api-xyz", "anything");
		expect(result.ok).toBe(false);
		expect(result.error?.message).toMatch(/Config Error/);
		expect(result.status).toBe(0);
	});

	it("returns a safe result on a successful JSON response", async () => {
		useInitApis({ okApi: { baseUri: "https://example.com", endpoints: { list: "/list" } } });

		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ items: [1, 2, 3] }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await useFetch<{ items: number[] }>("okApi", "list");
		expect(result.ok).toBe(true);
		expect(result.data?.items).toEqual([1, 2, 3]);

		vi.unstubAllGlobals();
	});

	it("returns a safe error result on a 4xx response with non-JSON body", async () => {
		useInitApis({ failApi: { baseUri: "https://example.com", endpoints: { missing: "/missing" } } });

		const fetchMock = vi.fn().mockResolvedValue(
			new Response("Not Found plain text", {
				status: 404,
				statusText: "Not Found",
				headers: { "Content-Type": "text/plain" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await useFetch("failApi", "missing");
		expect(result.ok).toBe(false);
		expect(result.error?.status).toBe(404);
		expect(result.status).toBe(404);
		expect(result.error?.details).toBe("Not Found plain text");

		vi.unstubAllGlobals();
	});

	it("handles 204 No Content without failing JSON parse", async () => {
		useInitApis({ emptyApi: { baseUri: "https://example.com", endpoints: { noop: "/noop" } } });

		const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal("fetch", fetchMock);

		const result = await useFetch("emptyApi", "noop");
		expect(result.ok).toBe(true);
		expect(result.status).toBe(204);
		expect(result.data).toBeNull();

		vi.unstubAllGlobals();
	});

	it("posts FormData without forcing JSON Content-Type", async () => {
		const { usePost } = await import("@/core/services/http.service");
		useInitApis({ upload: { baseUri: "https://example.com", endpoints: { file: "/upload" } } });

		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const form = new FormData();
		form.append("file", "hello");
		await usePost("upload", "file", form);

		expect(fetchMock).toHaveBeenCalledOnce();
		const init = fetchMock.mock.calls[0][1] as RequestInit;
		expect(init.body).toBe(form);
		expect(init.headers).toBeUndefined();
	});

	it("patches JSON bodies with application/json", async () => {
		const { usePatch } = await import("@/core/services/http.service");
		useInitApis({ api: { baseUri: "https://example.com", endpoints: { item: "/item" } } });

		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		await usePatch("api", "item", { name: "x" });

		const init = fetchMock.mock.calls[0][1] as RequestInit;
		expect(init.method).toBe("PATCH");
		expect(init.body).toBe(JSON.stringify({ name: "x" }));
		expect(init.headers).toEqual({ "Content-Type": "application/json" });
	});
});
