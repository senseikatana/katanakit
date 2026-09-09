# Function: useToPounds()

> **useToPounds**(`kilos`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:302](https://github.com/senseikatana/katanakit-js/blob/a86a4ede2a0d7e81874bbd477970d7a9a311f35c/src/core/services/formatter.service.ts#L302)

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
