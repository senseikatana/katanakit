# Overflow

Utilidades para controlar como el contenido desborda un elemento.

# Overflow

Utilidades para controlar como maneja un elemento el contenido que no cabe
en su caja. Generadas desde la lista `$overflow-values`.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.overflow-auto` | `overflow: auto;` |
| `.overflow-hidden` | `overflow: hidden;` |
| `.overflow-scroll` | `overflow: scroll;` |
| `.overflow-visible` | `overflow: visible;` |

## Uso basico

Recorta el contenido que excede una altura o anchura fija:

<div class="kk-demo">
  <div class="w-64 h-24 overflow-hidden bg-purple-100 text-purple-700 rounded-md p-2">
    Este es un texto muy largo que no cabe dentro de la caja fija. Todo lo que
    esta mas alla del borde se recorta con overflow-hidden.
  </div>
  <div class="w-64 h-24 overflow-auto bg-info-100 text-info-700 rounded-md p-2">
    Este es un texto muy largo que no cabe dentro de la caja fija. overflow-auto
    anade barras de desplazamiento solo cuando el contenido las necesita.
  </div>
</div>

```html
<div class="w-64 h-24 overflow-hidden ...">...</div>
<div class="w-64 h-24 overflow-auto ...">...</div>
```

- `overflow-hidden` recorta sin desplazamiento.
- `overflow-auto` muestra barras de desplazamiento solo cuando se necesitan.
- `overflow-scroll` siempre reserva espacio para barras de desplazamiento.
- `overflow-visible` (el valor por defecto del navegador) deja que el
  contenido se desborde.

## Combinar con utilidades de dimensiones

`overflow-*` se combina con las utilidades de
[Ancho y Alto](/es/utilities/sizing/) para crear regiones desplazables:

```html
<div class="max-h-64 overflow-auto">
  <!-- lista larga -->
</div>
```

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $overflow-values: (auto, hidden, scroll, visible)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
