# Function: useToKilometers()

> **useToKilometers**(`miles`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:207](https://github.com/senseikatana/katanakit-js/blob/a86a4ede2a0d7e81874bbd477970d7a9a311f35c/src/core/services/formatter.service.ts#L207)

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
