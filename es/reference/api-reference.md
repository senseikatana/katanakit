# Referencia API

Referencia completa de cada funcion, mixin, mapa y generador.

# Referencia API

Referencia completa de `katanakit-css` **0.1.0** (no publicado). Cada firma,
valor por defecto y clave de mapa en este documento fue verificado contra el
codigo fuente en `src/scss/`. Este archivo es solo documentacion; nunca
modifica el codigo.

---

## Namespaces de modulos

Todos los modulos se consumen con `@use` en minusculas y un namespace
explicito:

```scss
@use "katanakit-css/src/scss/functions"   as f;
@use "katanakit-css/src/scss/variables"   as v;
@use "katanakit-css/src/scss/mixins"      as m;
@use "katanakit-css/src/scss/utilities"   as u;
```

Cuando los modulos forman parte de tu propio arbol de codigo fuente, las
rutas se vuelven relativas, por ejemplo `@use "functions" as f;`. La entrada
publica `src/scss/main.scss` carga `reset`, `variables`, `functions`, `mixins`
y `utilities`, luego llama:

```scss
@include v.generate-css-tokens();
@include v.generate-css-vars();
@include v.all-utilities();
@include u.generate-all-utilities();
```

---

## Funciones (`as f`)

Fuente: `_functions.scss`.

### Conversion de unidades

| Firma | Comportamiento |
| --- | --- |
| `rem($size)` | Convierte px o numeros sin unidad a rem usando `$base-font-size` (por defecto `16px`). `rem(16px)` y `rem(16)` ambos devuelven `1rem`. |
| `px($size)` | Convierte rem o numeros sin unidad a px. `px(1)` devuelve `16px`, `px(1.5rem)` devuelve `24px`. |
| `to-unit($value, $unit: "rem")` | Anade una unidad (`rem`, `px`, `em` o `%`) a un numero ya sin unidad. Los valores que llevan unidad se devuelven sin cambios. Lanza `@error` con una unidad invalida. |
| `strip-unit($value)` | Elimina la unidad, por ejemplo `strip-unit(16px)` devuelve `16`. |

`$base-font-size: 16px !default` es el valor por defecto del navegador.
Solo sobreescribelo si tu proyecto cambia el tamano de fuente raiz (es una
linea base en *px*, no una linea base "rem" de 10px).

### Tipografia fluida

| Firma | Comportamiento |
| --- | --- |
| `fluid($min, $max, $min-vw: 320px, $max-vw: 1920px)` | Devuelve una expresion `clamp()` que interpola `$min` -> `$max` a traves de `$min-vw` -> `$max-vw`. Las entradas sin unidad se tratan como px. |

```scss
font-size: f.fluid(16px, 24px);
// clamp(16px, 0.5vw + 14.4px, 24px)

font-size: f.fluid(1rem, 2rem, 768px, 1280px);
// clamp(1rem, 0.1953125vw - 0.5px, 2rem)
```

### Helpers de color

| Firma | Comportamiento |
| --- | --- |
| `tint($color, $amount: 10%)` | Mezcla `$color` con blanco. |
| `shade($color, $amount: 10%)` | Mezcla `$color` con negro. |
| `saturate-color($color, $amount: 10%)` | Aumenta la saturacion via `color.scale`. |
| `desaturate-color($color, $amount: 10%)` | Reduce la saturacion via `color.scale`. |
| `complement($color)` | Devuelve el complemento de tono. |
| `contrast($color, $light: white, $dark: black)` | Elige un color de texto legible a partir del brillo percibido de `$color`: los colores brillantes devuelven `$dark`, los oscuros devuelven `$light`. |
| `color-mix-var($var-name, $amount: 10%, $mix-with: white)` | Emite `color-mix(in srgb, var(--name) <pct>, <mix-with>)`. Acepta un nombre de variable desnudo (`"--info-500"`) o una expresion `var(...)` completa. |
| `to-class($key)` | Escapa una clave de mapa para usar en un selector de clase. `.` se convierte en `\.`, `/` en `\/`, `%` en `\%`. `to-class("1-5")` devuelve el string `1-5` (los puntos/guiones de las *claves* mismas se usan literalmente por los generadores). |

Todas las funciones de color que reciben un no-color lanzan un `@error`.

---

## Variables / tokens (`as v`)

Fuente: `_variables.scss`.

### Mapas de tokens (todos `!default`)

**`$font-families`**

| Clave | Valor |
| --- | --- |
| `sans-serif` | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| `serif` | `"Times New Roman", Trebuchet, Geneva, serif` |
| `mono` | `monospace` |

**`$shadow-sizes`**

| Clave | Valor |
| --- | --- |
| `default` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |
| `xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` |
| `2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` |
| `inner` | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)` |

**`$container-sizes`** — `sm` 24rem . `md` 28rem . `lg` 32rem . `xl` 36rem .
`2xl` 42rem . `3xl` 48rem . `4xl` 56rem . `5xl` 64rem . `6xl` 72rem.

**`$breakpoint-sizes`** — `xs` 0 . `sm` 640px . `md` 768px . `lg` 1024px .
`xl` 1280px . `2xl` 1536px . `3xl` 1920px.

**`$spacing-scale`**

`0` 0 . `1` 0.25rem . `2` 0.5rem . `3` 0.75rem . `4` 1rem . `5` 1.25rem .
`6` 1.5rem . `8` 2rem . `10` 2.5rem . `12` 3rem . `16` 4rem . `20` 5rem .
`24` 6rem . `32` 8rem.

**`$radius`**

`default` 0.25rem . `sm` 0.125rem . `md` 0.375rem . `lg` 0.5rem .
`xl` 0.75rem . `2xl` 1rem . `3xl` 1.5rem . `full` 9999px.

**`$z-layers`**

`auto` auto . `0` 0 . `10` 10 . `20` 20 . `30` 30 . `40` 40 . `50` 50 .
`dropdown` 1000 . `sticky` 1020 . `fixed` 1030 . `modal` 1040 .
`popover` 1050 . `tooltip` 1060.

**`$transition-durations`** — `75` 75ms . `100` 100ms . `150` 150ms .
`200` 200ms . `300` 300ms . `500` 500ms . `700` 700ms . `1000` 1000ms.

**`$transition-easings`**

`linear` linear . `in` `cubic-bezier(0.4, 0, 1, 1)` .
`out` `cubic-bezier(0, 0, 0.2, 1)` .
`in-out` `cubic-bezier(0.4, 0, 0.2, 1)`.

### Funciones de acceso

| Firma | Devuelve | Notas |
| --- | --- | --- |
| `font-family($name)` | lista de fuentes | `sans-serif` / `serif` / `mono`. |
| `shadow($size: "default")` | lista/valor de sombra | `default` ... `inner`. |
| `container($size)` | longitud | `sm` ... `6xl`. |
| `breakpoint($name)` | longitud en px | `xs` ... `3xl`. |
| `spacing($size)` | longitud | Acepta un numero **o** una clave string (`spacing(4)` = `spacing("4")`). |
| `radius($size: "default")` | longitud | `default` ... `full`. |
| `z($layer)` | numero/`auto` | Acepta un numero o un string (`z(50)` = `z("50")`, mas capas con nombre). |
| `duration($ms)` | duracion | Acepta un numero o string (`duration(200)` = `duration("200")`). |
| `ease($name: "in-out")` | funcion de temporizacion | `linear` / `in` / `out` / `in-out`. |

Cada accesador lanza un `@error` en tiempo de compilacion que enumera las
claves validas cuando la clave solicitada falta.

### `@mixin generate-css-tokens(...)`

```scss
@mixin generate-css-tokens(
  $fonts: true, $shadows: true, $containers: true, $spacing: true,
  $radius: true, $z: true, $durations: true, $easings: true
)
```

Emite las familias de tokens como propiedades personalizadas en `:root`. Pasa
`false` para omitir una familia.

```scss
:root {
  --font-sans-serif: ui-sans-serif, system-ui, ...;
  --shadow-md: ...;
  --container-xl: 36rem;
  --spacing-4: 1rem;
  --z-tooltip: 1060;
  --duration-200: 200ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Los nombres de las variables no llevan prefijo de marca: son exactamente
`--font-*`, `--shadow-*`, `--container-*`, `--spacing-*`, `--radius-*`,
`--z-*`, `--duration-*` y `--ease-*`.

---

## Colores (`as v`)

Fuente: `_variables.scss` (fusionado del antiguo `_colors.scss`).

### Paletas

`$colors` contiene seis paletas con **siete tonos cada una** (100 mas claro
-> 700 mas oscuro), almacenadas como `hsla(...)` y emitidas como `hsl(...)`:

| Paleta | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `neutral` | 0 0% 93% | 0 0% 86% | 0 0% 71% | 0 0% 50% | 0 0% 35% | 0 0% 24% | 0 0% 12% |
| `purple` | 269 60% 93% | 269 70% 86% | 269 70% 71% | 269 66% 50% | 269 66% 35% | 269 60% 24% | 269 50% 12% |
| `info` | 215 95% 93% | 215 95% 86% | 215 95% 71% | 215 95% 50% | 215 95% 35% | 215 95% 24% | 215 95% 12% |
| `warning` | 49 100% 93% | 49 100% 86% | 49 100% 71% | 49 100% 50% | 49 100% 35% | 49 90% 24% | 49 70% 12% |
| `danger` | 3 95% 93% | 3 95% 86% | 3 95% 71% | 3 95% 50% | 3 95% 35% | 3 95% 24% | 3 95% 12% |
| `success` | 147 95% 93% | 147 95% 86% | 147 95% 71% | 147 95% 50% | 147 95% 35% | 147 95% 24% | 147 95% 12% |

Los valores de las celdas anteriores son `hsl(tono, saturacion, luminosidad)`.
No hay paletas adicionales y no hay nombres de color especificos de marca
conectados al framework (consulta `colors-palette.md` para la paleta de marca
personal, que es material de referencia solamente).

**`$special-colors`** — `black` `hsl(0, 0%, 3%)` . `white` `hsl(0, 0%, 98%)` .
`transparent` `transparent` . `current` `currentColor`.

**`$shades: (100, 200, 300, 400, 500, 600, 700) !default`** — orden de
iteracion para funciones impulsadas por tonos.

### Funciones de acceso

| Firma | Devuelve |
| --- | --- |
| `get-color($name, $shade: 300, $alpha: 1)` | Un tono de paleta (o un color especial cuando `$name` es especial). Aplica alfa cuando `$alpha != 1`. |
| `get($name, $alpha: 1)` | Abreviatura: `get-color($name, 500, $alpha)`. |
| `alpha($name, $shade: 500, $alpha: 0.5)` | Abreviatura para variantes transparentes: `alpha("info", 300, 0.5)` -> `hsla(215, 95%, 71%, 0.5)`. |

```scss
color: v.get-color("neutral", 500);  // hsl(0, 0%, 35%)
color: v.get("info");                // tono 500
border: 1px solid v.alpha("warning", 400, 0.25);
```

### `@mixin generate-css-vars($root: ":root", $palettes: null, $include-special: true)`

Emite una propiedad personalizada por tono mas los colores especiales:

```scss
:root {
  --neutral-100: hsl(0, 0%, 93%);
  /* ... cada paleta y tono ... */
  --info-500: hsl(215, 95%, 35%);
  --white: hsl(0, 0%, 98%);
  --black: hsl(0, 0%, 3%);
  --transparent: transparent;
  --current: currentColor;
}
```

`$palettes` acepta:

- `null` — todas las paletas;
- un nombre de paleta o lista de nombres — solo esas paletas (por ejemplo
  `"info"`, `(neutral, success)`);
- un **mapa** — emitido tal cual. Asi es como `theme()` alimenta las paletas
  invertidas a un selector raiz personalizado.

### Mixins de utilidad

| Mixin | Clases |
| --- | --- |
| `text-utilities($palettes: null, $special: true)` | `.text-{palette}-{shade}`, `.text-{special}` (por ejemplo `.text-white`, `.text-neutral-500`, `.text-info-400`) — propiedad `color`. |
| `bg-utilities($palettes: null, $special: true)` | `.bg-{palette}-{shade}`, `.bg-{special}` — propiedad `background-color`. |
| `border-utilities($palettes: null, $special: true)` | `.border-{palette}-{shade}`, `.border-{special}` — propiedad `border-color`. |
| `hover-utilities($palettes: null, $special: true)` | `.hover-text-{palette}-{shade}:hover`, `.hover-bg-{palette}-{shade}:hover`, mas `.hover-text-{special}:hover` / `.hover-bg-{special}:hover`. |
| `all-utilities($palettes: null, $special: true)` | Llama los cuatro mixins anteriores. |

Las clases de utilidad usan **valores literales de color**, no referencias
`var()`. Las propiedades personalizadas emitidas por `generate-css-vars()`
estan ahi para tus propias reglas.

### `@mixin theme($mode, $overrides: ())`

Emite las paletas bajo `:root[data-theme="#{$mode}"]` (sin colores
especiales). Cuando `$mode: "dark"`, cada paleta se **invierte** para que la
clave del tono mas claro contenga el color mas oscuro y viceversa: tono
`100 <-> 700`, `200 <-> 600`, `300 <-> 500`. `$overrides` se fusiona sobre
el mapa resultante.

---

## Tema (`as v`)

Fuente: `_variables.scss` (fusionado del antiguo `_theme.scss`).

| Firma | Comportamiento |
| --- | --- |
| `theme($mode: "dark", $overrides: ())` | Hook delgado que delega en `v.theme()`. |

```scss
@include v.theme("dark"); // invierte paletas, emite :root[data-theme="dark"]
```

---

## Breakpoints (`as m`)

Fuente: `_mixins.scss` (fusionado del antiguo `_breakpoints.scss`).

### `$breakpoints` (todos `!default`)

`xs` 0 . `sm` 640px . `md` 768px . `lg` 1024px . `xl` 1280px .
`2xl` 1536px . `3xl` 1920px.

Las claves que contienen digitos (`2xl`, `3xl`) son nombres de primera
clase; pasalas como strings.

### Mixin generico

| Firma | Comportamiento |
| --- | --- |
| `breakpoint($from, $direction: up, $to: null)` | Abre una consulta `@media`. Acepta una clave o un numero px en bruto. |
| `bp($args...)` | Alias que reenvia argumentos a `breakpoint()`. |

Direcciones:

- `up` — `(min-width: X)`
- `down` — `(max-width: calc(X - 0.02px))`
- `only` — `(min-width: X) and (max-width: calc(Y - 0.02px))`, requiere `$to`
- `between` — `(min-width: X) and (max-width: Y)`, requiere `$to`

```scss
@use "katanakit-css/src/scss/mixins" as m;

@include m.breakpoint("lg", down) { ... }
@include m.bp("md", up) { ... } // el alias reenvia a breakpoint("md", up)
```

### Mixins con nombre

`up`: `xs`, `sm`, `md`, `lg`, `xl`, `xxl` (alias para la clave `2xl`),
`xxxl` (alias para la clave `3xl`).

`down`: `xs-down`, `sm-down`, `md-down`, `lg-down`, `xl-down`,
`x2l-down` / `x3l-down`, mas los alias canonicos
`xxl-down` (= `x2l-down`) y `xxxl-down` (= `x3l-down`).

```scss
@include m.xxl { ... }      // @media (min-width: 1536px)
@include m.xxxl { ... }     // @media (min-width: 1920px)
@include m.x2l-down { ... } // @media (max-width: calc(1536px - 0.02px))
```

### Consultas de caracteristicas

`portrait` . `landscape` . `reduced-motion` . `hoverable`
(`(hover: hover) and (pointer: fine)`) . `touch`
(`(hover: none) and (pointer: coarse)`) . `dark-mode` . `light-mode`.

---

## Grid (`as m`)

Fuente: `_mixins.scss` (fusionado del antiguo `_grid.scss`).

Variables configurables: `$grid-gap-default: f.rem(10px) !default` y
`$grid-columns-default: 12 !default`.

### Columnas responsivas

| Mixin | Comportamiento |
| --- | --- |
| `grid-responsive($min-size, $mode: fill, $max-size: 1fr, $gap: null)` | `grid-template-columns: repeat(auto-fill|auto-fit, minmax(min, max))`. `$mode` es `fill` o `fit` (error en caso contrario). |
| `grid-autofill($min-size, $max-size: 1fr, $gap: null)` | Atajo para `fill`. |
| `grid-autofit($min-size, $max-size: 1fr, $gap: null)` | Atajo para `fit`. |
| `grid-fixed-columns($col-width, $gap: null)` | `repeat(auto-fill, <width>)`. |
| `grid-breakpoint-columns($columns-map, $gap: $grid-gap-default, $align-items: stretch)` | Diferentes conteos de columnas por breakpoint. `$columns-map` usa una clave `default` (usada por debajo de `sm`) y una clave por breakpoint. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.cards { @include m.grid-autofill(240px, 1fr, 1rem); }

.dashboard {
  @include m.grid-breakpoint-columns(("default": 1, "md": 2, "xl": 4), 1rem);
}
```

### Contenedores de layout

| Mixin | Comportamiento |
| --- | --- |
| `grid-container($cols: 12, $rows: null, $gap: $grid-gap-default, $place-items: center, $place-content: center, $align-items: null, $justify-content: null)` | Columnas `1fr` iguales; `place-items`/`place-content`, o `align-items`/`justify-content` cuando los parametros place-* son `null`. |
| `grid-center($gap: null)` | Atajo de centrado (`place-items`/`place-content: center`). |
| `grid-gap($value: $grid-gap-default, $var-name: --grid-gap)` | Establece una propiedad personalizada y `gap: var(--grid-gap)`. |
| `grid-areas($areas, $gap: null)` | `grid-template-areas` con una base de display. |
| `grid-area($name)` | Asigna un elemento a un area de plantilla. |
| `grid-masonry($axis: block, $gap: null)` | **Experimental** masonry via `grid-template-rows: masonry` (el soporte del navegador no es universal). `$axis: inline` mueve el eje masonry a columnas. |

### Elementos de grid

| Mixin | Comportamiento |
| --- | --- |
| `grid-span($cols: 1, $rows: null)` | `grid-column: span N` (+ `grid-row: span N`). |
| `grid-placement($col-start: 1, $col-end: -1, $row-start: null, $row-end: null)` | `grid-column: start / end` y, cuando se proporcionan, `grid-row`. |
| `grid-item-center` | `place-self: center center`. |
| `grid-item-full($col: "1 / -1", $row: null)` | Ocupa todas las columnas (personalizable con el string `$col`). |

```scss
main { @include m.grid-placement(2, 4, 1, 2); }  // grid-column: 2/4; grid-row: 1/2
header { @include m.grid-item-full(); }           // grid-column: 1 / -1
```

### Apilamiento

| Mixin | Comportamiento |
| --- | --- |
| `grid-stack($dp: grid, $parent: null, $children: ("*"), $col: 1, $row: 1)` | Convierte el elemento actual (o un `.parent` nombrado) en un grid y coloca cada selector `$child` en la misma celda en `($col, $row)` para que los hijos se superpongan. |
| `grid-stack-item($col: 1, $row: 1)` | Coloca el elemento actual en una celda de apilamiento. |

```scss
.stack { @include m.grid-stack(grid, null, ("span", "div"), 2, 1); }
// .stack { display: grid } y .stack > span, .stack > div colocados en 2/3 x 1/2
```

`grid-stack` requiere numeros sin unidad `>= 1` y acepta `$parent` con o sin
punto inicial.

---

## Flex (`as m`)

Fuente: `_mixins.scss` (fusionado del antiguo `_flex.scss`).

| Mixin | Comportamiento |
| --- | --- |
| `flex-container($direction: row, $wrap: nowrap, $gap: null, $align-items: stretch, $justify-content: flex-start, $align-content: normal, $place-items: null, $place-content: null)` | Display flex con direccion/envoltura; `place-items` tiene prioridad sobre `align-items`, `place-content` tiene prioridad sobre `justify-content`/`align-content`. |
| `flex-center($gap: null)` | Atajo de centrado. |
| `flex-gap($value: 1rem, $var-name: --flex-gap)` | Establece una propiedad personalizada y `gap: var(--flex-gap)`. |
| `flex-grow($grow: 1)` | `flex-grow`. |
| `flex-shrink($shrink: 1)` | `flex-shrink`. |
| `flex-basis($basis: auto)` | `flex-basis`. |
| `flex-item($grow: 1, $shrink: 1, $basis: auto)` | `flex: <grow> <shrink> <basis>`. |
| `flex-item-center` | `align-self: center`. |
| `flex-item-full` | `flex: 1 1 100%`. |

```scss
.toolbar { @include m.flex-container(row, nowrap, 0.5rem, center, space-between); }
.logo    { @include m.flex-item(0, 0, auto); }
```

---

## Utilidades (`as u`)

Fuente: `_utilities.scss`. Consolida los antiguos submodulos `partials/utils/`
(maps, spacing, sizing, flex, effects, layout, core) en un solo modulo.

### Mapas de tokens de utilidad (todos `!default`)

Los mapas de sizing, spacing, gap, font-size y border-width viven en
`_utilities.scss`. Los mapas restantes (`$shadow-map`, `$radius-map`,
`$z-layers-map`, `$transition-duration-map`, `$transition-timing-map`,
`$opacity-values`, `$font-weight-values`, `$text-align-values`,
`$display-values`, `$position-values`, `$overflow-values`,
`$white-space-list`, `$overflow-wrap-list`, `$flex-direction-map`,
`$flex-wrap-list`, `$align-items-map`, `$justify-content-map`) viven en
`_mixins.scss`, donde se comparten con el registro `@apply`.

**`$sizing-map`** — valores de `width`/`height`/min/max:

`0` 0 . `base` 1px . `05` 0.125rem . `1` 0.25rem . `2` 0.5rem . `3` 0.75rem .
`4` 1rem . `5` 1.25rem . `6` 1.5rem . `8` 2rem . `10` 2.5rem . `12` 3rem .
`16` 4rem . `20` 5rem . `24` 6rem . `32` 8rem . `40` 10rem . `48` 12rem .
`64` 16rem . `auto` `auto` . `full` `100%` . `screen` `100vw` . `min`
`min-content` . `max` `max-content` . `fit` `fit-content`.

**`$spacing-map`** — valores de padding/margin/gap (compartido por el
generador de clases y el registro `@apply`):

`0` 0 . `05` 0.125rem . `base` 1px . `1` 0.25rem . `1-5` 0.375rem .
`2` 0.5rem . `2-5` 0.625rem . `3` 0.75rem . `3-5` 0.875rem . `4` 1rem .
`5` 1.25rem . `6` 1.5rem . `7` 1.75rem . `8` 2rem . `9` 2.25rem .
`10` 2.5rem . `11` 2.75rem . `12` 3rem . `14` 3.5rem . `16` 4rem .
`20` 5rem . `24` 6rem . `28` 7rem . `32` 8rem . `36` 9rem . `40` 10rem .
`44` 11rem . `48` 12rem . `52` 13rem . `56` 14rem . `60` 15rem .
`64` 16rem . `72` 18rem . `80` 20rem . `96` 24rem.

**`$font-size-map`** — `xs` 0.75rem . `sm` 0.875rem . `base` 1rem .
`lg` 1.125rem . `xl` 1.25rem . `2xl` 1.5rem . `3xl` 1.875rem . `4xl` 2.25rem.
Emitido automaticamente como `.text-xs` ... `.text-4xl`.

**`$border-width-map`** — `0` 0 . `2` 2px . `4` 4px . `8` 8px. Emitido
automaticamente como `.border-0`/`.border-2`/`.border-4`/`.border-8`;
`.border` (`1px solid`) tambien se emite.

**`$flex-direction-map`** — `row`, `row-reverse`, `col`, `col-reverse`.
**`$flex-wrap-list`** — `wrap`, `nowrap`.
**`$align-items-map`** — `start` (flex-start), `center`, `end` (flex-end),
`stretch`.
**`$justify-content-map`** — `start`, `center`, `end`, `between`
(space-between), `around` (space-around), `evenly` (space-evenly).

**`$shadow-map`** (efectos) — `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `inner`.
**`$radius-map`** — `none` 0 . `sm` 0.125rem . `md` 0.375rem . `lg` 0.5rem .
`xl` 0.75rem . `2xl` 1rem . `3xl` 1.5rem . `full` 9999px.
**`$z-layers-map`** — `auto`, `0`, `10`, `20`, `30`, `40`, `50`, `dropdown`,
`sticky`, `fixed`, `modal`, `popover`, `tooltip`.
**`$transition-duration-map`** — `75`, `100`, `150`, `200`, `300`, `500`,
`700`, `1000` (ms).
**`$transition-timing-map`** — `linear`, `in`, `out`, `in-out`.
**`$opacity-values`** — `0`, `5`, `10`, `20`, `25`, `30`, `40`, `50`, `60`,
`70`, `75`, `80`, `90`, `95`, `100`.

**`$font-weight-values`** — `thin` 100 . `extralight` 200 . `light` 300 .
`normal` 400 . `medium` 500 . `semibold` 600 . `bold` 700 . `extrabold` 800 .
`black` 900.
**`$text-align-values`** — `left`, `center`, `right`, `justify`.

**`$display-values`** (un mapa para que `hidden` pueda mapear a `none`) —
`block`, `inline-block`, `inline`, `flex`, `inline-flex`, `grid`,
`inline-grid`, `table`, `table-row`, `table-cell`, `hidden` (`none`),
`contents`.
**`$position-values`** — `static`, `fixed`, `absolute`, `relative`, `sticky`.
**`$overflow-values`** — `auto`, `hidden`, `scroll`, `visible`.
**`$white-space-list`** — `nowrap`, `pre`, `normal`.
**`$overflow-wrap-list`** — `break-word`.

### Mixins nucleo — `_mixins.scss`

| Mixin | Comportamiento |
| --- | --- |
| `vars-list($list, $prefix: null)` | Emite `--{prefix}-{value}: {value}` (o `--{value}`) para cada elemento de una lista. |
| `vars-map($map, $prefix: null)` | Emite `--{prefix}-{key}: {value}` (o `--{key}`) para cada par de un mapa. |
| `absolute-center($pos: absolute, $y: 50%, $x: 50%)` | `position`, `top: $y`, `left: $x`, `transform: translate(-50%, -50%)`. |
| `center-mx($xvalue: auto)` | `margin-inline: $xvalue`. |
| `center-my($yvalue: auto)` | `margin-block: $yvalue`. |
| `utils-classes($input, $property, $prefix: null)` | Genera `.prefix-value { property: value }` (o sin prefijo) a partir de una lista o un mapa. El sufijo de clase es la *clave* para un mapa, el *valor* para una lista. |
| `utils-classes-hover($input, $property, $prefix: null)` | Igual, pero emite `.prefix-key:hover`. |

```scss
@include m.utils-classes((auto, hidden), overflow, "overflow");
// .overflow-auto, .overflow-hidden

@include m.utils-classes((auto: auto, hidden: hidden), overflow, "overflow");
// salida identica

@include m.utils-classes((flex, grid), display);
// .flex, .grid (sin prefijo)
```

### Generadores de clases (opt-in, invocados por `generate-all-utilities()`)

| Generador | Clases |
| --- | --- |
| `u.get-sizing-classes($map: u.$sizing-map)` | `.w-*`, `.min-w-*`, `.max-w-*`, `.h-*`, `.min-h-*`, `.max-h-*`. |
| `u.generate-flex-utilities($direction: ..., $wrap: ..., $align: ..., $justify: ..., $gap: ...)` | `.flex-row` / `.flex-col` / reversas, `.flex-wrap` / `.flex-nowrap`, `.items-*`, `.justify-*`, `.gap-0` ... `.gap-8`. |
| `u.generate-effects-utilities()` | `.shadow-*`, `.rounded-*`, `.z-*`, `.duration-*`, `.ease-*`, `.opacity-*`. |
| `u.generate-layout-utilities()` | display, position, `.overflow-*`, `.text-left/center/right/justify`, `.font-*`, `.whitespace-*`, `.wrap-break-word`. |
| `u.generate-all-utilities()` | Sizing + flex + efectos + layout. |

Las clases de espaciado, tamano de texto y ancho de borde **no** forman parte
de estos generadores; se emiten automaticamente cuando se carga el modulo
(ver abajo).

### Salida automatica cuando se carga el modulo

Cargar `utilities` ejecuta las reglas automaticas en el nivel superior. La
hoja compilada por lo tanto siempre contiene:

- **Espaciado** — para cada clave de `$spacing-map`: `.p-*`, `.px-*`, `.py-*`,
  `.pt-*`, `.pr-*`, `.pb-*`, `.pl-*`, `.m-*`, `.mx-*`, `.my-*`, `.mt-*`,
  `.mr-*`, `.mb-*`, `.ml-*`, `.gap-*`, `.gap-x-*`, `.gap-y-*`.
- **Tipografia** — `.text-xs` ... `.text-4xl` de `$font-size-map`.
- **Anchos de borde** — `.border-0`, `.border-2`, `.border-4`, `.border-8`
  de `$border-width-map`, mas `.border { border-width: 1px;
  border-style: solid }`.
- **Efectos base** — `.gap { gap: 1rem; }`, `.shadow` (sombra por defecto) y
  `.rounded { border-radius: 0.25rem; }`.

```css
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.my-8 { margin-top: 2rem; margin-bottom: 2rem; }
.gap-x-4 { column-gap: 1rem; }
.text-lg { font-size: 1.125rem; }
.border-2 { border-width: 2px; }
.border { border-width: 1px; border-style: solid; }
```

Todo lo demas es opt-in via los generadores anteriores (o `main.scss`).

### Notas sobre nombres

- Las claves son strings literales, mantenidas en kebab-case: `.p-05`,
  `.p-1-5`, `.p-2-5`, `.p-3-5`, `.p-base`, `.w-screen { width: 100vw }`,
  `.hidden { display: none }`, `.font-normal { font-weight: 400 }`.
- `generate-layout-utilities` emite `.hidden` porque `$display-values`
  mapea `hidden` -> `none`.

---

## El sistema apply (`as m`)

Fuente: `_mixins.scss` (fusionado del antiguo `_apply.scss`).

### `@mixin register-utility($name, $styles)`

Registra una utilidad con nombre. `$styles` es un mapa de declaraciones CSS.

### `@mixin apply($utilities...)`

Emite cada declaracion registrada para cada nombre de utilidad, en orden.
Lanza un `@error` nombrando el nombre problematico cuando una utilidad no
esta registrada.

```scss
@use "katanakit-css/src/scss/mixins" as m;

@include m.register-utility("fade-in", (animation: fade-in 300ms ease));
.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);
}
```

### Registro automatico

`_mixins.scss` registra un gran conjunto de utilidades al cargarse. La
mayoria del registro se deriva de los **mismos mapas** que impulsan los
generadores de clases (`$radius-map`, `$shadow-map`, `$z-layers-map`,
`$transition-duration-map`, `$transition-timing-map`, `$opacity-values`,
`$display-values`, `$position-values`, `$overflow-values`,
`$text-align-values`, `$font-weight-values`, `$flex-direction-map`,
`$flex-wrap-list`, `$align-items-map`, `$justify-content-map`), por lo que
los nombres coinciden exactamente con las claves de los mapas (`p-4`, `m-2`,
`gap-4`, `rounded-lg`, `shadow-md`, `z-10`, `duration-200`, `ease-out`,
`opacity-50`, ...). Los nombres de espaciado siguen el mapa de tokens
`$spacing-scale` de `_variables.scss`; el conjunto de clases de
`$spacing-map` es mas amplio que el conjunto registrado.

Categorias:

- **Display** — `block`, `inline-block`, `inline`, `flex`, `inline-flex`,
  `grid`, `hidden`, mas cada clave de `$display-values`.
- **Flexbox** — `flex-row`, `flex-col`, `flex-row-reverse`,
  `flex-col-reverse`, `flex-wrap`, `flex-nowrap`, `flex-1`, `flex-auto`,
  `flex-none`, `items-*`, `justify-*`.
- **Espaciado** — para cada clave de `$spacing-scale` (variables): `p-*`,
  `px-*`, `py-*`, `pt-*`, `pb-*`, `pl-*`, `pr-*`, `m-*`, `mx-*`, `my-*`,
  `mt-*`, `mb-*`, `ml-*`, `mr-*`, `gap-*`, `gap-x-*`, `gap-y-*`.
- **Tipografia** — `text-xs` (0.75rem) ... `text-4xl` (2.25rem), `text-left`,
  `text-center`, `text-right`, `font-thin` ... `font-black`.
- **Dimensiones** — `w-full`, `w-screen`, `w-auto`, `h-full`, `h-screen`,
  `h-auto`.
- **Bordes** — `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`,
  `rounded-full`, `border`, `border-0`, `border-2`, mas cada clave de
  `$radius-map` (`rounded-none` ... `rounded-full`).
- **Efectos** — `shadow`, `shadow-sm` ... `shadow-2xl` (cada clave de
  `$shadow-map`), `opacity-0` ... `opacity-100` (cada clave de
  `$opacity-values`), `z-*`, `duration-*`, `ease-*`.
- **Helpers de grid** — `grid-cols-1`, `grid-cols-2`, `grid-cols-3`,
  `grid-cols-4`, `grid-cols-6`, `grid-cols-12`, `col-span-full`.
- **Posicion/overflow** — `static`, `fixed`, `absolute`, `relative`,
  `sticky`, `overflow-auto/hidden/scroll/visible`.
- **Colores** — `text-white`, `text-black`, `bg-white`, `bg-black`,
  `bg-transparent`.
- **Transiciones** — `transition`, `transition-colors`,
  `transition-opacity`, `transition-transform`.
- **Espacio en blanco / envoltura** — `whitespace-nowrap/pre/normal`,
  `wrap-break-word`.

**Importante.** Registrar una utilidad para `apply` **no** crea una clase CSS.
Como el espaciado, los tamanos de texto y los anchos de borde ahora se generan
como clases automaticamente, los nombres exclusivos del registro se limitan a
`flex-1`, `flex-auto`, `flex-none`, `grid-cols-1/2/3/4/6/12`, `col-span-full`
y los helpers `transition*`; esos nombres solo existen dentro de `apply()` y
nunca deben asumirse como clases en el CSS compilado.

---

## Manejo de errores

Claves invalidas, tipos de argumentos incorrectos y direcciones no soportadas
lanzan mensajes `@error` en tiempo de compilacion que nombran el valor
problematico y, cuando corresponde, las opciones validas. No hay fallback
silencioso.
