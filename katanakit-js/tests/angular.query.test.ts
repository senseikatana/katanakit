import { DestroyRef, Injector, runInInjectionContext } from "@angular/core";
import { describe, expect, it, vi } from "vitest";

import { useMutation, useQuery } from "@/adapters/angular/query.js";
import { QueryClient } from "@/core/services/query.service.js";
import type { FetchResult } from "@/types/index.js";

const ok = <T>(data: T): FetchResult<T> => ({ data, error: null, url: "", status: 200, ok: true });
const fail = <T>(message: string, status = 500): FetchResult<T> => ({
	data: null,
	error: { message, status },
	url: "",
	status,
	ok: false,
});

const injector = Injector.create({
	providers: [{ provide: DestroyRef, useValue: { onDestroy: () => {} } }],
});

describe("angular/useQuery", () => {
	it("resolves data from a successful fetch", async () => {
		const client = new QueryClient();
		const q = runInInjectionContext(injector, () =>
			useQuery<{ name: string }>(
				{ queryKey: ["pokemon", 1], queryFn: async () => ok({ name: "bulbasaur" }) },
				client,
			),
		);

		await vi.waitFor(() => expect(q.data()).toEqual({ name: "bulbasaur" }));
		expect(q.isSuccess()).toBe(true);
	});

	it("sets the error signal on failure", async () => {
		const client = new QueryClient();
		const q = runInInjectionContext(injector, () =>
			useQuery<{ name: string }>(
				{
					queryKey: ["pokemon", "missing"],
					queryFn: async () => fail("Not found", 404),
					retry: 0,
				},
				client,
			),
		);

		await vi.waitFor(() => expect(q.error()?.message).toBe("Not found"));
	});
});

describe("angular/useMutation", () => {
	it("runs the mutation and sets success state", async () => {
		const m = runInInjectionContext(injector, () =>
			useMutation<{ id: number; name: string }, string>({
				mutationFn: async (name) => ok({ id: 1, name }),
			}),
		);

		await m.mutate("pikachu");

		expect(m.data()).toEqual({ id: 1, name: "pikachu" });
		expect(m.status()).toBe("success");
	});
});
