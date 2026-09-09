# Function: useToFahrenheit()

> **useToFahrenheit**(`celsius`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:188](https://github.com/senseikatana/katanakit-js/blob/92c921f7b0035b6c7c6649923a868e4e42964772/src/core/services/formatter.service.ts#L188)

Pure: °C → °F (formatted).

## Parameters

### celsius

`number`

Temperature in Celsius.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

### digits?

`number` = `2`

Fraction digits. Defaults to `2`.

## Returns

`string`

The formatted Fahrenheit string.

## Example

```ts
import { useToFahrenheit } from "katanakit-js";

useToFahrenheit(100); // "212.00"
useToFahrenheit(0);   // "32.00"
```
