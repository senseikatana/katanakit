# Align Items

Utilidades para controlar como se alinean los elementos flex en el eje transversal.

# Align Items

Utilidades para controlar como se posicionan los elementos flex en el eje
transversal. Requiere un contenedor flex (`.flex` o `.inline-flex`).

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.items-start` | `align-items: flex-start;` |
| `.items-center` | `align-items: center;` |
| `.items-end` | `align-items: flex-end;` |
| `.items-stretch` | `align-items: stretch;` |

## Uso basico

Alinea los elementos en el eje transversal de un contenedor flex. El
contenedor de demo tiene una altura fija para que la diferencia sea visible:

<div class="kk-demo">
  <div class="flex items-start gap-2 w-64 h-24 bg-neutral-100 rounded-md p-2">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">A</div>
    <div class="p-8 bg-purple-300 text-purple-700 rounded-md">B</div>
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">C</div>
  </div>
  <div class="flex items-center gap-2 w-64 h-24 bg-neutral-100 rounded-md p-2">
    <div class="p-4 bg-info-200 text-info-700 rounded-md">A</div>
    <div class="p-8 bg-info-300 text-info-700 rounded-md">B</div>
    <div class="p-2 bg-info-200 text-info-700 rounded-md">C</div>
  </div>
  <div class="flex items-end gap-2 w-64 h-24 bg-neutral-100 rounded-md p-2">
    <div class="p-4 bg-success-200 text-success-700 rounded-md">A</div>
    <div class="p-8 bg-success-300 text-success-700 rounded-md">B</div>
    <div class="p-2 bg-success-200 text-success-700 rounded-md">C</div>
  </div>
</div>

```html
<div class="flex items-start gap-2 h-24">...</div>
<div class="flex items-center gap-2 h-24">...</div>
<div class="flex items-end gap-2 h-24">...</div>
```

## Estirar

`items-stretch` (el valor por defecto de CSS) hace que cada elemento llene
el eje transversal:

```html
<div class="flex items-stretch h-24">
  <div>...</div>
  <div>...</div>
</div>
```

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $align-items-map: (
    "start": flex-start,
    "center": center,
    "end": flex-end,
    "stretch": stretch
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-flex-utilities();
```
