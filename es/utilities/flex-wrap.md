# Flex Wrap

Utilidades para controlar si los elementos flex se envuelven.

# Flex Wrap

Utilidades para controlar si los elementos flex se envuelven en multiples
lineas. Requiere un contenedor flex (`.flex` o `.inline-flex`).

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.flex-wrap` | `flex-wrap: wrap;` |
| `.flex-nowrap` | `flex-wrap: nowrap;` |

## Uso basico

`flex-wrap` permite que los elementos pasen a nuevas lineas cuando el
contenedor se queda sin espacio; `flex-nowrap` fuerza una sola linea:

<div class="kk-demo">
  <div class="flex flex-wrap gap-2 w-64">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">2</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">3</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">4</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">5</div>
  </div>
</div>

```html
<div class="flex flex-wrap gap-2 w-64">...</div>
```

## Prevenir el envoltura

```html
<div class="flex flex-nowrap">
  <span class="whitespace-nowrap">Nunca se rompe</span>
  <span class="whitespace-nowrap">Se mantiene en una linea</span>
</div>
```

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $flex-wrap-list: (wrap, nowrap)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-flex-utilities();
```
