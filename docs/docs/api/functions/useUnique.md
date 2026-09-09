# Function: useUnique()

> **useUnique**&lt;`T`&gt;(`array`): `T`[]

Defined in: [src/core/services/utils.service.ts:14](https://github.com/senseikatana/katanakit-js/blob/a86a4ede2a0d7e81874bbd477970d7a9a311f35c/src/core/services/utils.service.ts#L14)

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
