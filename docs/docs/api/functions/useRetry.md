# Function: useRetry()

> **useRetry**&lt;`T`&gt;(`fn`, `retries?`, `delayMs?`): `Promise`&lt;`T`&gt;

Defined in: [src/core/services/utils.service.ts:246](https://github.com/senseikatana/katanakit-js/blob/383d6a100560d2a9a7041d90cd0ed5082a876890/src/core/services/utils.service.ts#L246)

Retries an async function with a fixed delay between attempts.

## Type Parameters

### T

`T`

The resolved value type.

## Parameters

### fn

() => `Promise`&lt;`T`&gt;

The async function to retry.

### retries?

`number` = `3`

Maximum number of retries (defaults to `3`).

### delayMs?

`number` = `1000`

Delay between retries in milliseconds (defaults to `1000`).

## Returns

`Promise`&lt;`T`&gt;

The resolved value of `fn`.

## Throws

The last error if all retries are exhausted.

## Example

```ts
const data = await useRetry(() => fetch("/api").then(r => r.json()), 3, 500);
```
