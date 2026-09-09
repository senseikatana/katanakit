# Function: useToMiles()

> **useToMiles**(`km`, `locale?`, `digits?`): `string`

Defined in: [src/core/services/formatter.service.ts:226](https://github.com/senseikatana/katanakit-js/blob/92c921f7b0035b6c7c6649923a868e4e42964772/src/core/services/formatter.service.ts#L226)

Pure: kilometers → miles (formatted). Round-trips with `useToKilometers`.

## Parameters

### km

`number`

Distance in kilometers.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

### digits?

`number` = `2`

Fraction digits. Defaults to `2`.

## Returns

`string`

The formatted mile string.

## Example

```ts
import { useToMiles } from "katanakit-js";

useToMiles(1.60934); // "1.00"
```
