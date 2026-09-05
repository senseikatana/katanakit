# Tamano de fuente

Utilidades para controlar el tamano de fuente de un elemento.

# Tamano de fuente

Utilidades para controlar el tamano de fuente de un elemento, generadas desde
`$font-size-map`. Estas clases se emiten automaticamente cuando se carga el
modulo `utilities`; no se necesita llamar a un generador.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.text-xs` | `font-size: 0.75rem;` |
| `.text-sm` | `font-size: 0.875rem;` |
| `.text-base` | `font-size: 1rem;` |
| `.text-lg` | `font-size: 1.125rem;` |
| `.text-xl` | `font-size: 1.25rem;` |
| `.text-2xl` | `font-size: 1.5rem;` |
| `.text-3xl` | `font-size: 1.875rem;` |
| `.text-4xl` | `font-size: 2.25rem;` |

## Uso basico

<div class="kk-demo">
  <div class="grid gap-2 text-neutral-700">
    <p class="text-xs">El rapido zorro marron — text-xs</p>
    <p class="text-sm">El rapido zorro marron — text-sm</p>
    <p class="text-base">El rapido zorro marron — text-base</p>
    <p class="text-lg">El rapido zorro marron — text-lg</p>
    <p class="text-xl">El rapido zorro marron — text-xl</p>
    <p class="text-2xl">El rapido zorro marron — text-2xl</p>
    <p class="text-3xl">El rapido zorro marron — text-3xl</p>
    <p class="text-4xl">El rapido zorro marron — text-4xl</p>
  </div>
</div>

```html
<p class="text-xs ...">El rapido zorro marron — text-xs</p>
<p class="text-sm ...">El rapido zorro marron — text-sm</p>
<!-- ... hasta text-4xl -->
```

## Personalizar

Sobreescribe `$font-size-map` en el modulo `utilities` antes de que se cargue:

```scss
@use "katanakit-css/src/scss/utilities" as u with (
  $font-size-map: (
    "sm": 0.75rem,
    "base": 1rem,
    "xl": 1.5rem
  )
);
```
