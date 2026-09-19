import type { CurrencyFormatOptions, Locale } from "../../types/index.js";

/** International statute mile in kilometers (shared by both directions). */
const KM_PER_MILE = 1.60934;
const KG_PER_POUND = 0.453592;
const CM_PER_INCH = 2.54;

/**
 * Pure number formatter over `Intl.NumberFormat`.
 * Stateless — safe to call from any environment.
 *
 * @param value - The number to format.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Maximum and minimum fraction digits. Defaults to `2`.
 * @returns The formatted number string.
 *
 * @example
 * ```ts
 * import { useFormatNumber } from "katanakit-js";
 *
 * useFormatNumber(1234.5, "en", 2); // "1,234.50"
 * useFormatNumber(1234.5, "de", 2); // "1.234,50"
 * ```
 */
export function useFormatNumber(value: number, locale: Locale = "en", digits = 2): string {
	return new Intl.NumberFormat(locale, {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits,
	}).format(value);
}

/**
 * Pure: locale-aware upper case (trims whitespace).
 *
 * @param text - The string to transform.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @returns The upper-cased, trimmed string.
 *
 * @example
 * ```ts
 * import { useUpperCase } from "katanakit-js";
 *
 * useUpperCase("hello"); // "HELLO"
 * useUpperCase("straße", "de"); // "STRASSE"
 * ```
 */
export function useUpperCase(text: string, locale: Locale = "en"): string {
	return text.toLocaleUpperCase(locale).trim();
}

/**
 * Pure: locale-aware lower case (trims whitespace).
 *
 * @param text - The string to transform.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @returns The lower-cased, trimmed string.
 *
 * @example
 * ```ts
 * import { useLowerCase } from "katanakit-js";
 *
 * useLowerCase("HELLO"); // "hello"
 * ```
 */
export function useLowerCase(text: string, locale: Locale = "en"): string {
	return text.toLocaleLowerCase(locale).trim();
}

/**
 * Pure: capitalizes the first character; leaves the rest unchanged.
 *
 * @param text - The string to capitalize.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @returns The string with its first character upper-cased.
 *
 * @example
 * ```ts
 * import { useCapitalize } from "katanakit-js";
 *
 * useCapitalize("hello world"); // "Hello world"
 * ```
 */
export function useCapitalize(text: string, locale: Locale = "en"): string {
	const trimmed = text.trim();
	if (!trimmed) return "";
	return trimmed.charAt(0).toLocaleUpperCase(locale) + trimmed.slice(1);
}

/**
 * Pure: formats an amount as currency.
 *
 * `taxes` accepts either a percentage (`21` → 21%) or a decimal fraction
 * (`0.21` → 21%). Values `> 1` are treated as percentages; values in `(0, 1]`
 * as fractions. Prefer an explicit fraction when you need a rate ≤ 1%.
 *
 * @param options - Currency formatting options.
 * @returns The formatted currency string.
 *
 * @example
 * ```ts
 * import { useFormatCurrency } from "katanakit-js";
 *
 * useFormatCurrency({ amount: 100, currency: "USD" }); // "$100.00"
 * useFormatCurrency({ amount: 100, taxes: 21 }); // "$121.00"
 * useFormatCurrency({ amount: 100, taxes: 0.21, locale: "es" }); // "121,00 €"
 * ```
 */
export function useFormatCurrency(options: CurrencyFormatOptions): string {
	const { amount, currency = "USD", taxes = 0, locale = "en" } = options;
	const taxRate = taxes > 1 ? taxes / 100 : taxes;
	const total = amount * (1 + taxRate);

	return new Intl.NumberFormat(locale, { style: "currency", currency }).format(total);
}

/**
 * Pure: pretty-print JSON (3-space indent).
 *
 * @param data - The value to serialize.
 * @returns The indented JSON string.
 *
 * @example
 * ```ts
 * import { useJsonStringify } from "katanakit-js";
 *
 * useJsonStringify({ a: 1 });
 * // '{\n   "a": 1\n}'
 * ```
 */
export function useJsonStringify(data: unknown): string {
	return JSON.stringify(data, null, 3);
}

/**
 * Pure: parse JSON (throws on invalid input — same as `JSON.parse`).
 *
 * @param json - The JSON string to parse.
 * @returns The parsed value typed as `T`.
 *
 * @example
 * ```ts
 * import { useJsonParse } from "katanakit-js";
 *
 * const obj = useJsonParse<{ a: number }>('{"a":1}');
 * // { a: 1 }
 * ```
 */
export function useJsonParse<T = unknown>(json: string): T {
	return JSON.parse(json) as T;
}

/**
 * Pure: °F → °C (formatted).
 *
 * @param fahrenheit - Temperature in Fahrenheit.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Fraction digits. Defaults to `2`.
 * @returns The formatted Celsius string.
 *
 * @example
 * ```ts
 * import { useToCelsius } from "katanakit-js";
 *
 * useToCelsius(212); // "100.00"
 * useToCelsius(32);  // "0.00"
 * ```
 */
export function useToCelsius(fahrenheit: number, locale: Locale = "en", digits = 2): string {
	return useFormatNumber((fahrenheit - 32) / 1.8, locale, digits);
}

/**
 * Pure: °C → °F (formatted).
 *
 * @param celsius - Temperature in Celsius.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Fraction digits. Defaults to `2`.
 * @returns The formatted Fahrenheit string.
 *
 * @example
 * ```ts
 * import { useToFahrenheit } from "katanakit-js";
 *
 * useToFahrenheit(100); // "212.00"
 * useToFahrenheit(0);   // "32.00"
 * ```
 */
export function useToFahrenheit(celsius: number, locale: Locale = "en", digits = 2): string {
	return useFormatNumber(celsius * 1.8 + 32, locale, digits);
}

/**
 * Pure: miles → kilometers (formatted). Round-trips with `useToMiles`.
 *
 * @param miles - Distance in miles.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Fraction digits. Defaults to `2`.
 * @returns The formatted kilometer string.
 *
 * @example
 * ```ts
 * import { useToKilometers } from "katanakit-js";
 *
 * useToKilometers(1); // "1.61"
 * ```
 */
export function useToKilometers(miles: number, locale: Locale = "en", digits = 2): string {
	return useFormatNumber(miles * KM_PER_MILE, locale, digits);
}

/**
 * Pure: kilometers → miles (formatted). Round-trips with `useToKilometers`.
 *
 * @param km - Distance in kilometers.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Fraction digits. Defaults to `2`.
 * @returns The formatted mile string.
 *
 * @example
 * ```ts
 * import { useToMiles } from "katanakit-js";
 *
 * useToMiles(1.60934); // "1.00"
 * ```
 */
export function useToMiles(km: number, locale: Locale = "en", digits = 2): string {
	return useFormatNumber(km / KM_PER_MILE, locale, digits);
}

/**
 * Pure: centimeters → inches (formatted).
 *
 * @param cm - Length in centimeters.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Fraction digits. Defaults to `2`.
 * @returns The formatted inch string.
 *
 * @example
 * ```ts
 * import { useToInches } from "katanakit-js";
 *
 * useToInches(2.54); // "1.00"
 * ```
 */
export function useToInches(cm: number, locale: Locale = "en", digits = 2): string {
	return useFormatNumber(cm / CM_PER_INCH, locale, digits);
}

/**
 * Pure: inches → centimeters (formatted).
 *
 * @param inches - Length in inches.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Fraction digits. Defaults to `2`.
 * @returns The formatted centimeter string.
 *
 * @example
 * ```ts
 * import { useToCm } from "katanakit-js";
 *
 * useToCm(1); // "2.54"
 * ```
 */
export function useToCm(inches: number, locale: Locale = "en", digits = 2): string {
	return useFormatNumber(inches * CM_PER_INCH, locale, digits);
}

/**
 * Pure: pounds → kilograms (formatted).
 *
 * @param pounds - Weight in pounds.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Fraction digits. Defaults to `2`.
 * @returns The formatted kilogram string.
 *
 * @example
 * ```ts
 * import { useToKilos } from "katanakit-js";
 *
 * useToKilos(1); // "0.45"
 * ```
 */
export function useToKilos(pounds: number, locale: Locale = "en", digits = 2): string {
	return useFormatNumber(pounds * KG_PER_POUND, locale, digits);
}

/**
 * Pure: kilograms → pounds (formatted).
 *
 * @param kilos - Weight in kilograms.
 * @param locale - BCP 47 locale tag. Defaults to `"en"`.
 * @param digits - Fraction digits. Defaults to `2`.
 * @returns The formatted pound string.
 *
 * @example
 * ```ts
 * import { useToPounds } from "katanakit-js";
 *
 * useToPounds(1); // "2.20"
 * ```
 */
export function useToPounds(kilos: number, locale: Locale = "en", digits = 2): string {
	return useFormatNumber(kilos / KG_PER_POUND, locale, digits);
}
