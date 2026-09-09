# Function: useRound()

> **useRound**(`value`, `decimals?`): `number`

Defined in: [src/core/services/utils.service.ts:317](https://github.com/senseikatana/katanakit-js/blob/9cd294dbd5fcacaa39e035a9611ee874df2bc442/src/core/services/utils.service.ts#L317)

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
