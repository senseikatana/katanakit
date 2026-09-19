import { afterEach, describe, expect, it } from "vitest";

import {
	type LogStrategy,
	useLogger,
	useSetLogLevel,
	useSetStrategy,
} from "@/core/services/logger.service";

describe("LoggerService", () => {
	afterEach(() => {
		useSetLogLevel("info");
	});

	it("logs message with level first", () => {
		const calls: Array<{ level: string; message: string; data?: unknown }> = [];
		const strategy: LogStrategy = {
			useOutput: (level, message, data) => calls.push({ level, message, data }),
		};

		useSetStrategy(strategy);
		useLogger("info", "hello", { id: 1 });

		expect(calls).toEqual([{ level: "info", message: "hello", data: { id: 1 } }]);
	});

	it("defaults to the log level when only a message is provided", () => {
		const calls: Array<{ level: string; message: string }> = [];
		const strategy: LogStrategy = {
			useOutput: (level, message) => calls.push({ level, message }),
		};

		useSetStrategy(strategy);
		useLogger("log", "plain message");

		expect(calls).toEqual([{ level: "log", message: "plain message" }]);
	});

	it("accepts level as the first argument", () => {
		const calls: Array<{ level: string; message: string }> = [];
		const strategy: LogStrategy = {
			useOutput: (level, message) => calls.push({ level, message }),
		};

		useSetStrategy(strategy);
		useLogger("warn", "Cache miss");

		expect(calls).toEqual([{ level: "warn", message: "Cache miss" }]);
	});

	it("logs error level messages", () => {
		const calls: Array<{ level: string; message: string }> = [];
		const strategy: LogStrategy = {
			useOutput: (level, message) => calls.push({ level, message }),
		};

		useSetStrategy(strategy);
		useLogger("error", "Something broke");

		expect(calls).toEqual([{ level: "error", message: "Something broke" }]);
	});

	it("logs non-string data with level", () => {
		const calls: Array<{ level: string; message: string; data?: unknown }> = [];
		const strategy: LogStrategy = {
			useOutput: (level, message, data) => calls.push({ level, message, data }),
		};

		useSetStrategy(strategy);
		useSetLogLevel("debug");
		useLogger("debug", "object data", { id: 42 });

		expect(calls).toEqual([{ level: "debug", message: "object data", data: { id: 42 } }]);
	});
});
