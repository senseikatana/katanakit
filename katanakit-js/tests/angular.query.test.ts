import { DestroyRef, Injector, runInInjectionContext } from "@angular/core";
import { QueryClient } from "@tanstack/query-core";
import { describe, expect, it, vi } from "vitest";

import { useMutation, useQuery } from "@/adapters/angular/query.js";

const injector = Injector.create({
	providers: [{ provide: DestroyRef, useValue: { onDestroy: () => {} } }],
});

describe("angular/useQuery", () => {
	it("resolves data and exposes TanStack flags", async () => {
		const client = new QueryClient();
		const query = runInInjectionContext(injector, () =>
			useQuery(
				{
					queryKey: ["pokemon", 1],
					queryFn: async () => ({ name: "bulbasaur" }),
					retry: false,
				},
				client,
			),
		);

		await vi.waitFor(() => expect(query.data()).toEqual({ name: "bulbasaur" }));
		expect(query.isPending()).toBe(false);
		expect(query.isSuccess()).toBe(true);
	});

	it("exposes the error state on failure", async () => {
		const client = new QueryClient();
		const query = runInInjectionContext(injector, () =>
			useQuery(
				{
					queryKey: ["pokemon", "missing"],
					queryFn: async (): Promise<{ name: string }> => {
						throw new Error("Not found");
					},
					retry: false,
				},
				client,
			),
		);

		await vi.waitFor(() => expect(query.error()?.message).toBe("Not found"));
		expect(query.isError()).toBe(true);
	});
});

describe("angular/useMutation", () => {
	it("runs the mutation and exposes TanStack flags", async () => {
		const client = new QueryClient();
		const mutation = runInInjectionContext(injector, () =>
			useMutation({ mutationFn: async (name: string) => ({ id: 1, name }) }, client),
		);

		await mutation.mutate("pikachu");

		expect(mutation.data()).toEqual({ id: 1, name: "pikachu" });
		expect(mutation.isSuccess()).toBe(true);
	});
});
