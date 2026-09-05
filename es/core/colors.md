# Colores

Paletas de color, funciones de acceso y generacion de variables CSS.

# Colores

KatanaKIT CSS incluye **6 paletas con 7 tonos cada una** (`100` mas claro ->
`700` mas oscuro) mas cuatro colores especiales. Todo vive en el modulo
`variables` y se emite como clases de utilidad, propiedades personalizadas
CSS y variantes hover.

```scss
@use "katanakit-css/src/scss/variables" as v;
```

## Paletas

Cada paleta sigue la misma rampa de luminosidad: `100`-`300` son tonos de
fondo, `400` es el tono de marca vivid, `500`-`700` son tonos de texto.

### Neutral

<div class="kk-swatches">
  <div class="kk-swatch bg-neutral-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-neutral-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-neutral-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-neutral-400">400</div>
  <div class="kk-swatch bg-neutral-500">500</div>
  <div class="kk-swatch bg-neutral-600">600</div>
  <div class="kk-swatch bg-neutral-700">700</div>
</div>

### Purple

<div class="kk-swatches">
  <div class="kk-swatch bg-purple-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-purple-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-purple-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-purple-400">400</div>
  <div class="kk-swatch bg-purple-500">500</div>
  <div class="kk-swatch bg-purple-600">600</div>
  <div class="kk-swatch bg-purple-700">700</div>
</div>

### Info

<div class="kk-swatches">
  <div class="kk-swatch bg-info-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-info-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-info-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-info-400">400</div>
  <div class="kk-swatch bg-info-500">500</div>
  <div class="kk-swatch bg-info-600">600</div>
  <div class="kk-swatch bg-info-700">700</div>
</div>

### Warning

<div class="kk-swatches">
  <div class="kk-swatch bg-warning-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-warning-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-warning-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-warning-400 kk-swatch--light">400</div>
  <div class="kk-swatch bg-warning-500">500</div>
  <div class="kk-swatch bg-warning-600">600</div>
  <div class="kk-swatch bg-warning-700">700</div>
</div>

### Danger

<div class="kk-swatches">
  <div class="kk-swatch bg-danger-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-danger-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-danger-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-danger-400">400</div>
  <div class="kk-swatch bg-danger-500">500</div>
  <div class="kk-swatch bg-danger-600">600</div>
  <div class="kk-swatch bg-danger-700">700</div>
</div>

### Success

<div class="kk-swatches">
  <div class="kk-swatch bg-success-100 kk-swatch--light">100</div>
  <div class="kk-swatch bg-success-200 kk-swatch--light">200</div>
  <div class="kk-swatch bg-success-300 kk-swatch--light">300</div>
  <div class="kk-swatch bg-success-400">400</div>
  <div class="kk-swatch bg-success-500">500</div>
  <div class="kk-swatch bg-success-600">600</div>
  <div class="kk-swatch bg-success-700">700</div>
</div>

### Colores especiales

<div class="kk-swatches">
  <div class="kk-swatch bg-black">black</div>
  <div class="kk-swatch bg-white kk-swatch--light">white</div>
  <div class="kk-swatch bg-transparent kk-swatch--light">transparent</div>
</div>

`current` tambien es un color especial (`currentColor`), pero no tiene una
muestra visible propia; se resuelve al valor `color` del elemento.

## Valores de tono

Almacenados como `hsl(tono, saturacion%, luminosidad%)`:

| Paleta | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `neutral` | 0 0% 93% | 0 0% 86% | 0 0% 71% | 0 0% 50% | 0 0% 35% | 0 0% 24% | 0 0% 12% |
| `purple` | 269 60% 93% | 269 70% 86% | 269 70% 71% | 269 66% 50% | 269 66% 35% | 269 60% 24% | 269 50% 12% |
| `info` | 215 95% 93% | 215 95% 86% | 215 95% 71% | 215 95% 50% | 215 95% 35% | 215 95% 24% | 215 95% 12% |
| `warning` | 49 100% 93% | 49 100% 86% | 49 100% 71% | 49 100% 50% | 49 100% 35% | 49 90% 24% | 49 70% 12% |
| `danger` | 3 95% 93% | 3 95% 86% | 3 95% 71% | 3 95% 50% | 3 95% 35% | 3 95% 24% | 3 95% 12% |
| `success` | 147 95% 93% | 147 95% 86% | 147 95% 71% | 147 95% 50% | 147 95% 35% | 147 95% 24% | 147 95% 12% |

Colores especiales: `black` `hsl(0, 0%, 3%)` . `white` `hsl(0, 0%, 98%)` .
`transparent` `transparent` . `current` `currentColor`.

## Funciones de acceso

| Firma | Devuelve |
| --- | --- |
| `v.get-color($name, $shade: 300, $alpha: 1)` | Un tono de paleta (o un color especial cuando `$name` es especial). Aplica alfa cuando `$alpha != 1`. |
| `v.get($name, $alpha: 1)` | Abreviatura: `get-color($name, 500, $alpha)`. |
| `v.alpha($name, $shade: 500, $alpha: 0.5)` | Abreviatura para variantes transparentes. |

```scss
@use "katanakit-css/src/scss/variables" as v;

color: v.get-color("neutral", 500);  // hsl(0, 0%, 35%)
color: v.get("info");                // tono 500: hsl(215, 95%, 35%)
border: 1px solid v.alpha("warning", 400, 0.25);
background: v.alpha("purple", 100, 0.4);
```

Nombres de paleta o tono invalidos lanzan un `@error` en tiempo de compilacion.

## Generar variables CSS

`generate-css-vars()` emite una propiedad personalizada por tono mas los
especiales:

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-vars();
```

```css
:root {
  --neutral-100: hsl(0, 0%, 93%);
  /* ... cada paleta y tono ... */
  --info-500: hsl(215, 95%, 35%);
  --black: hsl(0, 0%, 3%);
  --white: hsl(0, 0%, 98%);
  --transparent: transparent;
  --current: currentColor;
}
```

```scss
// Solo la paleta info, sin especiales:
@include v.generate-css-vars($palettes: "info", $include-special: false);

// Un selector raiz personalizado:
@include v.generate-css-vars($root: ".theme-brand");
```

`$palettes` acepta `null` (todas), un nombre, una lista de nombres, o un mapa
emitido tal cual; este es el mecanismo que usa el
[tema oscuro](/es/core/dark-mode/) para publicar paletas invertidas.

## Clases de utilidad

Los mixins de color generan las clases que usas en el markup:

| Mixin | Clases |
| --- | --- |
| `v.text-utilities()` | `.text-{palette}-{100...700}` + `.text-black` `.text-white` `.text-transparent` `.text-current` |
| `v.bg-utilities()` | `.bg-{palette}-{100...700}` + `.bg-black` `.bg-white` `.bg-transparent` `.bg-current` |
| `v.border-utilities()` | `.border-{palette}-{100...700}` + los cuatro especiales |
| `v.hover-utilities()` | `.hover-text-*:hover` y `.hover-bg-*:hover` |
| `v.all-utilities()` | Los cuatro mixins a la vez (llamado por `main.scss`). |

Consulta [Color de texto](/es/utilities/text-color/),
[Color de fondo](/es/utilities/background-color/) y
[Color de borde](/es/utilities/border-color/) para las tablas completas
de clases.
