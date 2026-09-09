# Function: useUpperCase()

> **useUpperCase**(`text`, `locale?`): `string`

Defined in: [src/core/services/formatter.service.ts:47](https://github.com/senseikatana/katanakit-js/blob/f3e8aa63995d22bcc8253b02a108a1169d9a2cb9/src/core/services/formatter.service.ts#L47)

Pure: locale-aware upper case (trims whitespace).

## Parameters

### text

`string`

The string to transform.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

## Returns

`string`

The upper-cased, trimmed string.

## Example

```ts
import { useUpperCase } from "katanakit-js";

useUpperCase("hello"); // "HELLO"
useUpperCase("straße", "de"); // "STRASSE"
```
