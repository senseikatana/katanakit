# Color de texto

Utilidades para controlar el color de texto de un elemento.

# Color de texto

Utilidades para controlar el color de texto de un elemento, generadas por
`v.text-utilities()` a partir de las [paletas de color](/es/core/colors/).
Las 6 paletas con 7 tonos cada una, mas los colores especiales y variantes
`:hover`.

## Referencia rapida

| Paleta | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| neutral | `.text-neutral-100` | `.text-neutral-200` | `.text-neutral-300` | `.text-neutral-400` | `.text-neutral-500` | `.text-neutral-600` | `.text-neutral-700` |
| purple | `.text-purple-100` | `.text-purple-200` | `.text-purple-300` | `.text-purple-400` | `.text-purple-500` | `.text-purple-600` | `.text-purple-700` |
| info | `.text-info-100` | `.text-info-200` | `.text-info-300` | `.text-info-400` | `.text-info-500` | `.text-info-600` | `.text-info-700` |
| warning | `.text-warning-100` | `.text-warning-200` | `.text-warning-300` | `.text-warning-400` | `.text-warning-500` | `.text-warning-600` | `.text-warning-700` |
| danger | `.text-danger-100` | `.text-danger-200` | `.text-danger-300` | `.text-danger-400` | `.text-danger-500` | `.text-danger-600` | `.text-danger-700` |
| success | `.text-success-100` | `.text-success-200` | `.text-success-300` | `.text-success-400` | `.text-success-500` | `.text-success-600` | `.text-success-700` |

| Especial | Clase | Propiedades |
| --- | --- | --- |
| black | `.text-black` | `color: hsl(0, 0%, 3%);` |
| white | `.text-white` | `color: hsl(0, 0%, 98%);` |
| transparent | `.text-transparent` | `color: transparent;` |
| current | `.text-current` | `color: currentColor;` |

## Uso basico

<div class="kk-demo">
  <div class="grid gap-2">
    <p class="text-purple-500 bg-purple-100 rounded-md p-2">text-purple-500 on purple-100</p>
    <p class="text-info-400 bg-info-100 rounded-md p-2">text-info-400 on info-100</p>
    <p class="text-danger-500 bg-danger-100 rounded-md p-2">text-danger-500 on danger-100</p>
    <p class="text-success-500 bg-success-100 rounded-md p-2">text-success-500 on success-100</p>
    <p class="text-warning-600 bg-warning-100 rounded-md p-2">text-warning-600 on warning-100</p>
    <p class="text-white bg-neutral-700 rounded-md p-2">text-white on neutral-700</p>
  </div>
</div>

```html
<p class="text-purple-500 ...">text-purple-500</p>
<p class="text-white ...">text-white</p>
```

## Variantes hover

Cada color de texto tambien existe como variante `:hover`, generada por
`v.hover-utilities()`:

<div class="kk-demo">
  <a href="#" class="hover-text-purple-400 text-purple-600 p-2 rounded-md font-semibold">Pasa el raton — hover-text-purple-400</a>
</div>

```html
<a href="#" class="text-purple-600 hover-text-purple-400 ...">Pasa el raton</a>
```

| Variante | Paletas |
| --- | --- |
| `.hover-text-{palette}-{100...700}:hover` | `.hover-text-neutral-100` ... `.hover-text-success-700` |
| `.hover-text-{special}:hover` | `.hover-text-black`, `.hover-text-white`, `.hover-text-transparent`, `.hover-text-current` |

## Personalizar

Las utilidades de color se generan desde `$colors` y `$special-colors` en
el modulo `variables`:

```scss
@use "katanakit-css/src/scss/variables" as v;

// Solo las paletas purple y neutral:
@include v.text-utilities(("purple", "neutral"));

// Todas las paletas, sin colores especiales:
@include v.text-utilities($special: false);

// Todo:
@include v.all-utilities();
```
