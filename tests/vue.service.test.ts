import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useKatanaFetch } from "@/adapters/vue/vue.service";
import { useInit } from "@/core/services/http.service";

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("Vue adapter — useKatanaFetch", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("resolves data into reactive state on success", async () => {
		useInit({ api: { baseUri: "https://example.com", endpoints: { list: "/list" } } });
		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ items: [1, 2, 3] }))),
		);

		const { data, error, loading, refetch } = useKatanaFetch<{ items: number[] }>("api", "list");

		await refetch();

		expect(loading.value).toBe(false);
		expect(error.value).toBeNull();
		expect(data.value).toEqual({ items: [1, 2, 3] });
	});

	it("captures the safe error on failure without throwing", async () => {
		useInit({ api: { baseUri: "https://example.com", endpoints: { missing: "/missing" } } });
		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({}, 404))),
		);

		const { data, error, loading, refetch } = useKatanaFetch("api", "missing");

		await refetch();

		expect(loading.value).toBe(false);
		expect(data.value).toBeNull();
		expect(error.value?.status).toBe(404);
	});

	it("refetches automatically when the reactive options ref changes", async () => {
		useInit({ api: { baseUri: "https://example.com", endpoints: { item: "/items/:id" } } });
		const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse({ id: 1 })));
		vi.stubGlobal("fetch", fetchMock);

		const options = ref({ params: { id: 1 } });
		useKatanaFetch<{ id: number }>("api", "item", options);

		// The composable fetches once on setup.
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

		options.value = { params: { id: 2 } };

		// Changing the reactive options triggers a second fetch via `watch`.
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
	});
});
