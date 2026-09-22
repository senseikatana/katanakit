// @vitest-environment jsdom
import { QueryClient } from "@tanstack/query-core";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { useMutation, useQuery } from "@/adapters/react/query.js";
import { useSafeQueryFn } from "@/core/services/query.service.js";
import type { FetchResult } from "@/types/index.js";

afterEach(cleanup);

function Pokemon({ client }: { client: QueryClient }): ReactNode {
	const { data, isPending, isSuccess } = useQuery(
		{
			queryKey: ["pokemon", 1],
			queryFn: async () => ({ name: "bulbasaur" }),
			retry: false,
		},
		client,
	);

	const label = isPending ? "pending" : `success:${isSuccess}:${data?.name}`;
	return createElement("div", { "data-testid": "state" }, label);
}

function Missing({ client }: { client: QueryClient }): ReactNode {
	const { error, isError } = useQuery(
		{
			queryKey: ["pokemon", "missing"],
			queryFn: async (): Promise<{ name: string }> => {
				throw new Error("Not found");
			},
			retry: false,
		},
		client,
	);

	return createElement(
		"div",
		{ "data-testid": "state" },
		isError ? `error:${error?.message}` : "pending",
	);
}

function SafeResult({ client }: { client: QueryClient }): ReactNode {
	const { data, isSuccess } = useQuery(
		{
			queryKey: ["safe"],
			queryFn: useSafeQueryFn(
				async () =>
					({
						data: { name: "pikachu" },
						error: null,
						url: "",
						status: 200,
						ok: true,
					}) as FetchResult<{ name: string }>,
			),
			retry: false,
		},
		client,
	);

	return createElement(
		"div",
		{ "data-testid": "state" },
		isSuccess ? `ok:${data?.name}` : "pending",
	);
}

function Create({ client }: { client: QueryClient }): ReactNode {
	const { data, isPending, isSuccess, mutate } = useMutation(
		{ mutationFn: async (name: string) => ({ id: 1, name }) },
		client,
	);

	return createElement(
		"div",
		null,
		createElement("button", { onClick: () => void mutate("pikachu") }, "create"),
		createElement(
			"span",
			{ "data-testid": "state" },
			`${isPending}:${isSuccess}:${data?.name ?? "none"}`,
		),
	);
}

describe("react/useQuery", () => {
	it("resolves data and exposes TanStack flags", async () => {
		render(createElement(Pokemon, { client: new QueryClient() }));

		await waitFor(() =>
			expect(screen.getByTestId("state").textContent).toBe("success:true:bulbasaur"),
		);
	});

	it("exposes the error state on failure", async () => {
		render(createElement(Missing, { client: new QueryClient() }));

		await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("error:Not found"));
	});

	it("bridges a Safe Result through useSafeQueryFn", async () => {
		render(createElement(SafeResult, { client: new QueryClient() }));

		await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("ok:pikachu"));
	});
});

describe("react/useMutation", () => {
	it("runs the mutation and exposes TanStack flags", async () => {
		render(createElement(Create, { client: new QueryClient() }));

		fireEvent.click(screen.getByText("create"));

		await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("false:true:pikachu"));
	});
});
