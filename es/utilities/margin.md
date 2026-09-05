# Margin

Utilidades para controlar el margin de un elemento.

# Margin

Utilidades para controlar el margin de un elemento. Cada valor de
`$spacing-map` se emite para los siete prefijos: `m-*` (todos los lados),
`mx-*`/`my-*` (horizontal/vertical) y `mt-*`/`mr-*`/`mb-*`/`ml-*` (un lado).

## Referencia rapida

| Escala | `m-*` | `mx-*` | `my-*` | `mt-*` | `mr-*` | `mb-*` | `ml-*` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `0` -> `0` | `.m-0` | `.mx-0` | `.my-0` | `.mt-0` | `.mr-0` | `.mb-0` | `.ml-0` |
| `05` -> `0.125rem` | `.m-05` | `.mx-05` | `.my-05` | `.mt-05` | `.mr-05` | `.mb-05` | `.ml-05` |
| `base` -> `1px` | `.m-base` | `.mx-base` | `.my-base` | `.mt-base` | `.mr-base` | `.mb-base` | `.ml-base` |
| `1` -> `0.25rem` | `.m-1` | `.mx-1` | `.my-1` | `.mt-1` | `.mr-1` | `.mb-1` | `.ml-1` |
| `1-5` -> `0.375rem` | `.m-1-5` | `.mx-1-5` | `.my-1-5` | `.mt-1-5` | `.mr-1-5` | `.mb-1-5` | `.ml-1-5` |
| `2` -> `0.5rem` | `.m-2` | `.mx-2` | `.my-2` | `.mt-2` | `.mr-2` | `.mb-2` | `.ml-2` |
| `2-5` -> `0.625rem` | `.m-2-5` | `.mx-2-5` | `.my-2-5` | `.mt-2-5` | `.mr-2-5` | `.mb-2-5` | `.ml-2-5` |
| `3` -> `0.75rem` | `.m-3` | `.mx-3` | `.my-3` | `.mt-3` | `.mr-3` | `.mb-3` | `.ml-3` |
| `3-5` -> `0.875rem` | `.m-3-5` | `.mx-3-5` | `.my-3-5` | `.mt-3-5` | `.mr-3-5` | `.mb-3-5` | `.ml-3-5` |
| `4` -> `1rem` | `.m-4` | `.mx-4` | `.my-4` | `.mt-4` | `.mr-4` | `.mb-4` | `.ml-4` |
| `5` -> `1.25rem` | `.m-5` | `.mx-5` | `.my-5` | `.mt-5` | `.mr-5` | `.mb-5` | `.ml-5` |
| `6` -> `1.5rem` | `.m-6` | `.mx-6` | `.my-6` | `.mt-6` | `.mr-6` | `.mb-6` | `.ml-6` |
| `7` -> `1.75rem` | `.m-7` | `.mx-7` | `.my-7` | `.mt-7` | `.mr-7` | `.mb-7` | `.ml-7` |
| `8` -> `2rem` | `.m-8` | `.mx-8` | `.my-8` | `.mt-8` | `.mr-8` | `.mb-8` | `.ml-8` |
| `9` -> `2.25rem` | `.m-9` | `.mx-9` | `.my-9` | `.mt-9` | `.mr-9` | `.mb-9` | `.ml-9` |
| `10` -> `2.5rem` | `.m-10` | `.mx-10` | `.my-10` | `.mt-10` | `.mr-10` | `.mb-10` | `.ml-10` |
| `11` -> `2.75rem` | `.m-11` | `.mx-11` | `.my-11` | `.mt-11` | `.mr-11` | `.mb-11` | `.ml-11` |
| `12` -> `3rem` | `.m-12` | `.mx-12` | `.my-12` | `.mt-12` | `.mr-12` | `.mb-12` | `.ml-12` |
| `14` -> `3.5rem` | `.m-14` | `.mx-14` | `.my-14` | `.mt-14` | `.mr-14` | `.mb-14` | `.ml-14` |
| `16` -> `4rem` | `.m-16` | `.mx-16` | `.my-16` | `.mt-16` | `.mr-16` | `.mb-16` | `.ml-16` |
| `20` -> `5rem` | `.m-20` | `.mx-20` | `.my-20` | `.mt-20` | `.mr-20` | `.mb-20` | `.ml-20` |
| `24` -> `6rem` | `.m-24` | `.mx-24` | `.my-24` | `.mt-24` | `.mr-24` | `.mb-24` | `.ml-24` |
| `28` -> `7rem` | `.m-28` | `.mx-28` | `.my-28` | `.mt-28` | `.mr-28` | `.mb-28` | `.ml-28` |
| `32` -> `8rem` | `.m-32` | `.mx-32` | `.my-32` | `.mt-32` | `.mr-32` | `.mb-32` | `.ml-32` |
| `36` -> `9rem` | `.m-36` | `.mx-36` | `.my-36` | `.mt-36` | `.mr-36` | `.mb-36` | `.ml-36` |
| `40` -> `10rem` | `.m-40` | `.mx-40` | `.my-40` | `.mt-40` | `.mr-40` | `.mb-40` | `.ml-40` |
| `44` -> `11rem` | `.m-44` | `.mx-44` | `.my-44` | `.mt-44` | `.mr-44` | `.mb-44` | `.ml-44` |
| `48` -> `12rem` | `.m-48` | `.mx-48` | `.my-48` | `.mt-48` | `.mr-48` | `.mb-48` | `.ml-48` |
| `52` -> `13rem` | `.m-52` | `.mx-52` | `.my-52` | `.mt-52` | `.mr-52` | `.mb-52` | `.ml-52` |
| `56` -> `14rem` | `.m-56` | `.mx-56` | `.my-56` | `.mt-56` | `.mr-56` | `.mb-56` | `.ml-56` |
| `60` -> `15rem` | `.m-60` | `.mx-60` | `.my-60` | `.mt-60` | `.mr-60` | `.mb-60` | `.ml-60` |
| `64` -> `16rem` | `.m-64` | `.mx-64` | `.my-64` | `.mt-64` | `.mr-64` | `.mb-64` | `.ml-64` |
| `72` -> `18rem` | `.m-72` | `.mx-72` | `.my-72` | `.mt-72` | `.mr-72` | `.mb-72` | `.ml-72` |
| `80` -> `20rem` | `.m-80` | `.mx-80` | `.my-80` | `.mt-80` | `.mr-80` | `.mb-80` | `.ml-80` |
| `96` -> `24rem` | `.m-96` | `.mx-96` | `.my-96` | `.mt-96` | `.mr-96` | `.mb-96` | `.ml-96` |

## Uso basico

Anade margin a todos los lados de un elemento:

<div class="kk-demo">
  <div class="bg-purple-200 rounded-md">
    <div class="m-8 p-2 bg-white text-purple-700 rounded-md">m-8</div>
  </div>
</div>

```html
<div class="m-8 ...">m-8</div>
```

## Anadir margin horizontal y vertical

Controla el margin horizontal con `mx-*` y el margin vertical con `my-*`:

<div class="kk-demo">
  <div class="bg-purple-200 rounded-md">
    <div class="mx-12 my-4 p-2 bg-white text-purple-700 rounded-md">mx-12 my-4</div>
  </div>
</div>

```html
<div class="mx-12 my-4 ...">mx-12 my-4</div>
```

## Margin en un solo lado

Usa `mt-*`, `mr-*`, `mb-*` y `ml-*` para anadir margin a un solo lado:

<div class="kk-demo">
  <div class="bg-purple-200 rounded-md">
    <div class="mt-8 mr-4 mb-2 ml-6 p-2 bg-white text-purple-700 rounded-md">mt-8 . mr-4 . mb-2 . ml-6</div>
  </div>
</div>

```html
<div class="mt-8 mr-4 mb-2 ml-6 ...">mt-8 . mr-4 . mb-2 . ml-6</div>
```

## Personalizar

Sobreescribe `$spacing-map` antes de importar las utilidades para cambiar
toda la escala a la vez:

```scss
@use "katanakit-css/src/scss/variables" as v with (
  $spacing-map: (
    "0": 0,
    "1": 0.5rem,
    "2": 1rem,
    "4": 2rem
  )
);
```
