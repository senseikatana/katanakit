# Espacio en blanco

Utilidades para controlar el ajuste de texto y el manejo de espacios en blanco.

# Espacio en blanco

Utilidades para controlar como se manejan los espacios en blanco dentro de
un elemento y como se rompen las palabras largas. Generadas desde
`$white-space-list` y `$overflow-wrap-list`.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.whitespace-nowrap` | `white-space: nowrap;` |
| `.whitespace-pre` | `white-space: pre;` |
| `.whitespace-normal` | `white-space: normal;` |
| `.wrap-break-word` | `overflow-wrap: break-word;` |

## Uso basico

`whitespace-nowrap` evita que el texto se ajuste. Combinado con una utilidad
`overflow-*` produce truncamiento de una sola linea:

<div class="kk-demo">
  <div class="grid gap-2 w-64 text-neutral-700">
    <p class="whitespace-nowrap overflow-hidden bg-neutral-100 rounded-md p-2">El rapido zorro marron salta sobre el perro perezoso — nowrap</p>
    <p class="whitespace-normal bg-neutral-100 rounded-md p-2">El rapido zorro marron salta sobre el perro perezoso — normal</p>
  </div>
</div>

```html
<p class="whitespace-nowrap overflow-hidden ...">...</p>
<p class="whitespace-normal ...">...</p>
```

## Preservar formato

`whitespace-pre` preserva cada espacio y salto de linea exactamente como
esta escrito en el markup:

<div class="kk-demo">
  <pre class="whitespace-pre bg-neutral-100 text-neutral-700 rounded-md p-2 w-64">linea uno
  linea dos (indentacion conservada)
linea tres</pre>
</div>

```html
<pre class="whitespace-pre ...">linea uno
  linea dos (indentacion conservada)
linea tres</pre>
```

## Romper palabras largas

`wrap-break-word` permite que las palabras largas sin puntos de corte (URLs,
tokens) se ajusten en lugar de desbordarse:

<div class="kk-demo">
  <p class="wrap-break-word w-64 bg-neutral-100 text-neutral-700 rounded-md p-2">
    https://example.com/supercalifragilisticexpialidocious/verylong/path
  </p>
</div>

```html
<p class="wrap-break-word w-64 ...">https://example.com/muy/larga/ruta</p>
```

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $white-space-list: (nowrap, pre, normal),
  $overflow-wrap-list: (break-word,)
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-layout-utilities();
```
