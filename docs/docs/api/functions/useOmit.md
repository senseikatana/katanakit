# Function: useOmit()

> **useOmit**&lt;`T`, `K`&gt;(`obj`, `keys`): `Omit`&lt;`T`, `K`&gt;

Defined in: [src/core/services/utils.service.ts:204](https://github.com/senseikatana/katanakit-js/blob/067d3da0ca4f0dd58cc57102a312c6a9921819cb/src/core/services/utils.service.ts#L204)

Omits the listed keys from an object, returning a shallow copy without
them. Shallow on purpose to avoid `structuredClone` failures on
non-cloneable values.

## Type Parameters

### T

`T` *extends* `object`

Source object type.

### K

`K` *extends* `string` \| `number` \| `symbol`

Keys to omit.

## Parameters

### obj

`T`

The source object.

### keys

`K`[]

Array of keys to exclude.

## Returns

`Omit`&lt;`T`, `K`&gt;

A new object without the omitted keys.

## Example

```ts
const user = { id: 1, name: "Alice", password: "secret" };
useOmit(user, ["password"]); // { id: 1, name: "Alice" }
```
