# @apply

Compone utilidades dentro de tu SCSS con el registro apply.

# @apply

KatanaKIT CSS incluye un pequeno sistema al estilo `@apply` para que puedas
componer utilidades dentro de tus componentes **sin** reimplementarlas:

```scss
@use "katanakit-css/src/scss/mixins" as m;

.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);
}
```

Dos mixins alimentan el sistema:

| Mixin | Comportamiento |
| --- | --- |
| `m.register-utility($name, $styles)` | Registra una utilidad con nombre. `$styles` es un mapa de declaraciones CSS. |
| `m.apply($utilities...)` | Emite cada declaracion registrada para cada nombre, en orden. Lanza un `@error` nombrando la utilidad problematica cuando una no esta registrada. |

## Uso basico

```scss
@use "katanakit-css/src/scss/mixins" as m;

.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);

  &:hover {
    @include m.apply(shadow-lg);
  }
}

.button {
  @include m.apply(
    inline-flex,
    items-center,
    justify-center,
    px-4,
    py-2,
    rounded-md,
    font-semibold,
    transition-colors
  );

  &:hover {
    @include m.apply(bg-white, text-black);
  }
}
```

Compila a declaraciones puras; sin tiempo de ejecucion, sin clases duplicadas
en el resultado:

```css
.card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  background-color: hsl(0, 0%, 98%);
}
```

## Registrar tus propias utilidades

El registro esta abierto; registra utilidades especificas del proyecto antes
de usarlas:

```scss
@use "katanakit-css/src/scss/mixins" as m;

@include m.register-utility("fade-in", (animation: fade-in 300ms ease));

.hero {
  @include m.apply(fade-in, p-8, text-2xl);
}
```

## Utilidades registradas automaticamente

Cargar el modulo `mixins` registra un gran conjunto de nombres; la mayoria
derivados de los **mismos mapas** que impulsan los generadores de clases, por
lo que los nombres coinciden exactamente con los nombres de las clases (`p-4`,
`m-2`, `gap-4`, `rounded-lg`, `shadow-md`, `z-10`, `duration-200`,
`ease-out`, `opacity-50`, ...).

| Categoria | Nombres registrados |
| --- | --- |
| Display | `block`, `inline-block`, `inline`, `flex`, `inline-flex`, `grid`, `hidden`, `table`, `table-row`, `table-cell`, `contents`, `inline-grid` |
| Flexbox | `flex-row`, `flex-row-reverse`, `flex-col`, `flex-col-reverse`, `flex-wrap`, `flex-nowrap`, `items-start`, `items-center`, `items-end`, `items-stretch`, `justify-start`, `justify-center`, `justify-end`, `justify-between`, `justify-around`, `justify-evenly` |
| Espaciado | para cada clave de `$spacing-map`: `p-*` `px-*` `py-*` `pt-*` `pr-*` `pb-*` `pl-*`, `m-*` `mx-*` `my-*` `mt-*` `mr-*` `mb-*` `ml-*`, `gap-*` `gap-x-*` `gap-y-*` |
| Tipografia | `text-xs` ... `text-4xl`, `text-left`, `text-center`, `text-right`, `font-thin` ... `font-black` |
| Dimensiones | `w-full`, `w-screen`, `w-auto`, `h-full`, `h-screen`, `h-auto` |
| Bordes | `border`, `border-0`, `border-2`, `border-4`, `border-8`, `rounded-none` ... `rounded-full`, `rounded` |
| Efectos | `shadow-none` ... `shadow-2xl` + `shadow` + `shadow-inner`, `opacity-0` ... `opacity-100`, `z-auto` ... `z-tooltip`, `duration-75` ... `duration-1000`, `ease-linear` ... `ease-in-out` |
| Posicion | `static`, `fixed`, `absolute`, `relative`, `sticky` |
| Overflow | `overflow-auto`, `overflow-hidden`, `overflow-scroll`, `overflow-visible` |
| Colores | `text-white`, `text-black`, `bg-white`, `bg-black`, `bg-transparent` |
| Espacio en blanco | `whitespace-nowrap`, `whitespace-pre`, `whitespace-normal`, `wrap-break-word` |

## Utilidades solo en el registro

**Importante.** Registrar una utilidad para `apply` **no** crea una clase CSS.
Un pequeno conjunto de nombres existe solo dentro del registro; puedes usarlos
con `apply()`, pero nunca apareceran como clases en el CSS compilado:

- `flex-1`, `flex-auto`, `flex-none`
- `grid-cols-1`, `grid-cols-2`, `grid-cols-3`, `grid-cols-4`, `grid-cols-6`,
  `grid-cols-12`
- `col-span-full`
- `transition`, `transition-colors`, `transition-opacity`,
  `transition-transform`

```scss
@use "katanakit-css/src/scss/mixins" as m;

.hero-grid {
  @include m.apply(grid, grid-cols-12, gap-4);

  .main { @include m.apply(col-span-full); }
  .aside { @include m.apply(flex-1); }
}
```

```html
<!-- Incorrecto: .flex-1 NO se emite como clase por el framework -->
<div class="flex-1">...</div>
```

## Errores

Aplicar un nombre no registrado falla de forma visible en tiempo de
compilacion:

```scss
@include m.apply(flex, flex-col, text-5xl);
// Error: apply(): utilidad 'text-5xl' no registrada.
//        Usa register-utility() primero.
```

## Paginas relacionadas

- [Primeros pasos](/es/getting-started/) — componer hojas con modulos.
- [Ejemplos](/es/reference/examples/) — el ejemplo de boton/tarjeta completo.
