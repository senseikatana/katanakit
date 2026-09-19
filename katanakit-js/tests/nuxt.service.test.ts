import { describe, expect, it } from "vitest";

import { useEventResponse, useSafeResponse, useUnwrap } from "@/adapters/nuxt/nuxt.service";
import type { FetchResult } from "@/types";

function okResult<T>(data: T): FetchResult<T> {
	return { data, error: null, url: "https://example.com", status: 200, ok: true };
}

function errorResult<T>(status: number, message: string): FetchResult<T> {
	return {
		data: null,
		error: { message, status, details: null },
		url: "https://example.com",
		status,
		ok: false,
	};
}

describe("Nuxt adapter", () => {
	describe("useUnwrap", () => {
		it("returns data on success", () => {
			const result = okResult({ name: "Pikachu" });
			expect(useUnwrap(result)).toEqual({ name: "Pikachu" });
		});

		it("throws with status code on error", () => {
			const result = errorResult(404, "Not found");
			expect(() => useUnwrap(result)).toThrow("Not found");
			try {
				useUnwrap(result);
			} catch (error: unknown) {
				expect((error as { statusCode: number }).statusCode).toBe(404);
			}
		});

		it("includes context in error message", () => {
			const result = errorResult(500, "Server error");
			expect(() => useUnwrap(result, "Pokemon 42")).toThrow("Pokemon 42: Server error");
		});

		it("uses 500 as default status when status is 0", () => {
			const result = errorResult(0, "Network error");
			try {
				useUnwrap(result);
			} catch (error: unknown) {
				expect((error as { statusCode: number }).statusCode).toBe(500);
			}
		});
	});

	describe("useSafeResponse", () => {
		it("returns data with ok=true on success", () => {
			const result = okResult([1, 2, 3]);
			const response = useSafeResponse(result);
			expect(response.ok).toBe(true);
			expect(response.data).toEqual([1, 2, 3]);
			expect(response.error).toBeNull();
		});

		it("returns error with ok=false on failure", () => {
			const result = errorResult(400, "Bad request");
			const response = useSafeResponse(result);
			expect(response.ok).toBe(false);
			expect(response.data).toBeNull();
			expect(response.error?.message).toBe("Bad request");
			expect(response.error?.status).toBe(400);
		});
	});

	describe("useEventResponse", () => {
		it("sets status 200 and returns data on success", () => {
			const event = { node: { res: { statusCode: 0 } } };
			const result = okResult({ id: 1 });
			const response = useEventResponse(event, result);
			expect(event.node.res.statusCode).toBe(200);
			expect(response).toEqual({ id: 1 });
		});

		it("sets error status and returns error object on failure", () => {
			const event = { node: { res: { statusCode: 0 } } };
			const result = errorResult(422, "Validation failed");
			const response = useEventResponse(event, result);
			expect(event.node.res.statusCode).toBe(422);
			expect(response).toEqual({ error: "Validation failed", status: 422 });
		});
	});
});
