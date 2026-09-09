# Function: useJsonParse()

> **useJsonParse**&lt;`T`&gt;(`json`): `T`

Defined in: [src/core/services/formatter.service.ts:148](https://github.com/senseikatana/katanakit-js/blob/7613d3b0c0dd2f7fb4e119c92fa0a340c28b3dc9/src/core/services/formatter.service.ts#L148)

Pure: parse JSON (throws on invalid input — same as `JSON.parse`).

## Type Parameters

### T

`T` = `unknown`

## Parameters

### json

`string`

The JSON string to parse.

## Returns

`T`

The parsed value typed as `T`.

## Example

```ts
import { useJsonParse } from "katanakit-js";

const obj = useJsonParse<{ a: number }>('{"a":1}');
// { a: 1 }
```
