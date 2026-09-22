import { QueryClient } from "@tanstack/query-core";
import { effectScope } from "vue";
import { describe, expect, it, vi } from "vitest";

import { useMutation, useQuery } from "@/adapters/vue/query.js";

describe("vue/useQuery", () => {
	it("resolves data and exposes TanStack flags", async () => {
		const client = new QueryClient();
		const scope = effectScope();
		const query = scope.run(() =>
			useQuery(
				{
					queryKey: ["pokemon", 1],
					queryFn: async () => ({ name: "bulbasaur" }),
					retry: false,
				},
				client,
			),
		);

		await vi.waitFor(() => expect(query?.data).toEqual({ name: "bulbasaur" }));
		expect(query?.isPending).toBe(false);
		expect(query?.isSuccess).toBe(true);
		scope.stop();
	});

	it("exposes the error state on failure", async () => {
		const client = new QueryClient();
		const scope = effectScope();
		const query = scope.run(() =>
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

		await vi.waitFor(() => expect(query?.error?.message).toBe("Not found"));
		expect(query?.isError).toBe(true);
		scope.stop();
	});
});

describe("vue/useMutation", () => {
	it("runs the mutation and exposes TanStack flags", async () => {
		const client = new QueryClient();
		const scope = effectScope();
		const mutation = scope.run(() =>
			useMutation({ mutationFn: async (name: string) => ({ id: 1, name }) }, client),
		);

		await mutation?.mutate("pikachu");

		expect(mutation?.data).toEqual({ id: 1, name: "pikachu" });
		expect(mutation?.isSuccess).toBe(true);
		scope.stop();
	});
});
