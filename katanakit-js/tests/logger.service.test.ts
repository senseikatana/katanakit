import { afterEach, describe, expect, it, vi } from "vitest";

import { useLogger, useLoggerClear, useLoggerTable } from "@/core/services/logger.service";

describe("LoggerService", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("logs a message at the default log level", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => {});

		useLogger("plain message");

		expect(spy).toHaveBeenCalledWith("plain message");
	});

	it("logs a message with data", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => {});

		useLogger("hello", { id: 1 });

		expect(spy).toHaveBeenCalledWith("hello", { id: 1 });
	});

	it("logs at warn level", () => {
		const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

		useLogger("Cache miss", undefined, "warn");

		expect(spy).toHaveBeenCalledWith("Cache miss");
	});

	it("logs at error level with data", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});

		useLogger("Something broke", { code: 500 }, "error");

		expect(spy).toHaveBeenCalledWith("Something broke", { code: 500 });
	});

	it("clears and tables via the native console", () => {
		const clearSpy = vi.spyOn(console, "clear").mockImplementation(() => {});
		const tableSpy = vi.spyOn(console, "table").mockImplementation(() => {});

		useLoggerClear();
		useLoggerTable([{ id: 1 }]);

		expect(clearSpy).toHaveBeenCalled();
		expect(tableSpy).toHaveBeenCalledWith([{ id: 1 }]);
	});
});
