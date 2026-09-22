import { QueryClient } from "@tanstack/query-core";
import { describe, expect, it } from "vitest";

import { useInitQueryClient, useQueryClient, useSafeQueryFn } from "@/core/services/query.service";
import type { FetchResult } from "@/types/index";

describe("query.service", () => {
	it("returns a shared QueryClient singleton", () => {
		const a = useQueryClient();
		const b = useQueryClient();

		expect(a).toBe(b);
		expect(a).toBeInstanceOf(QueryClient);
	});

	it("replaces the singleton with useInitQueryClient", () => {
		const created = useInitQueryClient({ defaultOptions: { queries: { staleTime: 1234 } } });

		expect(useQueryClient()).toBe(created);
		expect(created.getDefaultOptions().queries?.staleTime).toBe(1234);
	});

	it("useSafeQueryFn unwraps a successful Safe Result", async () => {
		const queryFn = useSafeQueryFn(async () => {
			return { data: { id: 1 }, error: null, url: "", status: 200, ok: true } as FetchResult<{
				id: number;
			}>;
		});

		await expect(queryFn({} as never)).resolves.toEqual({ id: 1 });
	});

	it("useSafeQueryFn throws an Error carrying the status on failure", async () => {
		const queryFn = useSafeQueryFn(async () => {
			return {
				data: null,
				error: { message: "Not found", status: 404 },
				url: "",
				status: 404,
				ok: false,
			} as FetchResult<unknown>;
		});

		await expect(queryFn({} as never)).rejects.toMatchObject({
			message: "Not found",
			status: 404,
		});
	});

	it("useSafeQueryFn forwards the TanStack query context", async () => {
		const controller = new AbortController();
		const queryFn = useSafeQueryFn(async (context) => {
			expect(context.signal).toBe(controller.signal);
			return { data: "ok", error: null, url: "", status: 200, ok: true } as FetchResult<string>;
		});

		await expect(
			queryFn({ signal: controller.signal, queryKey: ["x"], meta: undefined } as never),
		).resolves.toBe("ok");
	});
});
