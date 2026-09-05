# Grid

Mixins de layout CSS Grid: contenedores, colocacion, apilamiento y masonry.

# Grid

Mixins de layout CSS Grid en el modulo `mixins`. Variables configurables:
`$grid-gap-default: f.rem(10px) !default` y
`$grid-columns-default: 12 !default`.

```scss
@use "katanakit-css/src/scss/mixins" as m;
```

## Columnas responsivas

| Mixin | Comportamiento |
| --- | --- |
| `m.grid-responsive($min-size, $mode: fill, $max-size: 1fr, $gap: null)` | `grid-template-columns: repeat(auto-fill|auto-fit, minmax(min, max))`. `$mode` es `fill` o `fit` (error en caso contrario). |
| `m.grid-autofill($min-size, $max-size: 1fr, $gap: null)` | Atajo para `fill`. |
| `m.grid-autofit($min-size, $max-size: 1fr, $gap: null)` | Atajo para `fit`. |
| `m.grid-fixed-columns($col-width, $gap: null)` | `repeat(auto-fill, <width>)` — ancho de columna fijo, sin minmax. |
| `m.grid-breakpoint-columns($columns-map, $gap: $grid-gap-default, $align-items: stretch)` | Diferentes conteos de columnas por breakpoint. `$columns-map` usa una clave `default` (usada por debajo de `sm`) mas una clave por breakpoint. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.cards { @include m.grid-autofill(240px, 1fr, 1rem); }

.dashboard {
  @include m.grid-breakpoint-columns(("default": 1, "md": 2, "xl": 4), 1rem);
}
```

## Contenedores de layout

| Mixin | Comportamiento |
| --- | --- |
| `m.grid-container($cols: 12, $rows: null, $gap: $grid-gap-default, $place-items: center, $place-content: center, $align-items: null, $justify-content: null)` | Columnas `1fr` iguales. Usa `place-items`/`place-content`, o `align-items`/`justify-content` cuando los parametros place-* son `null`. |
| `m.grid-center($gap: null)` | Atajo de centrado (`place-items`/`place-content: center`). |
| `m.grid-gap($value: $grid-gap-default, $var-name: --grid-gap)` | Establece una propiedad personalizada y `gap: var(--grid-gap)`. |
| `m.grid-areas($areas, $gap: null)` | `grid-template-areas` con la base de display. |
| `m.grid-area($name)` | Asigna un elemento a un area de plantilla. |
| `m.subgrid($axis: both)` | `grid-template-columns`/`rows: subgrid` para `column`/`row`/`both`. |
| `m.grid-masonry($axis: block, $gap: null)` | **Experimental** masonry via `grid-template-rows: masonry` (el soporte del navegador no es universal). `$axis: inline` mueve el eje masonry a columnas. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.page {
  @include m.grid-areas(
    "header header"
    "sidebar main"
    "footer footer",
    1rem
  );

  .header  { @include m.grid-area("header"); }
  .sidebar { @include m.grid-area("sidebar"); }
  .main    { @include m.grid-area("main"); }
  .footer  { @include m.grid-area("footer"); }
}
```

## Elementos de grid

| Mixin | Comportamiento |
| --- | --- |
| `m.grid-span($cols: 1, $rows: null)` | `grid-column: span N` (+ `grid-row: span N` cuando se establece `$rows`). |
| `m.grid-placement($col-start: 1, $col-end: -1, $row-start: null, $row-end: null)` | `grid-column: start / end` y, cuando se proporcionan ambas filas, `grid-row`. |
| `m.grid-item-center` | `place-self: center center`. |
| `m.grid-item-full($col: "1 / -1", $row: null)` | Ocupa todas las columnas (personalizable via `$col`). |

```scss
@use "katanakit-css/src/scss/mixins" as m;

main   { @include m.grid-placement(2, 4, 1, 2); } // grid-column: 2/4; grid-row: 1/2
header { @include m.grid-item-full(); }            // grid-column: 1 / -1
.card  { @include m.grid-span(3); }
```

## Apilar elementos

| Mixin | Comportamiento |
| --- | --- |
| `m.grid-stack($dp: grid, $parent: null, $children: ("*"), $col: 1, $row: 1)` | Convierte el elemento actual (o el `.parent` nombrado) en un grid y coloca cada selector `$child` en la misma celda en `($col, $row)`, de modo que los hijos se superponen. |
| `m.grid-stack-item($col: 1, $row: 1)` | Coloca el elemento actual en una celda de apilamiento. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.stack { @include m.grid-stack(grid, null, ("span", "div"), 2, 1); }
// .stack { display: grid }
// .stack > span, .stack > div { grid-column: 2 / 3; grid-row: 1 / 2; }
```

`grid-stack` requiere numeros sin unidad `>= 1` y acepta `$parent` con o sin
punto inicial.

## Ejemplo de dashboard

Un layout de dashboard completo que combina contenedores, spans y breakpoints:

```scss
@use "katanakit-css/src/scss/mixins" as m;
@use "katanakit-css/src/scss/variables" as v;

.dashboard {
  @include m.grid-container(12, $gap: 1rem, $place-items: stretch, $place-content: stretch);

  .sidebar {
    @include m.grid-span(3);
  }

  .content {
    @include m.grid-span(9);
  }

  @include m.md-down {
    grid-template-columns: 1fr;

    .sidebar,
    .content {
      @include m.grid-span(1);
    }
  }
}

.cards { @include m.grid-responsive(280px, fill, 1fr, 1.5rem); }

.pinned-card { @include m.grid-placement(2, 4, 1, 2); }

.modal-overlay {
  @include m.grid-center(0);

  .modal {
    @include m.grid-item-center;
    max-width: v.container("md");
  }
}
```

Consulta [Ejemplos](/es/reference/examples/) para el codigo fuente completo
de `grid-dashboard.scss`.
