/**
 * Example: geometry utilities.
 *
 * Run with: `bun run examples/geometry/demo.ts`
 */
import { GeometryUtils } from "@/core/services/geometry.service";

const rectangleArea = GeometryUtils.area.useRectangle(5, 10, { digits: 2, unit: "m²" });
console.log("Rectangle area:", rectangleArea); // "50.00 m²"

const circlePerimeter = GeometryUtils.perimeter.useCircle(3, { unit: "cm" });
console.log("Circle perimeter:", circlePerimeter); // "18.85 cm"

const sphereVolume = GeometryUtils.volume.useSphere(5, { digits: 3, unit: "L" });
console.log("Sphere volume:", sphereVolume); // "523.599 L"

const triangleArea = GeometryUtils.area.useTriangle(8, 6);
console.log("Triangle area:", triangleArea);

const hexagonPerimeter = GeometryUtils.perimeter.useHexagon(4);
console.log("Hexagon perimeter:", hexagonPerimeter);

const squareArea = GeometryUtils.area.useSquare(10, {
	locale: "es-ES",
	digits: 0,
	unit: "m²",
});
console.log("Square area (es-ES):", squareArea); // "100 m²"
