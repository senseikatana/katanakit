import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "@/core/services/query.service.js";
import type { FetchResult } from "@/types/index.js";

function ok<T>(data: T): FetchResult<T> {
	return { data, error: null, url: "http://test", status: 200, ok: true };
}

function fail<T>(message: string): FetchResult<T> {
	return {
		data: null,
		error: { message, status: 500 },
		url: "http://test",
		status: 500,
		ok: false,
	};
}

describe("QueryClient", () => {
	it("fetchQuery returns data on success", async () => {
		const qc = new QueryClient();
		const data = await qc.fetchQuery({
			queryKey: ["test", 1],
			queryFn: () => Promise.resolve(ok("hello")),
		});
		expect(data).toBe("hello");
	});

	it("fetchQuery caches data and returns stale data on second call", async () => {
		const qc = new QueryClient();
		const fn = vi.fn(() => Promise.resolve(ok("cached")));

		const first = await qc.fetchQuery({ queryKey: ["cache"], queryFn: fn, staleTime: 60_000 });
		const second = await qc.fetchQuery({ queryKey: ["cache"], queryFn: fn, staleTime: 60_000 });

		expect(first).toBe("cached");
		expect(second).toBe("cached");
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("fetchQuery refetches when stale", async () => {
		const qc = new QueryClient();
		const fn = vi.fn(() => Promise.resolve(ok("fresh")));

		await qc.fetchQuery({ queryKey: ["stale"], queryFn: fn, staleTime: 0 });
		// Small delay to let the first fetch complete before the second call.
		await new Promise((r) => setTimeout(r, 5));
		await qc.fetchQuery({ queryKey: ["stale"], queryFn: fn, staleTime: 0 });

		expect(fn).toHaveBeenCalledTimes(2);
	});

	it("fetchQuery retries on failure", async () => {
		const qc = new QueryClient();
		let calls = 0;
		const fn = () => {
			calls++;
			if (calls < 3) return Promise.resolve(fail("oops"));
			return Promise.resolve(ok("recovered"));
		};

		const data = await qc.fetchQuery({
			queryKey: ["retry"],
			queryFn: fn,
			retry: 3,
			retryDelay: 10,
		});
		expect(data).toBe("recovered");
		expect(calls).toBe(3);
	});

	it("fetchQuery throws after all retries exhausted", async () => {
		const qc = new QueryClient();
		const fn = () => Promise.resolve(fail("permanent"));

		await expect(
			qc.fetchQuery({ queryKey: ["fail"], queryFn: fn, retry: 1, retryDelay: 10 }),
		).rejects.toMatchObject({ message: "permanent" });
	});

	it("deduplicates concurrent fetches for the same key", async () => {
		const qc = new QueryClient();
		let calls = 0;
		const fn = () => {
			calls++;
			return new Promise<FetchResult<number>>((r) => setTimeout(() => r(ok(calls)), 50));
		};

		const [a, b] = await Promise.all([
			qc.fetchQuery({ queryKey: ["dedup"], queryFn: fn }),
			qc.fetchQuery({ queryKey: ["dedup"], queryFn: fn }),
		]);

		expect(a).toBe(1);
		expect(b).toBe(1);
		expect(calls).toBe(1);
	});

	it("setQueryData updates cache directly", async () => {
		const qc = new QueryClient();
		await qc.fetchQuery({ queryKey: ["direct"], queryFn: () => Promise.resolve(ok(1)) });

		qc.setQueryData(["direct"], 42);
		expect(qc.getQueryData(["direct"])).toBe(42);
	});

	it("setQueryData accepts updater function", async () => {
		const qc = new QueryClient();
		await qc.fetchQuery({ queryKey: ["fn"], queryFn: () => Promise.resolve(ok(10)) });

		qc.setQueryData(["fn"], (old) => (old ?? 0) + 5);
		expect(qc.getQueryData(["fn"])).toBe(15);
	});

	it("removeQueries clears a specific query", async () => {
		const qc = new QueryClient();
		await qc.fetchQuery({ queryKey: ["rm"], queryFn: () => Promise.resolve(ok("gone")) });

		qc.removeQueries(["rm"]);
		expect(qc.getQueryData(["rm"])).toBeUndefined();
	});

	it("clear removes all queries", async () => {
		const qc = new QueryClient();
		await qc.fetchQuery({ queryKey: ["a"], queryFn: () => Promise.resolve(ok(1)) });
		await qc.fetchQuery({ queryKey: ["b"], queryFn: () => Promise.resolve(ok(2)) });

		qc.clear();
		expect(qc.getQueryData(["a"])).toBeUndefined();
		expect(qc.getQueryData(["b"])).toBeUndefined();
	});

	it("subscribe receives state updates", async () => {
		const qc = new QueryClient();
		const states: string[] = [];

		qc.subscribe(["sub"], (state) => {
			states.push(state.status);
		});

		await qc.fetchQuery({ queryKey: ["sub"], queryFn: () => Promise.resolve(ok("done")) });

		expect(states).toContain("loading");
		expect(states).toContain("success");
	});

	it("getQueryData returns undefined for missing key", () => {
		const qc = new QueryClient();
		expect(qc.getQueryData(["missing"])).toBeUndefined();
	});

	it("prefetchQuery silently ignores errors", async () => {
		const qc = new QueryClient();
		await qc.prefetchQuery({
			queryKey: ["prefetch-fail"],
			queryFn: () => Promise.resolve(fail("nope")),
			retry: 0,
		});
		expect(qc.getQueryData(["prefetch-fail"])).toBeUndefined();
	});
});
