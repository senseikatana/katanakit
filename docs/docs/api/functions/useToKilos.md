# Function: useToKilos()

> **useToKilos**(`pounds`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:283](https://github.com/senseikatana/katanakit-js/blob/cc7f6fdb267e50aa7f208b256d51e23ae72de919/src/core/services/formatter.service.ts#L283)

Pure: pounds → kilograms (formatted).

## Parameters

### pounds

`number`

Weight in pounds.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

### digits?

`number` = `2`

Fraction digits. Defaults to `2`.

## Returns

`string`

The formatted kilogram string.

## Example

```ts
import { useToKilos } from "katanakit-js";

useToKilos(1); // "0.45"
```
