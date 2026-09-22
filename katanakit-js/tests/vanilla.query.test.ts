import { QueryClient } from "@tanstack/query-core";
import { describe, expect, it, vi } from "vitest";

import { useMutation, useQuery } from "@/adapters/vanilla/query.js";

describe("vanilla/useQuery", () => {
	it("resolves data through the raw observer", async () => {
		const client = new QueryClient();
		const observer = useQuery(
			{
				queryKey: ["pokemon", 1],
				queryFn: async () => ({ name: "bulbasaur" }),
				retry: false,
			},
			client,
		);

		const seen: string[] = [];
		const unsubscribe = observer.subscribe((result) => seen.push(result.status));

		await vi.waitFor(() => expect(observer.getCurrentResult().data).toEqual({ name: "bulbasaur" }));
		expect(observer.getCurrentResult().isSuccess).toBe(true);
		expect(seen).toContain("success");

		unsubscribe();
		observer.destroy();
	});

	it("exposes the error state on failure", async () => {
		const client = new QueryClient();
		const observer = useQuery(
			{
				queryKey: ["pokemon", "missing"],
				queryFn: async (): Promise<{ name: string }> => {
					throw new Error("Not found");
				},
				retry: false,
			},
			client,
		);

		const unsubscribe = observer.subscribe(() => {});

		await vi.waitFor(() => expect(observer.getCurrentResult().error?.message).toBe("Not found"));
		expect(observer.getCurrentResult().isError).toBe(true);

		unsubscribe();
		observer.destroy();
	});

	it("switches query when setOptions receives a new key", async () => {
		const client = new QueryClient();
		const observer = useQuery(
			{
				queryKey: ["pokemon", 1],
				queryFn: async () => ({ name: "bulbasaur" }),
				retry: false,
			},
			client,
		);

		const unsubscribe = observer.subscribe(() => {});
		await vi.waitFor(() => expect(observer.getCurrentResult().data).toEqual({ name: "bulbasaur" }));

		observer.setOptions(
			client.defaultQueryOptions({
				queryKey: ["pokemon", 2],
				queryFn: async () => ({ name: "ivysaur" }),
				retry: false,
			}),
		);

		await vi.waitFor(() => expect(observer.getCurrentResult().data).toEqual({ name: "ivysaur" }));

		unsubscribe();
		observer.destroy();
	});
});

describe("vanilla/useMutation", () => {
	it("mutates and reports the state", async () => {
		const client = new QueryClient();
		const observer = useMutation({ mutationFn: async (name: string) => ({ id: 1, name }) }, client);

		const data = await observer.mutate("pikachu");

		expect(data).toEqual({ id: 1, name: "pikachu" });
		expect(observer.getCurrentResult().isSuccess).toBe(true);
		expect(observer.getCurrentResult().data).toEqual({ id: 1, name: "pikachu" });
	});
});
