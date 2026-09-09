# Function: useToInches()

> **useToInches**(`cm`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:245](https://github.com/senseikatana/katanakit-js/blob/cc7f6fdb267e50aa7f208b256d51e23ae72de919/src/core/services/formatter.service.ts#L245)

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
