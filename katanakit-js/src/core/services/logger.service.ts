import type { LogLevel } from "../../types/index.js";

/**
 * Logs a message with optional data and level.
 *
 * Maps directly onto the native `console` methods (`log`, `warn`, `error`).
 *
 * @param message - The message to log.
 * @param data - Optional data to attach to the log.
 * @param level - The log level. Defaults to `"log"`.
 *
 * @example
 * ```ts
 * import { useLogger } from "katanakit-js";
 *
 * useLogger("Application started");
 * useLogger("Cache miss", undefined, "warn");
 * useLogger("Database timeout", { query: "SELECT 1" }, "error");
 * ```
 */
export function useLogger(message: string, data?: unknown, level: LogLevel = "log"): void {
	if (data !== undefined) {
		console[level](message, data);
		return;
	}
	console[level](message);
}

/**
 * Clears the console.
 *
 * @example
 * ```ts
 * import { useLoggerClear } from "katanakit-js";
 *
 * useLoggerClear();
 * ```
 */
export function useLoggerClear(): void {
	console.clear();
}

/**
 * Displays tabular data in the console.
 *
 * @param data - The data to display as a table.
 *
 * @example
 * ```ts
 * import { useLoggerTable } from "katanakit-js";
 *
 * useLoggerTable([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]);
 * ```
 */
export function useLoggerTable(data: unknown): void {
	console.table(data);
}
