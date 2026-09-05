# Transiciones

Utilidades para controlar la duracion y funcion de temporizacion de las transiciones.

# Transiciones

Utilidades para controlar `transition-duration` y `transition-timing-function`
de un elemento, generadas desde `$transition-duration-map` y
`$transition-timing-map`.

> Estas utilidades establecen **solo** la duracion y la funcion de
> temporizacion. El framework no emite una clase `.transition`; declara
> `transition-property` tu mismo (por ejemplo `transition: color`), o usa las
> utilidades `transition*` dentro de [`@apply`](/es/core/apply/).

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.duration-75` | `transition-duration: 75ms;` |
| `.duration-100` | `transition-duration: 100ms;` |
| `.duration-150` | `transition-duration: 150ms;` |
| `.duration-200` | `transition-duration: 200ms;` |
| `.duration-300` | `transition-duration: 300ms;` |
| `.duration-500` | `transition-duration: 500ms;` |
| `.duration-700` | `transition-duration: 700ms;` |
| `.duration-1000` | `transition-duration: 1000ms;` |

| Clase | Propiedades |
| --- | --- |
| `.ease-linear` | `transition-timing-function: linear;` |
| `.ease-in` | `transition-timing-function: cubic-bezier(0.4, 0, 1, 1);` |
| `.ease-out` | `transition-timing-function: cubic-bezier(0, 0, 0.2, 1);` |
| `.ease-in-out` | `transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);` |

## Uso basico

Pasa el raton sobre el boton para ver la transicion en accion:

<div class="kk-demo">
  <button class="hover-bg-purple-500 bg-purple-300 text-purple-700 p-2 px-4 rounded-md font-semibold duration-300 ease-out" style="transition-property: background-color, color">duration-300 ease-out</button>
</div>

```html
<button
  class="hover-bg-purple-500 bg-purple-300 duration-300 ease-out"
  style="transition-property: background-color"
>
  duration-300 ease-out
</button>
```

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $transition-duration-map: (
    "fast": 100ms,
    "normal": 300ms,
    "slow": 1000ms
  ),
  $transition-timing-map: (
    "linear": linear,
    "in-out": cubic-bezier(0.4, 0, 0.2, 1)
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-effects-utilities();
```
