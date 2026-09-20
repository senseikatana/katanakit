// @vitest-environment jsdom
import { createElement, type ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useMutation, useQuery } from "@/adapters/react/query.js";
import { QueryClient } from "@/core/services/query.service.js";
import type { FetchResult } from "@/types/index.js";

afterEach(cleanup);

const ok = <T>(data: T): FetchResult<T> => ({ data, error: null, url: "", status: 200, ok: true });
const fail = <T>(message: string, status = 500): FetchResult<T> => ({
	data: null,
	error: { message, status },
	url: "",
	status,
	ok: false,
});

function Pokemon({ client }: { client: QueryClient }): ReactNode {
	const { data, isLoading } = useQuery<{ name: string }>(
		{ queryKey: ["pokemon", 1], queryFn: async () => ok({ name: "bulbasaur" }) },
		client,
	);
	return createElement("div", { "data-testid": "name" }, isLoading ? "loading" : (data?.name ?? "none"));
}

function Missing({ client }: { client: QueryClient }): ReactNode {
	const { data, error } = useQuery<{ name: string }>(
		{
			queryKey: ["pokemon", "missing"],
			queryFn: async () => fail("Not found", 404),
			retry: 0,
		},
		client,
	);
	return createElement("div", { "data-testid": "error" }, error ? error.message : (data?.name ?? "none"));
}

function Create(): ReactNode {
	const { data, status, mutate } = useMutation<{ id: number; name: string }, string>({
		mutationFn: async (name) => ok({ id: 1, name }),
	});
	return createElement(
		"div",
		null,
		createElement("button", { onClick: () => mutate("pikachu") }, "create"),
		createElement("span", { "data-testid": "status" }, status),
		createElement("span", { "data-testid": "name" }, data?.name ?? "none"),
	);
}

describe("react/useQuery", () => {
	it("resolves data from a successful fetch", async () => {
		render(createElement(Pokemon, { client: new QueryClient() }));

		await waitFor(() => expect(screen.getByTestId("name").textContent).toBe("bulbasaur"));
	});

	it("sets the error state on failure", async () => {
		render(createElement(Missing, { client: new QueryClient() }));

		await waitFor(() => expect(screen.getByTestId("error").textContent).toBe("Not found"));
	});
});

describe("react/useMutation", () => {
	it("runs the mutation and sets success state", async () => {
		render(createElement(Create));
		fireEvent.click(screen.getByText("create"));

		await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("success"));
		expect(screen.getByTestId("name").textContent).toBe("pikachu");
	});
});
