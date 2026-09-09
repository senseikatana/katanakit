# Function: usePatch()

> **usePatch**&lt;`T`&gt;(`apiName`, `endpointName`, `body?`, `urlOptions?`): `Promise`&lt;[`FetchResult`](../type-aliases/FetchResult.md)&lt;`T`&gt;&gt;

Defined in: [src/core/services/http.service.ts:494](https://github.com/senseikatana/katanakit-js/blob/383d6a100560d2a9a7041d90cd0ed5082a876890/src/core/services/http.service.ts#L494)

PATCH helper over a registered API endpoint.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### apiName

`string`

The registered API key.

### endpointName

`string`

The endpoint key within the API.

### body?

`unknown`

Optional request body (auto-serialized to JSON unless raw).

### urlOptions?

[`UrlOptions`](../interfaces/UrlOptions.md)

Optional URL building options.

## Returns

`Promise`&lt;[`FetchResult`](../type-aliases/FetchResult.md)&lt;`T`&gt;&gt;

A [FetchResult](../type-aliases/FetchResult.md) with data or error.

## Example

```ts
import { usePatch } from "katanakit-js";

const result = await usePatch("pokeapi", "updatePokemon", { name: "Raichu" }, { params: { id: 25 } });
```
