# Opacidad

Utilidades para controlar la opacidad de un elemento.

# Opacidad

Utilidades para controlar la opacidad de un elemento, generadas desde el
mapa `$opacity-values`. A diferencia de `hidden`, un elemento con `opacity-0`
sigue ocupando espacio y recibe eventos de puntero.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.opacity-0` | `opacity: 0;` |
| `.opacity-5` | `opacity: 0.05;` |
| `.opacity-10` | `opacity: 0.1;` |
| `.opacity-20` | `opacity: 0.2;` |
| `.opacity-25` | `opacity: 0.25;` |
| `.opacity-30` | `opacity: 0.3;` |
| `.opacity-40` | `opacity: 0.4;` |
| `.opacity-50` | `opacity: 0.5;` |
| `.opacity-60` | `opacity: 0.6;` |
| `.opacity-70` | `opacity: 0.7;` |
| `.opacity-75` | `opacity: 0.75;` |
| `.opacity-80` | `opacity: 0.8;` |
| `.opacity-90` | `opacity: 0.9;` |
| `.opacity-95` | `opacity: 0.95;` |
| `.opacity-100` | `opacity: 1;` |

## Uso basico

<div class="kk-demo">
  <div class="grid gap-1" style="grid-template-columns: repeat(5, 1fr)">
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-0">0</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-5">5</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-10">10</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-20">20</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-25">25</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-30">30</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-40">40</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-50">50</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-60">60</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-70">70</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-75">75</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-80">80</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-90">90</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-95">95</div>
    <div class="bg-purple-500 rounded-md p-3 text-white text-xs opacity-100">100</div>
  </div>
</div>

```html
<div class="opacity-50 ...">50</div>
<div class="opacity-100 ...">100</div>
```

## Combinar con transiciones

La opacidad se combina con las utilidades de
[Transiciones](/es/utilities/transitions/) para efectos de desvanecimiento:

```html
<button
  class="hover-bg-purple-500 bg-purple-300 duration-200 ease-out"
  style="transition-property: background-color"
>
  Desvanecer via hover-bg
</button>
```

> Nota: no existe una variante `.hover-opacity-*` en este framework; las
> variantes hover de color son `.hover-text-*` y `.hover-bg-*` (consulta
> [Color de texto](/es/utilities/text-color/) y
> [Color de fondo](/es/utilities/background-color/)).

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $opacity-values: (
    "0": 0,
    "25": 0.25,
    "50": 0.5,
    "75": 0.75,
    "100": 1
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-effects-utilities();
```
