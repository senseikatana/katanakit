# Sombra de caja

Utilidades para controlar la sombra de caja de un elemento.

# Sombra de caja

Utilidades para controlar la sombra de caja de un elemento, generadas desde
`$shadow-map`. La clase base `.shadow` se emite automaticamente con el modulo
`utilities`.

## Referencia rapida

| Clase | Propiedades |
| --- | --- |
| `.shadow` | `box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);` |
| `.shadow-none` | `box-shadow: none;` |
| `.shadow-sm` | `box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);` |
| `.shadow-md` | `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);` |
| `.shadow-lg` | `box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);` |
| `.shadow-xl` | `box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);` |
| `.shadow-2xl` | `box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);` |
| `.shadow-inner` | `box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);` |

## Uso basico

<div class="kk-demo">
  <div class="grid gap-4" style="grid-template-columns: repeat(3, 1fr)">
    <div class="bg-white text-neutral-600 shadow-sm rounded-md p-4">shadow-sm</div>
    <div class="bg-white text-neutral-600 shadow rounded-md p-4">shadow</div>
    <div class="bg-white text-neutral-600 shadow-md rounded-md p-4">shadow-md</div>
    <div class="bg-white text-neutral-600 shadow-lg rounded-md p-4">shadow-lg</div>
    <div class="bg-white text-neutral-600 shadow-xl rounded-md p-4">shadow-xl</div>
    <div class="bg-white text-neutral-600 shadow-2xl rounded-md p-4">shadow-2xl</div>
  </div>
  <div class="bg-purple-100 text-purple-700 shadow-inner rounded-md p-4">shadow-inner</div>
</div>

```html
<div class="shadow-md ...">shadow-md</div>
<div class="shadow-inner ...">shadow-inner</div>
```

## Eliminar sombras

`shadow-none` elimina una sombra existente; util para sobreescribir una
sombra establecida por otra regla:

```html
<div class="shadow-lg shadow-none ...">sin sombra</div>
```

## Personalizar

```scss
@use "katanakit-css/src/scss/mixins" as m with (
  $shadow-map: (
    "none": none,
    "sm": 0 1px 2px 0 rgb(0 0 0 / 0.05),
    "lg": 0 10px 15px -3px rgb(0 0 0 / 0.1)
  )
);
@use "katanakit-css/src/scss/utilities" as u;

@include u.generate-effects-utilities();
```
