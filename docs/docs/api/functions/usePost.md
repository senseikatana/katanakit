# Function: usePost()

> **usePost**&lt;`T`&gt;(`apiName`, `endpointName`, `body?`, `urlOptions?`): `Promise`&lt;[`FetchResult`](../type-aliases/FetchResult.md)&lt;`T`&gt;&gt;

Defined in: [src/core/services/http.service.ts:436](https://github.com/senseikatana/katanakit-js/blob/067d3da0ca4f0dd58cc57102a312c6a9921819cb/src/core/services/http.service.ts#L436)

POST helper over a registered API endpoint.

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
import { usePost } from "katanakit-js";

const result = await usePost("pokeapi", "createPokemon", { name: "Pikachu" });
```
