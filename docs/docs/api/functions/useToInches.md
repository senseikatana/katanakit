# Function: useToInches()

> **useToInches**(`cm`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:245](https://github.com/senseikatana/katanakit-js/blob/067d3da0ca4f0dd58cc57102a312c6a9921819cb/src/core/services/formatter.service.ts#L245)

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
