# Funciones

Funciones puras auxiliares: unidades, tipografia fluida y manipulacion de color.

# Funciones

Funciones puras auxiliares en el modulo `functions`
(`src/scss/_functions.scss`). Todas lanzan `@error` en tiempo de compilacion
cuando la entrada es invalida en lugar de fallar silenciosamente.

```scss
@use "katanakit-css/src/scss/functions" as f;
```

`$base-font-size: 16px !default` es la linea base en px usada por `rem()`/`px()`.

## Conversion de unidades

| Firma | Comportamiento |
| --- | --- |
| `f.rem($size)` | Convierte px o numeros sin unidad a rem usando `$base-font-size`. `f.rem(16px)` y `f.rem(16)` ambos devuelven `1rem`. |
| `f.px($size)` | Convierte rem o numeros sin unidad a px. `f.px(1)` devuelve `16px`, `f.px(1.5rem)` devuelve `24px`. |
| `f.to-unit($value, $unit: "rem")` | Anade una unidad (`rem`, `px`, `em` o `%`) a un numero sin unidad. Los valores que ya tienen unidad se devuelven sin cambios. Lanza `@error` con una unidad invalida. |
| `f.strip-unit($value)` | Elimina la unidad: `f.strip-unit(16px)` devuelve `16`. |

```scss
@use "katanakit-css/src/scss/functions" as f;

.card {
  padding: f.rem(24);      // 1.5rem
  margin: f.px(1);         // 16px
  width: f.to-unit(50, "%"); // 50%
}
```

## Tipografia fluida

| Firma | Comportamiento |
| --- | --- |
| `f.fluid($min, $max, $min-vw: 320px, $max-vw: 1920px)` | Devuelve una expresion `clamp()` que interpola `$min` -> `$max` a traves de `$min-vw` -> `$max-vw`. Las entradas sin unidad se tratan como px. |

```scss
font-size: f.fluid(16px, 24px);
// clamp(16px, 0.5vw + 14.4px, 24px)

font-size: f.fluid(1rem, 2rem, 768px, 1280px);
// clamp(1rem, 0.1953125vw - 0.5px, 2rem)
```

```scss
h1 { font-size: f.fluid(2rem, 4rem); }
```

## Helpers de color

| Firma | Comportamiento |
| --- | --- |
| `f.tint($color, $amount: 10%)` | Mezcla `$color` con blanco. |
| `f.shade($color, $amount: 10%)` | Mezcla `$color` con negro. |
| `f.saturate-color($color, $amount: 10%)` | Aumenta la saturacion via `color.scale`. |
| `f.desaturate-color($color, $amount: 10%)` | Reduce la saturacion via `color.scale`. |
| `f.complement($color)` | Devuelve el complemento de tono. |
| `f.contrast($color, $light: white, $dark: black)` | Elige un color de texto legible a partir del brillo percibido de `$color`: los colores brillantes devuelven `$dark`, los oscuros devuelven `$light`. |
| `f.color-mix-var($var-name, $amount: 10%, $mix-with: white)` | Emite `color-mix(in srgb, var(--name) <pct>, <mix-with>)`. Acepta un nombre de variable desnudo (`"--info-500"`) o una expresion `var(...)` completa. |
| `f.to-class($key)` | Escapa una clave de mapa para usar en un selector de clase: `.` -> `\.`, `/` -> `\/`, `%` -> `\%`. |

```scss
@use "katanakit-css/src/scss/functions" as f;

.card {
  background: f.tint(#7d2bd4, 20%);
  border-color: f.shade(#7d2bd4, 15%);
  color: f.contrast(#7d2bd4); // blanco — el color es oscuro
}

.alert {
  background: f.color-mix-var("--danger-500", 10%);
  // background: color-mix(in srgb, var(--danger-500) 90%, white);
}

.surface {
  color: f.desaturate-color(#066bf9, 30%);
}
```

Todas las funciones de color lanzan un `@error` cuando reciben un no-color.
