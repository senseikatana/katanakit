# Function: useUnique()

> **useUnique**&lt;`T`&gt;(`array`): `T`[]

Defined in: [src/core/services/utils.service.ts:14](https://github.com/senseikatana/katanakit-js/blob/5f61b578df41177e4d39d9b6d369c524de91524a/src/core/services/utils.service.ts#L14)

Returns a new array with duplicate values removed, preserving first-seen order.

## Type Parameters

### T

`T`

Element type.

## Parameters

### array

`T`[]

The input array.

## Returns

`T`[]

A new array with unique values.

## Example

```ts
useUnique([1, 2, 2, 3, 1]); // [1, 2, 3]
useUnique(["a", "b", "a"]); // ["a", "b"]
```
