import { DestroyRef, Injector, runInInjectionContext } from "@angular/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRequest } from "@/adapters/angular/fetch.js";
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

const injector = Injector.create({
	providers: [{ provide: DestroyRef, useValue: { onDestroy: () => {} } }],
});

describe("angular/useRequest", () => {
	it("resolves data into a signal on success", async () => {
		useInit({ api: { baseUri: "https://example.com", endpoints: { list: "/list" } } });
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ name: "pikachu" })));

		const { data } = runInInjectionContext(injector, () =>
			useRequest<{ name: string }>("api", "list"),
		);

		await vi.waitFor(() => expect(data()).toEqual({ name: "pikachu" }));
	});
});
