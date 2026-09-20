// @vitest-environment jsdom
import { createRoot } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { useMutation, useQuery } from "@/adapters/solid/query.js";
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

describe("solid/useQuery", () => {
	it("resolves data from a successful fetch", async () => {
		const client = new QueryClient();
		const queryFn = vi.fn(async () => ok({ name: "bulbasaur" }));

		const accessors: (() => { name: string } | null)[] = [];
		createRoot(() => {
			const q = useQuery<{ name: string }>({ queryKey: ["pokemon", 1], queryFn }, client);
			accessors.push(q.data);
		});

		await vi.waitFor(() => expect(accessors[0]()).toEqual({ name: "bulbasaur" }));
		expect(queryFn).toHaveBeenCalled();
	});

	it("sets the error signal on failure", async () => {
		const client = new QueryClient();
		const errorAccessors: (() => { message: string } | null)[] = [];

		createRoot(() => {
			const q = useQuery<{ name: string }>({
				queryKey: ["pokemon", "missing"],
				queryFn: async () => fail("Not found", 404),
				retry: 0,
			}, client);
			errorAccessors.push(q.error);
		});

		await vi.waitFor(() => expect(errorAccessors[0]()?.message).toBe("Not found"));
	});
});

describe("solid/useMutation", () => {
	it("runs the mutation and sets success state", async () => {
		const mutationFn = vi.fn(async (name: string) => ok({ id: 1, name }));

		const state: { data: (() => { id: number; name: string } | null)[]; status: (() => string)[] } = {
			data: [],
			status: [],
		};
		let mutate!: (name: string) => Promise<void>;

		createRoot(() => {
			const m = useMutation<{ id: number; name: string }, string>({ mutationFn });
			mutate = m.mutate;
			state.data.push(m.data);
			state.status.push(m.status);
		});

		await mutate("pikachu");

		expect(state.data[0]()).toEqual({ id: 1, name: "pikachu" });
		expect(state.status[0]()).toBe("success");
	});
});
