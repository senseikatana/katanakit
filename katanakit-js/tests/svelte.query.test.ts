import { get } from "svelte/store";
import { describe, expect, it, vi } from "vitest";

import { useMutation, useQuery } from "@/adapters/svelte/query.js";
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

describe("svelte/useQuery", () => {
	it("resolves data from a successful fetch", async () => {
		const client = new QueryClient();
		const q = useQuery<{ name: string }>(
			{ queryKey: ["pokemon", 1], queryFn: async () => ok({ name: "bulbasaur" }) },
			client,
		);

		await vi.waitFor(() => expect(get(q.data)).toEqual({ name: "bulbasaur" }));
		expect(get(q.isSuccess)).toBe(true);
	});

	it("sets the error store on failure", async () => {
		const client = new QueryClient();
		const q = useQuery<{ name: string }>(
			{
				queryKey: ["pokemon", "missing"],
				queryFn: async () => fail("Not found", 404),
				retry: 0,
			},
			client,
		);

		await vi.waitFor(() => expect(get(q.error)?.message).toBe("Not found"));
	});
});

describe("svelte/useMutation", () => {
	it("runs the mutation and sets success state", async () => {
		const m = useMutation<{ id: number; name: string }, string>({
			mutationFn: async (name) => ok({ id: 1, name }),
		});

		await m.mutate("pikachu");

		expect(get(m.data)).toEqual({ id: 1, name: "pikachu" });
		expect(get(m.status)).toBe("success");
	});
});
