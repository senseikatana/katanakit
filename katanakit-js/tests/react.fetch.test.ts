// @vitest-environment jsdom
import { createElement, type ReactNode } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useRequest } from "@/adapters/react/fetch.js";
import { useWatch } from "@/adapters/react/watch.js";
import { useInit } from "@/core/services/http.service.js";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("react/useRequest", () => {
	it("resolves data into state on success", async () => {
		useInit({ api: { baseUri: "https://example.com", endpoints: { list: "/list" } } });
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ name: "pikachu" })));

		function Pokemon(): ReactNode {
			const { data, loading } = useRequest<{ name: string }>("api", "list");
			return createElement(
				"div",
				{ "data-testid": "name" },
				loading ? "loading" : (data?.name ?? "none"),
			);
		}

		render(createElement(Pokemon));

		await waitFor(() => expect(screen.getByTestId("name").textContent).toBe("pikachu"));
	});
});

describe("react/useWatch", () => {
	it("invokes the callback on mount and on change with previous value", async () => {
		const captured: Array<[string, string | undefined]> = [];

		function Comp({ value }: { value: string }): ReactNode {
			useWatch(
				() => value,
				(next, prev) => captured.push([next, prev]),
			);
			return null;
		}

		const { rerender } = render(createElement(Comp, { value: "a" }));
		await waitFor(() => expect(captured).toEqual([["a", undefined]]));

		rerender(createElement(Comp, { value: "b" }));
		await waitFor(() =>
			expect(captured).toEqual([
				["a", undefined],
				["b", "a"],
			]),
		);
	});
});
