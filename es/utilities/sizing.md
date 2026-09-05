# Ancho y Alto

Utilidades para establecer el ancho y alto de un elemento.

# Ancho y Alto

Utilidades para establecer el ancho y alto de un elemento, generadas desde
`$sizing-map` para seis prefijos: `w-*`, `min-w-*`, `max-w-*`, `h-*`,
`min-h-*`, `max-h-*`.

## Referencia rapida

| Clave | Valor | `w-*` | `min-w-*` | `max-w-*` | `h-*` | `min-h-*` | `max-h-*` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `0` | `0` | `.w-0` | `.min-w-0` | `.max-w-0` | `.h-0` | `.min-h-0` | `.max-h-0` |
| `base` | `1px` | `.w-base` | `.min-w-base` | `.max-w-base` | `.h-base` | `.min-h-base` | `.max-h-base` |
| `05` | `0.125rem` | `.w-05` | `.min-w-05` | `.max-w-05` | `.h-05` | `.min-h-05` | `.max-h-05` |
| `1` | `0.25rem` | `.w-1` | `.min-w-1` | `.max-w-1` | `.h-1` | `.min-h-1` | `.max-h-1` |
| `2` | `0.5rem` | `.w-2` | `.min-w-2` | `.max-w-2` | `.h-2` | `.min-h-2` | `.max-h-2` |
| `3` | `0.75rem` | `.w-3` | `.min-w-3` | `.max-w-3` | `.h-3` | `.min-h-3` | `.max-h-3` |
| `4` | `1rem` | `.w-4` | `.min-w-4` | `.max-w-4` | `.h-4` | `.min-h-4` | `.max-h-4` |
| `5` | `1.25rem` | `.w-5` | `.min-w-5` | `.max-w-5` | `.h-5` | `.min-h-5` | `.max-h-5` |
| `6` | `1.5rem` | `.w-6` | `.min-w-6` | `.max-w-6` | `.h-6` | `.min-h-6` | `.max-h-6` |
| `8` | `2rem` | `.w-8` | `.min-w-8` | `.max-w-8` | `.h-8` | `.min-h-8` | `.max-h-8` |
| `10` | `2.5rem` | `.w-10` | `.min-w-10` | `.max-w-10` | `.h-10` | `.min-h-10` | `.max-h-10` |
| `12` | `3rem` | `.w-12` | `.min-w-12` | `.max-w-12` | `.h-12` | `.min-h-12` | `.max-h-12` |
| `16` | `4rem` | `.w-16` | `.min-w-16` | `.max-w-16` | `.h-16` | `.min-h-16` | `.max-h-16` |
| `20` | `5rem` | `.w-20` | `.min-w-20` | `.max-w-20` | `.h-20` | `.min-h-20` | `.max-h-20` |
| `24` | `6rem` | `.w-24` | `.min-w-24` | `.max-w-24` | `.h-24` | `.min-h-24` | `.max-h-24` |
| `32` | `8rem` | `.w-32` | `.min-w-32` | `.max-w-32` | `.h-32` | `.min-h-32` | `.max-h-32` |
| `40` | `10rem` | `.w-40` | `.min-w-40` | `.max-w-40` | `.h-40` | `.min-h-40` | `.max-h-40` |
| `48` | `12rem` | `.w-48` | `.min-w-48` | `.max-w-48` | `.h-48` | `.min-h-48` | `.max-h-48` |
| `64` | `16rem` | `.w-64` | `.min-w-64` | `.max-w-64` | `.h-64` | `.min-h-64` | `.max-h-64` |
| `auto` | `auto` | `.w-auto` | `.min-w-auto` | `.max-w-auto` | `.h-auto` | `.min-h-auto` | `.max-h-auto` |
| `full` | `100%` | `.w-full` | `.min-w-full` | `.max-w-full` | `.h-full` | `.min-h-full` | `.max-h-full` |
| `screen` | `100vw` | `.w-screen` | `.min-w-screen` | `.max-w-screen` | `.h-screen` | `.min-h-screen` | `.max-h-screen` |
| `min` | `min-content` | `.w-min` | `.min-w-min` | `.max-w-min` | `.h-min` | `.min-h-min` | `.max-h-min` |
| `max` | `max-content` | `.w-max` | `.min-w-max` | `.max-w-max` | `.h-max` | `.min-h-max` | `.max-h-max` |
| `fit` | `fit-content` | `.w-fit` | `.min-w-fit` | `.max-w-fit` | `.h-fit` | `.min-h-fit` | `.max-h-fit` |

> Nota: `screen` siempre se resuelve a `100vw` incluso para los prefijos de
> altura. Si necesitas una caja de viewport a altura completa, prefiere
> `.h-full` en un padre o tu propia regla `height: 100vh`.

## Uso basico

<div class="kk-demo">
  <div class="w-64 bg-purple-200 text-purple-700 rounded-md p-4">w-64</div>
  <div class="w-40 h-24 bg-purple-300 text-purple-700 rounded-md p-4">w-40 h-24</div>
  <div class="w-24 h-24 bg-purple-500 text-white rounded-md p-4">w-24 h-24</div>
</div>

```html
<div class="w-64 ...">w-64</div>
<div class="w-40 h-24 ...">w-40 h-24</div>
<div class="w-24 h-24 ...">w-24 h-24</div>
```

## Usar porcentajes y tamanos de contenido

`full` es `100%`, y `min`/`max`/`fit` mapean a los tamanos intrinsecos de CSS:

```html
<div class="w-full ...">llena el ancho del padre</div>
<div class="w-fit ...">se reduce a su contenido</div>
<div class="w-max ...">crece hasta su linea mas larga</div>
```

## Restringir con min y max

`max-w-*` y `min-h-*` limitan un elemento en lugar de fijarlo:

```html
<img class="max-w-full" src="hero.png" alt="" />
<article class="max-w-64">mantiene longitudes de linea legibles</article>
```

## Personalizar

Sobreescribe `$sizing-map` en el modulo `utilities` antes de generar:

```scss
@use "katanakit-css/src/scss/utilities" as u with (
  $sizing-map: (
    "0": 0,
    "1": 0.25rem,
    "4": 1rem,
    "full": 100%,
    "screen": 100vw,
    "auto": auto
  )
);

@include u.get-sizing-classes();
```
