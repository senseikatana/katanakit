// @vitest-environment jsdom
import { createRoot, createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRequest } from "@/adapters/solid/fetch.js";
import { useWatch } from "@/adapters/solid/watch.js";
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

describe("solid/useRequest", () => {
	it("resolves data into a signal on success", async () => {
		useInit({ api: { baseUri: "https://example.com", endpoints: { list: "/list" } } });
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ name: "pikachu" })));

		const accessors: (() => { name: string } | null)[] = [];
		createRoot(() => {
			const { data } = useRequest<{ name: string }>("api", "list");
			accessors.push(data);
		});

		await vi.waitFor(() => expect(accessors[0]()).toEqual({ name: "pikachu" }));
	});
});

describe("solid/useWatch", () => {
	it("invokes the callback on change with previous value", async () => {
		const captured: Array<[string, string | undefined]> = [];

		createRoot(() => {
			const [value, setValue] = createSignal("a");
			useWatch(
				() => value(),
				(next, prev) => captured.push([next, prev]),
			);
			// Defer so the effect's initial run observes "a" before the change.
			queueMicrotask(() => setValue("b"));
		});

		await vi.waitFor(() => expect(captured).toEqual([["a", undefined], ["b", "a"]]));
	});
});
