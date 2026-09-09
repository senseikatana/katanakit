# Function: useUnique()

> **useUnique**&lt;`T`&gt;(`array`): `T`[]

Defined in: [src/core/services/utils.service.ts:14](https://github.com/senseikatana/katanakit-js/blob/04891e89563504d7c59b2a5004ef20cbc07608ac/src/core/services/utils.service.ts#L14)

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
