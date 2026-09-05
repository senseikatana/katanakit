# Color de fondo

Utilidades para controlar el color de fondo de un elemento.

# Color de fondo

Utilidades para controlar el color de fondo de un elemento, generadas por
`v.bg-utilities()` a partir de las [paletas de color](/es/core/colors/).
Las 6 paletas con 7 tonos cada una, mas los colores especiales y variantes
`:hover`.

## Referencia rapida

| Paleta | 100 | 200 | 300 | 400 | 500 | 600 | 700 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| neutral | `.bg-neutral-100` | `.bg-neutral-200` | `.bg-neutral-300` | `.bg-neutral-400` | `.bg-neutral-500` | `.bg-neutral-600` | `.bg-neutral-700` |
| purple | `.bg-purple-100` | `.bg-purple-200` | `.bg-purple-300` | `.bg-purple-400` | `.bg-purple-500` | `.bg-purple-600` | `.bg-purple-700` |
| info | `.bg-info-100` | `.bg-info-200` | `.bg-info-300` | `.bg-info-400` | `.bg-info-500` | `.bg-info-600` | `.bg-info-700` |
| warning | `.bg-warning-100` | `.bg-warning-200` | `.bg-warning-300` | `.bg-warning-400` | `.bg-warning-500` | `.bg-warning-600` | `.bg-warning-700` |
| danger | `.bg-danger-100` | `.bg-danger-200` | `.bg-danger-300` | `.bg-danger-400` | `.bg-danger-500` | `.bg-danger-600` | `.bg-danger-700` |
| success | `.bg-success-100` | `.bg-success-200` | `.bg-success-300` | `.bg-success-400` | `.bg-success-500` | `.bg-success-600` | `.bg-success-700` |

| Especial | Clase | Propiedades |
| --- | --- | --- |
| black | `.bg-black` | `background-color: hsl(0, 0%, 3%);` |
| white | `.bg-white` | `background-color: hsl(0, 0%, 98%);` |
| transparent | `.bg-transparent` | `background-color: transparent;` |
| current | `.bg-current` | `background-color: currentColor;` |

## Uso basico

<div class="kk-demo">
  <div class="grid gap-2" style="grid-template-columns: repeat(3, 1fr)">
    <div class="bg-purple-500 text-white rounded-md p-4">purple-500</div>
    <div class="bg-info-500 text-white rounded-md p-4">info-500</div>
    <div class="bg-danger-500 text-white rounded-md p-4">danger-500</div>
    <div class="bg-success-500 text-white rounded-md p-4">success-500</div>
    <div class="bg-warning-500 text-warning-700 rounded-md p-4">warning-500</div>
    <div class="bg-neutral-500 text-white rounded-md p-4">neutral-500</div>
  </div>
</div>

```html
<div class="bg-purple-500 text-white ...">purple-500</div>
```

El conjunto completo de muestras de cada paleta se renderiza en la pagina de
[Colores](/es/core/colors/).

## Variantes hover

Cada color de fondo tambien existe como variante `:hover`, generada por
`v.hover-utilities()`:

<div class="kk-demo">
  <button class="hover-bg-purple-500 bg-purple-300 text-purple-700 p-2 px-4 rounded-md font-semibold">Pasa el raton — hover-bg-purple-500</button>
</div>

```html
<button class="bg-purple-300 text-purple-700 hover-bg-purple-500 ...">Pasa el raton</button>
```

| Variante | Paletas |
| --- | --- |
| `.hover-bg-{palette}-{100...700}:hover` | `.hover-bg-neutral-100` ... `.hover-bg-success-700` |
| `.hover-bg-{special}:hover` | `.hover-bg-black`, `.hover-bg-white`, `.hover-bg-transparent`, `.hover-bg-current` |

## Personalizar

```scss
@use "katanakit-css/src/scss/variables" as v;

// Solo la paleta info:
@include v.bg-utilities("info");

// Todas las paletas, sin colores especiales:
@include v.bg-utilities($special: false);

// Todo:
@include v.all-utilities();
```
