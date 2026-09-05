# Grosor de fuente

Utilidades para controlar el grosor de fuente de un elemento.

# Grosor de fuente

Utilidades para controlar el grosor de fuente de un elemento, generadas desde
el mapa `$font-weight-values`.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.font-thin` | `font-weight: 100;` |
| `.font-extralight` | `font-weight: 200;` |
| `.font-light` | `font-weight: 300;` |
| `.font-normal` | `font-weight: 400;` |
| `.font-medium` | `font-weight: 500;` |
| `.font-semibold` | `font-weight: 600;` |
| `.font-bold` | `font-weight: 700;` |
| `.font-extrabold` | `font-weight: 800;` |
| `.font-black` | `font-weight: 900;` |

## Uso basico

<div class="kk-demo">
  <div class="grid gap-2 text-neutral-700">
    <p class="font-thin">El rapido zorro marron — font-thin</p>
    <p class="font-extralight">El rapido zorro marron — font-extralight</p>
    <p class="font-light">El rapido zorro marron — font-light</p>
    <p class="font-normal">El rapido zorro marron — font-normal</p>
    <p class="font-medium">El rapido zorro marron — font-medium</p>
    <p class="font-semibold">El rapido zorro marron — font-semibold</p>
    <p class="font-bold">El rapido zorro marron — font-bold</p>
    <p class="font-extrabold">El rapido zorro marron — font-extrabold</p>
    <p class="font-black">El rapido zorro marron — font-black</p>
  </div>
</div>

```html
<p class="font-thin ...">El rapido zorro marron — font-thin</p>
<!-- ... cada grosor de 100 a 900 -->
```

Nota: el grosor renderizado depende de la fuente realmente cargada; se
requiere una fuente variable o una familia con las nueve caras para ver cada
paso.

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $font-weight-values: (
    "normal": 400,
    "medium": 500,
    "bold": 700
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
