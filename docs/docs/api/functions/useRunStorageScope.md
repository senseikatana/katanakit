# Function: useRunStorageScope()

> **useRunStorageScope**&lt;`T`&gt;(`fn`): `T`

Defined in: [src/infrastructure/storage/storage.service.ts:253](https://github.com/senseikatana/katanakit-js/blob/92c921f7b0035b6c7c6649923a868e4e42964772/src/infrastructure/storage/storage.service.ts#L253)

Runs `fn` with request-isolated in-memory storage (SSR).
Use this around a request handler so `useSetStorage` / `useGetStorage`
share state within the request but not across requests.

## Type Parameters

### T

`T`

Return type of `fn`.

## Parameters

### fn

() => `T`

The function to run within the storage scope.

## Returns

`T`

The return value of `fn`.

## Example

```ts
import { useRunStorageScope, useSetStorage, useGetStorage } from "katanakit-js";

export default defineEventHandler((event) => {
  return useRunStorageScope(() => {
    useSetStorage("req-id", event.context.id);
    return useGetStorage("req-id");
  });
});
```
