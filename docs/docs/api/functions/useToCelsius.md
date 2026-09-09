# Function: useToCelsius()

> **useToCelsius**(`fahrenheit`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:168](https://github.com/senseikatana/katanakit-js/blob/04891e89563504d7c59b2a5004ef20cbc07608ac/src/core/services/formatter.service.ts#L168)

Pure: °F → °C (formatted).

## Parameters

### fahrenheit

`number`

Temperature in Fahrenheit.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

### digits?

`number` = `2`

Fraction digits. Defaults to `2`.

## Returns

`string`

The formatted Celsius string.

## Example

```ts
import { useToCelsius } from "katanakit-js";

useToCelsius(212); // "100.00"
useToCelsius(32);  // "0.00"
```
