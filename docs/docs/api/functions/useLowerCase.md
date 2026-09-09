# Function: useLowerCase()

> **useLowerCase**(`text`, `locale?`): `string`

Defined in: [src/core/services/formatter.service.ts:65](https://github.com/senseikatana/katanakit-js/blob/9cd294dbd5fcacaa39e035a9611ee874df2bc442/src/core/services/formatter.service.ts#L65)

Pure: locale-aware lower case (trims whitespace).

## Parameters

### text

`string`

The string to transform.

### locale?

[`Locale`](../type-aliases/Locale.md) = `"en"`

BCP 47 locale tag. Defaults to `"en"`.

## Returns

`string`

The lower-cased, trimmed string.

## Example

```ts
import { useLowerCase } from "katanakit-js";

useLowerCase("HELLO"); // "hello"
```
