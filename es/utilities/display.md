# Display

Utilidades para controlar el tipo de display de un elemento.

# Display

Utilidades para controlar el tipo de caja de display de un elemento. Generadas
desde el mapa `$display-values` (un mapa para que `hidden` pueda mapear a
`none`).

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.block` | `display: block;` |
| `.inline-block` | `display: inline-block;` |
| `.inline` | `display: inline;` |
| `.flex` | `display: flex;` |
| `.inline-flex` | `display: inline-flex;` |
| `.grid` | `display: grid;` |
| `.inline-grid` | `display: inline-grid;` |
| `.table` | `display: table;` |
| `.table-row` | `display: table-row;` |
| `.table-cell` | `display: table-cell;` |
| `.hidden` | `display: none;` |
| `.contents` | `display: contents;` |

## Uso basico

Establece el tipo de display de un elemento:

<div class="kk-demo">
  <div class="grid gap-2">
    <div class="block p-4 bg-purple-200 text-purple-700 rounded-md">block</div>
    <div class="inline-block p-4 bg-purple-200 text-purple-700 rounded-md">inline-block</div>
    <div class="inline p-4 bg-purple-200 text-purple-700 rounded-md">inline</div>
  </div>
</div>

```html
<div class="block ...">block</div>
<div class="inline-block ...">inline-block</div>
<div class="inline ...">inline</div>
```

## Usar flex y grid

`flex` y `grid` crean los contenedores sobre los que funciona cada utilidad
de flexbox y grid:

<div class="kk-demo">
  <div class="flex gap-2">
    <div class="p-4 bg-info-200 text-info-700 rounded-md">A</div>
    <div class="p-4 bg-info-300 text-info-700 rounded-md">B</div>
    <div class="p-4 bg-info-200 text-info-700 rounded-md">C</div>
  </div>
  <div class="grid gap-2" style="grid-template-columns: repeat(3, 1fr)">
    <div class="p-4 bg-success-200 text-success-700 rounded-md">1</div>
    <div class="p-4 bg-success-200 text-success-700 rounded-md">2</div>
    <div class="p-4 bg-success-200 text-success-700 rounded-md">3</div>
  </div>
</div>

```html
<div class="flex gap-2">...</div>
<div class="grid gap-2" style="grid-template-columns: repeat(3, 1fr)">...</div>
```

## Ocultar elementos

Usa `hidden` para eliminar un elemento del flujo del documento por completo:

<div class="kk-demo">
  <div class="flex gap-2">
    <div class="p-4 bg-purple-200 text-purple-700 rounded-md">visible</div>
    <div class="hidden p-4 bg-purple-200 text-purple-700 rounded-md">hidden</div>
  </div>
</div>

```html
<div class="flex gap-2">
  <div class="p-4 ...">visible</div>
  <div class="hidden p-4 ...">hidden</div>
</div>
```

A diferencia de `opacity-0`, `hidden` no ocupa espacio ni recibe eventos de
puntero.

## Usar displays de tabla

Las utilidades `table-*` te permiten aplicar semantica de layout de tabla a
cualquier estructura:

```html
<div class="table">
  <div class="table-row">
    <div class="table-cell p-2">Celda A</div>
    <div class="table-cell p-2">Celda B</div>
  </div>
</div>
```

## Personalizar

Sobreescribe el mapa `$display-values` en el modulo `mixins` antes de generar
las utilidades de layout:

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $display-values: (
    block: block,
    flex: flex,
    grid: grid,
    hidden: none
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
