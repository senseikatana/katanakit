# Justify Content

Utilidades para controlar como se distribuyen los elementos flex en el eje principal.

# Justify Content

Utilidades para controlar como se distribuyen los elementos flex a lo largo
del eje principal. Requiere un contenedor flex (`.flex` o `.inline-flex`).

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.justify-start` | `justify-content: flex-start;` |
| `.justify-center` | `justify-content: center;` |
| `.justify-end` | `justify-content: flex-end;` |
| `.justify-between` | `justify-content: space-between;` |
| `.justify-around` | `justify-content: space-around;` |
| `.justify-evenly` | `justify-content: space-evenly;` |

## Uso basico

<div class="kk-demo">
  <div class="flex justify-start gap-2 w-64">
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">2</div>
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">3</div>
  </div>
  <div class="flex justify-center gap-2 w-64">
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">2</div>
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">3</div>
  </div>
  <div class="flex justify-end gap-2 w-64">
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">2</div>
    <div class="p-2 bg-purple-200 text-purple-700 rounded-md">3</div>
  </div>
  <div class="flex justify-between w-64">
    <div class="p-2 bg-info-200 text-info-700 rounded-md">1</div>
    <div class="p-2 bg-info-200 text-info-700 rounded-md">2</div>
    <div class="p-2 bg-info-200 text-info-700 rounded-md">3</div>
  </div>
  <div class="flex justify-around w-64">
    <div class="p-2 bg-success-200 text-success-700 rounded-md">1</div>
    <div class="p-2 bg-success-200 text-success-700 rounded-md">2</div>
    <div class="p-2 bg-success-200 text-success-700 rounded-md">3</div>
  </div>
  <div class="flex justify-evenly w-64">
    <div class="p-2 bg-warning-200 text-warning-700 rounded-md">1</div>
    <div class="p-2 bg-warning-200 text-warning-700 rounded-md">2</div>
    <div class="p-2 bg-warning-200 text-warning-700 rounded-md">3</div>
  </div>
</div>

```html
<div class="flex justify-start ...">...</div>
<div class="flex justify-center ...">...</div>
<div class="flex justify-end ...">...</div>
<div class="flex justify-between ...">...</div>
<div class="flex justify-around ...">...</div>
<div class="flex justify-evenly ...">...</div>
```

`justify-between` empuja el primer elemento al inicio y el ultimo al final;
`justify-around` da a cada elemento medios espacios iguales; `justify-evenly`
da a cada espacio el mismo tamano.

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $justify-content-map: (
    "start": flex-start,
    "center": center,
    "end": flex-end,
    "between": space-between,
    "around": space-around,
    "evenly": space-evenly
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-flex-utilities();
```
