# Function: usePick()

> **usePick**&lt;`T`, `K`&gt;(`obj`, `keys`): `Pick`&lt;`T`, `K`&gt;

Defined in: [src/core/services/utils.service.ts:177](https://github.com/senseikatana/katanakit-js/blob/9cd294dbd5fcacaa39e035a9611ee874df2bc442/src/core/services/utils.service.ts#L177)

Picks the listed keys from an object into a new object.

## Type Parameters

### T

`T` *extends* `object`

Source object type.

### K

`K` *extends* `string` \| `number` \| `symbol`

Keys to pick.

## Parameters

### obj

`T`

The source object.

### keys

`K`[]

Array of keys to include.

## Returns

`Pick`&lt;`T`, `K`&gt;

A new object with only the picked keys.

## Example

```ts
const user = { id: 1, name: "Alice", email: "a@b.com" };
usePick(user, ["id", "name"]); // { id: 1, name: "Alice" }
```
