# Function: usePost()

> **usePost**&lt;`T`&gt;(`apiName`, `endpointName`, `body?`, `urlOptions?`): `Promise`&lt;[`FetchResult`](../type-aliases/FetchResult.md)&lt;`T`&gt;&gt;

Defined in: [src/core/services/http.service.ts:436](https://github.com/senseikatana/katanakit-js/blob/cc7f6fdb267e50aa7f208b256d51e23ae72de919/src/core/services/http.service.ts#L436)

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
