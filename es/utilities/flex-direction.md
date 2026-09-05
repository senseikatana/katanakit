# Direccion flex

Utilidades para controlar la direccion de los elementos flex.

# Direccion flex

Utilidades para controlar la direccion de los elementos flex. Requiere un
contenedor flex (`.flex` o `.inline-flex`; consulta [Display](/es/utilities/display/)).

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.flex-row` | `flex-direction: row;` |
| `.flex-row-reverse` | `flex-direction: row-reverse;` |
| `.flex-col` | `flex-direction: column;` |
| `.flex-col-reverse` | `flex-direction: column-reverse;` |

## Uso basico

Organiza los elementos en una fila (por defecto) o una columna:

<div class="kk-demo">
  <div class="flex flex-row gap-2">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">2</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">3</div>
  </div>
  <div class="flex flex-col gap-2">
    <div class="p-4 bg-info-200 text-info-700 rounded-md">1</div>
    <div class="p-4 bg-info-300 text-info-700 rounded-md">2</div>
    <div class="p-4 bg-info-200 text-info-700 rounded-md">3</div>
  </div>
</div>

```html
<div class="flex flex-row gap-2">...</div>
<div class="flex flex-col gap-2">...</div>
```

## Invertir la direccion

`flex-row-reverse` y `flex-col-reverse` mantienen el mismo eje de layout
pero invierten el orden visual de los elementos:

<div class="kk-demo">
  <div class="flex flex-row-reverse gap-2">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">1</div>
    <div class="p-4 bg-purple-300 text-purple-700 rounded-md">2</div>
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">3</div>
  </div>
</div>

```html
<div class="flex flex-row-reverse gap-2">...</div>
```

## Personalizar

Las clases de direccion se generan desde `$flex-direction-map` en el modulo
`mixins`:

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $flex-direction-map: (
    "row": row,
    "col": column
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-flex-utilities();
```
