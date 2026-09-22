// @vitest-environment jsdom
import { type QueryObserverResult, QueryClient } from "@tanstack/query-core";
import { createRoot } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { useMutation, useQuery } from "@/adapters/solid/query.js";

describe("solid/useQuery", () => {
	it("resolves data and exposes TanStack flags", async () => {
		const client = new QueryClient();
		let query!: QueryObserverResult<{ name: string }, Error>;

		createRoot(() => {
			query = useQuery(
				{
					queryKey: ["pokemon", 1],
					queryFn: async () => ({ name: "bulbasaur" }),
					retry: false,
				},
				client,
			);
		});

		await vi.waitFor(() => expect(query.data).toEqual({ name: "bulbasaur" }));
		expect(query.isPending).toBe(false);
		expect(query.isSuccess).toBe(true);
	});

	it("exposes the error state on failure", async () => {
		const client = new QueryClient();
		let query!: QueryObserverResult<{ name: string }, Error>;

		createRoot(() => {
			query = useQuery(
				{
					queryKey: ["pokemon", "missing"],
					queryFn: async (): Promise<{ name: string }> => {
						throw new Error("Not found");
					},
					retry: false,
				},
				client,
			);
		});

		await vi.waitFor(() => expect(query.error?.message).toBe("Not found"));
		expect(query.isError).toBe(true);
	});
});

describe("solid/useMutation", () => {
	it("runs the mutation and exposes TanStack flags", async () => {
		const client = new QueryClient();
		let mutation!: ReturnType<typeof useMutation<{ id: number; name: string }, Error, string>>;

		createRoot(() => {
			mutation = useMutation({ mutationFn: async (name: string) => ({ id: 1, name }) }, client);
		});

		await mutation.mutate("pikachu");

		expect(mutation.data).toEqual({ id: 1, name: "pikachu" });
		expect(mutation.isSuccess).toBe(true);
	});
});
