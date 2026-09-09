# Function: useRound()

> **useRound**(`value`, `decimals?`): `number`

Defined in: [src/core/services/utils.service.ts:317](https://github.com/senseikatana/katanakit-js/blob/5f61b578df41177e4d39d9b6d369c524de91524a/src/core/services/utils.service.ts#L317)

Rounds a number (or numeric string) to the specified number of decimal
places. Returns `0` for non-numeric input.

## Parameters

### value

`string` \| `number`

The number or numeric string to round.

### decimals?

`number` = `2`

Number of decimal places (defaults to `2`).

## Returns

`number`

The rounded number.

## Example

```ts
useRound(3.14159, 2);   // 3.14
useRound("5.678", 1);   // 5.7
useRound("not-a-num");   // 0
```
