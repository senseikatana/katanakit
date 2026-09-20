import { get, writable } from "svelte/store";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRequest } from "@/adapters/svelte/fetch.js";
import { useWatch } from "@/adapters/svelte/watch.js";
import { useInit } from "@/core/services/http.service.js";

afterEach(() => {
	vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("svelte/useRequest", () => {
	it("resolves data into a store on success", async () => {
		useInit({ api: { baseUri: "https://example.com", endpoints: { list: "/list" } } });
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ name: "pikachu" })));

		const { data } = useRequest<{ name: string }>("api", "list");

		await vi.waitFor(() => expect(get(data)).toEqual({ name: "pikachu" }));
	});
});

describe("svelte/useWatch", () => {
	it("invokes the callback on change with previous value", () => {
		const captured: Array<[string, string | undefined]> = [];
		const store = writable("a");

		useWatch(store, (next, prev) => captured.push([next, prev]));
		expect(captured).toEqual([["a", undefined]]);

		store.set("b");
		expect(captured).toEqual([["a", undefined], ["b", "a"]]);
	});
});
