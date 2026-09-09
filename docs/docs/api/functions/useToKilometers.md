# Function: useToKilometers()

> **useToKilometers**(`miles`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:207](https://github.com/senseikatana/katanakit-js/blob/cc7f6fdb267e50aa7f208b256d51e23ae72de919/src/core/services/formatter.service.ts#L207)

Pure: miles → kilometers (formatted). Round-trips with `useToMiles`.

## Parameters

### miles

`number`

Distance in miles.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

### digits?

`number` = `2`

Fraction digits. Defaults to `2`.

## Returns

`string`

The formatted kilometer string.

## Example

```ts
import { useToKilometers } from "katanakit-js";

useToKilometers(1); // "1.61"
```
