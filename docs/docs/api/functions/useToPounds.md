# Function: useToPounds()

> **useToPounds**(`kilos`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:302](https://github.com/senseikatana/katanakit-js/blob/cc7f6fdb267e50aa7f208b256d51e23ae72de919/src/core/services/formatter.service.ts#L302)

Pure: kilograms → pounds (formatted).

## Parameters

### kilos

`number`

Weight in kilograms.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

### digits?

`number` = `2`

Fraction digits. Defaults to `2`.

## Returns

`string`

The formatted pound string.

## Example

```ts
import { useToPounds } from "katanakit-js";

useToPounds(1); // "2.20"
```
