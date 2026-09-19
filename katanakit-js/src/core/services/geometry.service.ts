import type { GeometryFormatOptions } from "../../types/index.js";

/**
 * Pure helper: formats a numeric geometry result via `Intl`.
 * Stateless — input → formatted string only.
 *
 * @param value - The numeric value to format.
 * @param options - Formatting options (locale, digits, unit).
 * @returns The formatted string, optionally with a unit suffix.
 */
function formatGeometry(value: number, options: GeometryFormatOptions = {}): string {
	const { locale = "en", digits = 2, unit } = options;
	const formatted = new Intl.NumberFormat(locale, {
		maximumFractionDigits: digits,
		minimumFractionDigits: digits,
	}).format(value);

	return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Pure area calculations for geometric shapes.
 * All functions are stateless — input → formatted string only.
 */
const area = {
	/**
	 * Calculates the area of a rectangle.
	 *
	 * @param width - The width of the rectangle.
	 * @param height - The height of the rectangle.
	 * @param options - Optional formatting options.
	 * @returns The formatted area string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.area.useRectangle(5, 10); // "50.00"
	 * GeometryUtils.area.useRectangle(5, 10, { unit: "m²" }); // "50.00 m²"
	 * ```
	 */
	useRectangle(width: number, height: number, options?: GeometryFormatOptions): string {
		return formatGeometry(width * height, options);
	},

	/**
	 * Calculates the area of a square.
	 *
	 * @param side - The side length of the square.
	 * @param options - Optional formatting options.
	 * @returns The formatted area string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.area.useSquare(4); // "16.00"
	 * ```
	 */
	useSquare(side: number, options?: GeometryFormatOptions): string {
		return formatGeometry(side ** 2, options);
	},

	/**
	 * Calculates the area of a triangle.
	 *
	 * @param base - The base length of the triangle.
	 * @param height - The height of the triangle.
	 * @param options - Optional formatting options.
	 * @returns The formatted area string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.area.useTriangle(6, 4); // "12.00"
	 * ```
	 */
	useTriangle(base: number, height: number, options?: GeometryFormatOptions): string {
		return formatGeometry((base * height) / 2, options);
	},

	/**
	 * Calculates the area of a circle.
	 *
	 * @param radius - The radius of the circle.
	 * @param options - Optional formatting options.
	 * @returns The formatted area string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.area.useCircle(5); // "78.54"
	 * ```
	 */
	useCircle(radius: number, options?: GeometryFormatOptions): string {
		return formatGeometry(Math.PI * radius ** 2, options);
	},

	/**
	 * Calculates the area of a trapezoid.
	 *
	 * @param parallelSide1 - The length of the first parallel side.
	 * @param parallelSide2 - The length of the second parallel side.
	 * @param height - The height between parallel sides.
	 * @param options - Optional formatting options.
	 * @returns The formatted area string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.area.useTrapezoid(3, 5, 4); // "16.00"
	 * ```
	 */
	useTrapezoid(
		parallelSide1: number,
		parallelSide2: number,
		height: number,
		options?: GeometryFormatOptions,
	): string {
		return formatGeometry(((parallelSide1 + parallelSide2) * height) / 2, options);
	},

	/**
	 * Calculates the area of a regular hexagon.
	 *
	 * @param side - The side length of the hexagon.
	 * @param options - Optional formatting options.
	 * @returns The formatted area string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.area.useHexagon(3); // "23.38"
	 * ```
	 */
	useHexagon(side: number, options?: GeometryFormatOptions): string {
		return formatGeometry(((3 * Math.sqrt(3)) / 2) * side ** 2, options);
	},

	/**
	 * Calculates the area of an ellipse.
	 *
	 * @param semiMajor - The semi-major axis length.
	 * @param semiMinor - The semi-minor axis length.
	 * @param options - Optional formatting options.
	 * @returns The formatted area string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.area.useEllipse(5, 3); // "47.12"
	 * ```
	 */
	useEllipse(semiMajor: number, semiMinor: number, options?: GeometryFormatOptions): string {
		return formatGeometry(Math.PI * semiMajor * semiMinor, options);
	},

	/**
	 * Calculates the area of a parallelogram.
	 *
	 * @param base - The base length of the parallelogram.
	 * @param height - The height of the parallelogram.
	 * @param options - Optional formatting options.
	 * @returns The formatted area string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.area.useParallelogram(6, 4); // "24.00"
	 * ```
	 */
	useParallelogram(base: number, height: number, options?: GeometryFormatOptions): string {
		return formatGeometry(base * height, options);
	},
};

/**
 * Pure perimeter calculations for geometric shapes.
 * All functions are stateless — input → formatted string only.
 */
const perimeter = {
	/**
	 * Calculates the perimeter of a rectangle.
	 *
	 * @param width - The width of the rectangle.
	 * @param height - The height of the rectangle.
	 * @param options - Optional formatting options.
	 * @returns The formatted perimeter string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.perimeter.useRectangle(5, 10); // "30.00"
	 * GeometryUtils.perimeter.useRectangle(5, 10, { unit: "m" }); // "30.00 m"
	 * ```
	 */
	useRectangle(width: number, height: number, options?: GeometryFormatOptions): string {
		return formatGeometry(2 * (width + height), options);
	},

	/**
	 * Calculates the perimeter of a square.
	 *
	 * @param side - The side length of the square.
	 * @param options - Optional formatting options.
	 * @returns The formatted perimeter string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.perimeter.useSquare(4); // "16.00"
	 * ```
	 */
	useSquare(side: number, options?: GeometryFormatOptions): string {
		return formatGeometry(4 * side, options);
	},

	/**
	 * Calculates the perimeter of a triangle.
	 *
	 * @param side1 - The length of the first side.
	 * @param side2 - The length of the second side.
	 * @param side3 - The length of the third side.
	 * @param options - Optional formatting options.
	 * @returns The formatted perimeter string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.perimeter.useTriangle(3, 4, 5); // "12.00"
	 * ```
	 */
	useTriangle(side1: number, side2: number, side3: number, options?: GeometryFormatOptions): string {
		return formatGeometry(side1 + side2 + side3, options);
	},

	/**
	 * Calculates the perimeter (circumference) of a circle.
	 *
	 * @param radius - The radius of the circle.
	 * @param options - Optional formatting options.
	 * @returns The formatted perimeter string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.perimeter.useCircle(5); // "31.42"
	 * ```
	 */
	useCircle(radius: number, options?: GeometryFormatOptions): string {
		return formatGeometry(2 * Math.PI * radius, options);
	},

	/**
	 * Calculates the perimeter of a regular hexagon.
	 *
	 * @param side - The side length of the hexagon.
	 * @param options - Optional formatting options.
	 * @returns The formatted perimeter string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.perimeter.useHexagon(3); // "18.00"
	 * ```
	 */
	useHexagon(side: number, options?: GeometryFormatOptions): string {
		return formatGeometry(6 * side, options);
	},

	/**
	 * Calculates the perimeter of a trapezoid.
	 *
	 * @param side1 - The length of the first side.
	 * @param side2 - The length of the second side.
	 * @param side3 - The length of the third side.
	 * @param side4 - The length of the fourth side.
	 * @param options - Optional formatting options.
	 * @returns The formatted perimeter string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.perimeter.useTrapezoid(3, 5, 4, 4); // "16.00"
	 * ```
	 */
	useTrapezoid(
		side1: number,
		side2: number,
		side3: number,
		side4: number,
		options?: GeometryFormatOptions,
	): string {
		return formatGeometry(side1 + side2 + side3 + side4, options);
	},

	/**
	 * Calculates the perimeter of an ellipse using Ramanujan's approximation II.
	 *
	 * @param semiMajor - The semi-major axis length.
	 * @param semiMinor - The semi-minor axis length.
	 * @param options - Optional formatting options.
	 * @returns The formatted perimeter string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.perimeter.useEllipse(5, 3); // "25.53"
	 * ```
	 */
	useEllipse(semiMajor: number, semiMinor: number, options?: GeometryFormatOptions): string {
		const a = Math.abs(semiMajor);
		const b = Math.abs(semiMinor);
		const sum = a + b;
		if (sum === 0) {
			return formatGeometry(0, options);
		}
		// Ramanujan approximation II — stable when a === b (circle).
		const h = ((a - b) / sum) ** 2;
		const perimeterValue = Math.PI * sum * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
		return formatGeometry(perimeterValue, options);
	},

	/**
	 * Calculates the perimeter of a parallelogram.
	 *
	 * @param side1 - The length of the first side.
	 * @param side2 - The length of the second side.
	 * @param options - Optional formatting options.
	 * @returns The formatted perimeter string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.perimeter.useParallelogram(5, 3); // "16.00"
	 * ```
	 */
	useParallelogram(side1: number, side2: number, options?: GeometryFormatOptions): string {
		return formatGeometry(2 * (side1 + side2), options);
	},
};

/**
 * Pure volume calculations for 3D geometric shapes.
 * All functions are stateless — input → formatted string only.
 */
const volume = {
	/**
	 * Calculates the volume of a cube.
	 *
	 * @param side - The side length of the cube.
	 * @param options - Optional formatting options.
	 * @returns The formatted volume string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.volume.useCube(3); // "27.00"
	 * GeometryUtils.volume.useCube(3, { unit: "m³" }); // "27.00 m³"
	 * ```
	 */
	useCube(side: number, options?: GeometryFormatOptions): string {
		return formatGeometry(side ** 3, options);
	},

	/**
	 * Calculates the volume of a box (rectangular prism).
	 *
	 * @param length - The length of the box.
	 * @param width - The width of the box.
	 * @param height - The height of the box.
	 * @param options - Optional formatting options.
	 * @returns The formatted volume string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.volume.useBox(2, 3, 4); // "24.00"
	 * ```
	 */
	useBox(length: number, width: number, height: number, options?: GeometryFormatOptions): string {
		return formatGeometry(length * width * height, options);
	},

	/**
	 * Calculates the volume of a sphere.
	 *
	 * @param radius - The radius of the sphere.
	 * @param options - Optional formatting options.
	 * @returns The formatted volume string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.volume.useSphere(3); // "113.10"
	 * ```
	 */
	useSphere(radius: number, options?: GeometryFormatOptions): string {
		return formatGeometry((4 / 3) * Math.PI * radius ** 3, options);
	},

	/**
	 * Calculates the volume of a cylinder.
	 *
	 * @param radius - The radius of the cylinder base.
	 * @param height - The height of the cylinder.
	 * @param options - Optional formatting options.
	 * @returns The formatted volume string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.volume.useCylinder(3, 5); // "141.37"
	 * ```
	 */
	useCylinder(radius: number, height: number, options?: GeometryFormatOptions): string {
		return formatGeometry(Math.PI * radius ** 2 * height, options);
	},

	/**
	 * Calculates the volume of a cone.
	 *
	 * @param radius - The radius of the cone base.
	 * @param height - The height of the cone.
	 * @param options - Optional formatting options.
	 * @returns The formatted volume string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.volume.useCone(3, 5); // "47.12"
	 * ```
	 */
	useCone(radius: number, height: number, options?: GeometryFormatOptions): string {
		return formatGeometry((1 / 3) * Math.PI * radius ** 2 * height, options);
	},

	/**
	 * Calculates the volume of a pyramid.
	 *
	 * @param baseArea - The area of the pyramid base.
	 * @param height - The height of the pyramid.
	 * @param options - Optional formatting options.
	 * @returns The formatted volume string.
	 *
	 * @example
	 * ```ts
	 * import { GeometryUtils } from "katanakit-js";
	 *
	 * GeometryUtils.volume.usePyramid(12, 5); // "20.00"
	 * ```
	 */
	usePyramid(baseArea: number, height: number, options?: GeometryFormatOptions): string {
		return formatGeometry((1 / 3) * baseArea * height, options);
	},
};

/**
 * Consolidated pure geometry utilities namespace.
 * Groups area, perimeter and volume calculations (no shared mutable state).
 *
 * @example
 * ```ts
 * import { GeometryUtils } from "katanakit-js";
 *
 * GeometryUtils.area.useCircle(5);       // "78.54"
 * GeometryUtils.perimeter.useCircle(5);  // "31.42"
 * GeometryUtils.volume.useSphere(3);     // "113.10"
 * ```
 */
export const GeometryUtils = {
	area,
	perimeter,
	volume,
};
