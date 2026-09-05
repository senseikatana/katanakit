# Posicion

Utilidades para controlar como se posiciona un elemento.

# Posicion

Utilidades para controlar como se posiciona un elemento en el documento.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.static` | `position: static;` |
| `.fixed` | `position: fixed;` |
| `.absolute` | `position: absolute;` |
| `.relative` | `position: relative;` |
| `.sticky` | `position: sticky;` |

## Uso basico

`relative` crea el contexto de posicionamiento; `absolute` elimina el
elemento del flujo y lo ancla al ancestro posicionado mas cercano:

<div class="kk-demo">
  <div class="relative p-8 bg-purple-100 rounded-md" style="height: 8rem; width: 16rem">
    <span class="absolute" style="top: .5rem; right: .5rem"><span class="p-2 bg-purple-500 text-white rounded-md">absolute</span></span>
    <span class="absolute" style="bottom: .5rem; left: .5rem"><span class="p-2 bg-purple-300 text-purple-700 rounded-md">absolute</span></span>
    <span class="p-2 bg-white text-purple-700 rounded-md">relative</span>
  </div>
</div>

```html
<div class="relative ...">
  <span class="absolute" style="top: .5rem; right: .5rem">...</span>
</div>
```

El framework no emite utilidades `top`/`right`/`bottom`/`left`, asi que
combina `absolute` con tus propios desplazamientos.

## Posicion fija

`fixed` ancla un elemento al viewport; permanece en su lugar cuando la
pagina se desplaza:

```html
<header class="fixed" style="top: 0; left: 0; right: 0">...</header>
<main class="p-8"><!-- se desplaza debajo del header --></main>
```

## Posicion sticky

`sticky` mantiene un elemento en el flujo hasta que alcanza el borde de
desplazamiento, luego lo fija:

```html
<nav class="sticky" style="top: 0">...</nav>
```

Usa la capa `z-sticky` de [Z-Index](/es/utilities/z-index/) cuando el
elemento sticky necesite estar por encima de otro contenido.

## Personalizar

Las clases de posicion se generan desde la lista `$position-values` en el
modulo `mixins`:

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $position-values: (static, fixed, absolute, relative, sticky)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
