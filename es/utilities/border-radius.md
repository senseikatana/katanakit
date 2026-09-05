# Radio de borde

Utilidades para controlar el radio de borde de un elemento.

# Radio de borde

Utilidades para controlar el radio de borde de un elemento, generadas desde
`$radius-map`. La clase base `.rounded` (`0.25rem`) se emite automaticamente
con el modulo `utilities`.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.rounded` | `border-radius: 0.25rem;` |
| `.rounded-none` | `border-radius: 0;` |
| `.rounded-sm` | `border-radius: 0.125rem;` |
| `.rounded-md` | `border-radius: 0.375rem;` |
| `.rounded-lg` | `border-radius: 0.5rem;` |
| `.rounded-xl` | `border-radius: 0.75rem;` |
| `.rounded-2xl` | `border-radius: 1rem;` |
| `.rounded-3xl` | `border-radius: 1.5rem;` |
| `.rounded-full` | `border-radius: 9999px;` |

## Uso basico

<div class="kk-demo">
  <div class="grid gap-2" style="grid-template-columns: repeat(3, 1fr)">
    <div class="bg-purple-200 text-purple-700 rounded-none p-4">rounded-none</div>
    <div class="bg-purple-200 text-purple-700 rounded-sm p-4">rounded-sm</div>
    <div class="bg-purple-200 text-purple-700 rounded-md p-4">rounded-md</div>
    <div class="bg-purple-300 text-purple-700 rounded-lg p-4">rounded-lg</div>
    <div class="bg-purple-300 text-purple-700 rounded-xl p-4">rounded-xl</div>
    <div class="bg-purple-300 text-purple-700 rounded-2xl p-4">rounded-2xl</div>
  </div>
  <div class="bg-purple-500 text-white rounded-full p-4">rounded-full</div>
</div>

```html
<div class="rounded-lg ...">rounded-lg</div>
<div class="rounded-full ...">rounded-full</div>
```

## Hacer circulos

`rounded-full` con ancho y alto iguales produce un circulo:

```html
<div class="w-24 h-24 rounded-full bg-purple-500"></div>
```

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $radius-map: (
    "none": 0,
    "md": 0.375rem,
    "full": 9999px
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-effects-utilities();
```
