# Function: usePick()

> **usePick**&lt;`T`, `K`&gt;(`obj`, `keys`): `Pick`&lt;`T`, `K`&gt;

Defined in: [src/core/services/utils.service.ts:177](https://github.com/senseikatana/katanakit-js/blob/f3e8aa63995d22bcc8253b02a108a1169d9a2cb9/src/core/services/utils.service.ts#L177)

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
