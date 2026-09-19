import { Temporal } from "@js-temporal/polyfill";

import type { Locale, TemporalInput } from "../../types/index.js";

/**
 * Internal helper that adapts flexible inputs into a `PlainDate`.
 *
 * @param date - An ISO date string or a `Temporal.PlainDate`.
 * @returns A `Temporal.PlainDate`.
 */
function toPlainDate(date: string | Temporal.PlainDate): Temporal.PlainDate {
	return typeof date === "string" ? Temporal.PlainDate.from(date) : date;
}

/**
 * Returns a human-readable diff between two dates as years, months, and days.
 *
 * @param start - Start date (ISO string or `PlainDate`).
 * @param end - End date (ISO string or `PlainDate`).
 * @returns A formatted string, e.g. `"2 years, 3 months and 15 days"`.
 *
 * @example
 * ```ts
 * useDiff("2020-01-01", "2022-04-16");
 * // "2 years, 3 months and 15 days"
 * ```
 */
export function useDiff(
	start: string | Temporal.PlainDate,
	end: string | Temporal.PlainDate,
): string {
	const startDate = toPlainDate(start);
	const endDate = toPlainDate(end);
	const duration = startDate.until(endDate, { largestUnit: "year" });

	return `${duration.years} years, ${duration.months} months and ${duration.days} days`;
}

/**
 * Formats a date input into a localised string using `Intl.DateTimeFormat`.
 *
 * Accepts epoch milliseconds, ISO strings, native `Date` objects,
 * `Temporal.Instant`, or any `Temporal` date/time type.
 *
 * @param dateInput - The value to format.
 * @param locale - BCP 47 locale tag (defaults to `"en"`).
 * @param options - `Intl.DateTimeFormatOptions` (defaults to `{}`).
 * @returns The formatted date string.
 * @throws {Error} If the input cannot be parsed as a date.
 *
 * @example
 * ```ts
 * useFormat("2024-06-15");                        // "6/15/2024" (en-US)
 * useFormat(Date.now(), "es", { dateStyle: "full" }); // "sábado, 15 de junio de 2024"
 * ```
 */
export function useFormat(
	dateInput: TemporalInput,
	locale: Locale = "en",
	options: Intl.DateTimeFormatOptions = {},
): string {
	let date: Temporal.PlainDate | Temporal.PlainDateTime | Temporal.ZonedDateTime;

	try {
		if (typeof dateInput === "number") {
			date = Temporal.Instant.fromEpochMilliseconds(dateInput).toZonedDateTimeISO(
				Temporal.Now.timeZoneId(),
			);
		} else if (typeof dateInput === "string") {
			try {
				date = Temporal.PlainDate.from(dateInput);
			} catch {
				date = Temporal.PlainDateTime.from(dateInput);
			}
		} else if (dateInput instanceof Date) {
			date = Temporal.Instant.fromEpochMilliseconds(dateInput.getTime()).toZonedDateTimeISO(
				Temporal.Now.timeZoneId(),
			);
		} else if (dateInput instanceof Temporal.Instant) {
			date = dateInput.toZonedDateTimeISO(Temporal.Now.timeZoneId());
		} else {
			date = dateInput;
		}

		return date.toLocaleString(locale, options);
	} catch (error) {
		console.error("Invalid date input:", error);
		throw new Error(`Invalid date input: ${dateInput}`);
	}
}

/**
 * Returns today's date as an ISO date string.
 *
 * @returns The current date in `YYYY-MM-DD` format.
 *
 * @example
 * ```ts
 * useNow(); // "2024-06-15"
 * ```
 */
export function useNow(): string {
	return Temporal.Now.plainDateISO().toString();
}

/**
 * Returns the current date and time as an ISO string (no timezone offset).
 *
 * @returns The current date-time in `YYYY-MM-DDTHH:MM:SS` format.
 *
 * @example
 * ```ts
 * useNowDateTime(); // "2024-06-15T14:30:00"
 * ```
 */
export function useNowDateTime(): string {
	return Temporal.Now.plainDateTimeISO().toString();
}

/**
 * Adds a number of days to a date.
 *
 * @param date - Base date (ISO string or `PlainDate`).
 * @param days - Number of days to add (can be negative).
 * @returns The resulting date as an ISO string.
 *
 * @example
 * ```ts
 * useAddDays("2024-01-01", 10); // "2024-01-11"
 * ```
 */
export function useAddDays(date: string | Temporal.PlainDate, days: number): string {
	return toPlainDate(date).add({ days }).toString();
}

/**
 * Subtracts a number of days from a date.
 *
 * @param date - Base date (ISO string or `PlainDate`).
 * @param days - Number of days to subtract.
 * @returns The resulting date as an ISO string.
 *
 * @example
 * ```ts
 * useSubtractDays("2024-01-11", 10); // "2024-01-01"
 * ```
 */
export function useSubtractDays(date: string | Temporal.PlainDate, days: number): string {
	return toPlainDate(date).subtract({ days }).toString();
}

/**
 * Checks whether two dates are equal.
 *
 * @param date1 - First date (ISO string or `PlainDate`).
 * @param date2 - Second date (ISO string or `PlainDate`).
 * @returns `true` if the dates represent the same day.
 *
 * @example
 * ```ts
 * useIsEqual("2024-06-15", "2024-06-15"); // true
 * useIsEqual("2024-06-15", "2024-06-16"); // false
 * ```
 */
export function useIsEqual(
	date1: string | Temporal.PlainDate,
	date2: string | Temporal.PlainDate,
): boolean {
	return Temporal.PlainDate.compare(toPlainDate(date1), toPlainDate(date2)) === 0;
}

/**
 * Checks whether `date1` is before `date2`.
 *
 * @param date1 - First date (ISO string or `PlainDate`).
 * @param date2 - Second date (ISO string or `PlainDate`).
 * @returns `true` if `date1` is strictly before `date2`.
 *
 * @example
 * ```ts
 * useIsBefore("2024-01-01", "2024-06-15"); // true
 * useIsBefore("2024-06-15", "2024-06-15"); // false
 * ```
 */
export function useIsBefore(
	date1: string | Temporal.PlainDate,
	date2: string | Temporal.PlainDate,
): boolean {
	return Temporal.PlainDate.compare(toPlainDate(date1), toPlainDate(date2)) < 0;
}

/**
 * Checks whether `date1` is after `date2`.
 *
 * @param date1 - First date (ISO string or `PlainDate`).
 * @param date2 - Second date (ISO string or `PlainDate`).
 * @returns `true` if `date1` is strictly after `date2`.
 *
 * @example
 * ```ts
 * useIsAfter("2024-06-15", "2024-01-01"); // true
 * useIsAfter("2024-06-15", "2024-06-15"); // false
 * ```
 */
export function useIsAfter(
	date1: string | Temporal.PlainDate,
	date2: string | Temporal.PlainDate,
): boolean {
	return Temporal.PlainDate.compare(toPlainDate(date1), toPlainDate(date2)) > 0;
}

/**
 * Returns the first day of the month for a given date.
 *
 * @param date - Base date (defaults to today).
 * @returns The first day of the month as an ISO string.
 *
 * @example
 * ```ts
 * useFirstDayOfMonth("2024-06-15"); // "2024-06-01"
 * ```
 */
export function useFirstDayOfMonth(
	date: string | Temporal.PlainDate = Temporal.Now.plainDateISO(),
): string {
	return toPlainDate(date).with({ day: 1 }).toString();
}

/**
 * Returns the last day of the month for a given date.
 *
 * @param date - Base date (defaults to today).
 * @returns The last day of the month as an ISO string.
 *
 * @example
 * ```ts
 * useLastDayOfMonth("2024-02-10"); // "2024-02-29" (leap year)
 * useLastDayOfMonth("2024-06-15"); // "2024-06-30"
 * ```
 */
export function useLastDayOfMonth(
	date: string | Temporal.PlainDate = Temporal.Now.plainDateISO(),
): string {
	return toPlainDate(date).add({ months: 1 }).with({ day: 1 }).subtract({ days: 1 }).toString();
}
