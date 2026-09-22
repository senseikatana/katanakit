import {
	type MutationObserverResult,
	QueryClient,
	type QueryObserverResult,
} from "@tanstack/query-core";
import { get } from "svelte/store";
import { describe, expect, it, vi } from "vitest";

import { useMutation, useQuery } from "@/adapters/svelte/query.js";

/** Subscribes like a component's `$store` would, returning the latest value. */
function track<T>(store: { subscribe: (run: (value: T) => void) => () => void }): {
	current: () => T;
	stop: () => void;
} {
	let latest = get(store);
	const unsubscribe = store.subscribe((value) => {
		latest = value;
	});
	return { current: () => latest, stop: unsubscribe };
}

describe("svelte/useQuery", () => {
	it("resolves data and exposes TanStack flags", async () => {
		const client = new QueryClient();
		const query = useQuery(
			{
				queryKey: ["pokemon", 1],
				queryFn: async () => ({ name: "bulbasaur" }),
				retry: false,
			},
			client,
		);

		const state = track<QueryObserverResult<{ name: string }, Error>>(query);

		await vi.waitFor(() => expect(state.current().data).toEqual({ name: "bulbasaur" }));
		expect(state.current().isPending).toBe(false);
		expect(state.current().isSuccess).toBe(true);
		state.stop();
	});

	it("exposes the error state on failure", async () => {
		const client = new QueryClient();
		const query = useQuery(
			{
				queryKey: ["pokemon", "missing"],
				queryFn: async (): Promise<{ name: string }> => {
					throw new Error("Not found");
				},
				retry: false,
			},
			client,
		);

		const state = track<QueryObserverResult<{ name: string }, Error>>(query);

		await vi.waitFor(() => expect(state.current().error?.message).toBe("Not found"));
		expect(state.current().isError).toBe(true);
		state.stop();
	});
});

describe("svelte/useMutation", () => {
	it("runs the mutation and exposes TanStack flags", async () => {
		const client = new QueryClient();
		const mutation = useMutation({ mutationFn: async (name: string) => ({ id: 1, name }) }, client);

		const state =
			track<MutationObserverResult<{ id: number; name: string }, Error, string>>(mutation);

		await get(mutation).mutate("pikachu");

		expect(state.current().data).toEqual({ id: 1, name: "pikachu" });
		expect(state.current().isSuccess).toBe(true);
		state.stop();
	});
});
