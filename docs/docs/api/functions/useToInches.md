# Function: useToInches()

> **useToInches**(`cm`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:245](https://github.com/senseikatana/katanakit-js/blob/04891e89563504d7c59b2a5004ef20cbc07608ac/src/core/services/formatter.service.ts#L245)

Pure: centimeters → inches (formatted).

## Parameters

### cm

`number`

Length in centimeters.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

### digits?

`number` = `2`

Fraction digits. Defaults to `2`.

## Returns

`string`

The formatted inch string.

## Example

```ts
import { useToInches } from "katanakit-js";

useToInches(2.54); // "1.00"
```
