# Function: useJsonStringify()

> **useJsonStringify**(`data`): `string`

Defined in: [src/core/services/formatter.service.ts:130](https://github.com/senseikatana/katanakit-js/blob/5f61b578df41177e4d39d9b6d369c524de91524a/src/core/services/formatter.service.ts#L130)

Pure: pretty-print JSON (3-space indent).

## Parameters

### data

`unknown`

The value to serialize.

## Returns

`string`

The indented JSON string.

## Example

```ts
import { useJsonStringify } from "katanakit-js";

useJsonStringify({ a: 1 });
// '{\n   "a": 1\n}'
```
