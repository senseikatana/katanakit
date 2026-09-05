# Flexbox

Mixins de layout Flexbox: contenedores, espaciado y dimensiones de elementos.

# Flexbox

Mixins de layout Flexbox en el modulo `mixins`.

```scss
@use "katanakit-css/src/scss/mixins" as m;
```

## Contenedores

| Mixin | Comportamiento |
| --- | --- |
| `m.flex-container($direction: row, $wrap: nowrap, $gap: null, $align-items: stretch, $justify-content: flex-start, $align-content: normal, $place-items: null, $place-content: null)` | Display flex con direccion/envoltura. `place-items` tiene prioridad sobre `align-items`; `place-content` tiene prioridad sobre `justify-content`/`align-content`. |
| `m.flex-center($gap: null)` | Atajo de centrado (`place-items`/`place-content: center`). |
| `m.flex-gap($value: 1rem, $var-name: --flex-gap)` | Establece una propiedad personalizada y `gap: var(--flex-gap)`. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.toolbar { @include m.flex-container(row, nowrap, 0.5rem, center, space-between); }
.hero    { @include m.flex-center(2rem); }
.list    { @include m.flex-gap(1.5rem); }
```

## Dimensiones de elementos

| Mixin | Comportamiento |
| --- | --- |
| `m.flex-grow($grow: 1)` | `flex-grow`. |
| `m.flex-shrink($shrink: 1)` | `flex-shrink`. |
| `m.flex-basis($basis: auto)` | `flex-basis`. |
| `m.flex-item($grow: 1, $shrink: 1, $basis: auto)` | `flex: <grow> <shrink> <basis>`. |
| `m.flex-item-center` | `align-self: center`. |
| `m.flex-item-full` | `flex: 1 1 100%`. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.logo   { @include m.flex-item(0, 0, auto); } // nunca crece, nunca se encoge
.search { @include m.flex-item-full(); }       // llena el espacio restante
.badge  { @include m.flex-item-center; }
```

## Ejemplo: barra de navegacion

```scss
@use "katanakit-css/src/scss/mixins" as m;

.navbar {
  @include m.flex-container(row, nowrap, 1rem, center, space-between);

  .brand {
    @include m.flex-item(0, 0, auto);
  }

  .spacer {
    @include m.flex-item(1, 1, auto); // empuja el resto a los bordes
  }

  .actions {
    @include m.flex-container(row, nowrap, 0.5rem, center, flex-end);
  }
}
```

Consulta las [utilidades Flexbox](/es/utilities/flex-direction/) para los
equivalentes basados en clases (`.flex`, `.items-*`, `.justify-*`, `.gap-*`).
