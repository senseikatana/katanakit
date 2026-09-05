# Alineacion de texto

Utilidades para controlar la alineacion del texto.

# Alineacion de texto

Utilidades para controlar la alineacion del texto, generadas desde la lista
`$text-align-values`.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.text-left` | `text-align: left;` |
| `.text-center` | `text-align: center;` |
| `.text-right` | `text-align: right;` |
| `.text-justify` | `text-align: justify;` |

## Uso basico

<div class="kk-demo">
  <div class="grid gap-2 w-64 text-neutral-700">
    <p class="text-left bg-neutral-100 rounded-md p-2">Asi que empece a caminar hacia el agua — text-left</p>
    <p class="text-center bg-neutral-100 rounded-md p-2">Asi que empece a caminar hacia el agua — text-center</p>
    <p class="text-right bg-neutral-100 rounded-md p-2">Asi que empece a caminar hacia el agua — text-right</p>
    <p class="text-justify bg-neutral-100 rounded-md p-2">Asi que empece a caminar hacia el agua. No les mentire chicos, estaba aterrorizado — text-justify</p>
  </div>
</div>

```html
<p class="text-left ...">...</p>
<p class="text-center ...">...</p>
<p class="text-right ...">...</p>
<p class="text-justify ...">...</p>
```

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $text-align-values: (left, center, right)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
