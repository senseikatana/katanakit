# Breakpoints

Niveles de breakpoint responsivo, mixins de direccion y consultas de caracteristicas.

# Breakpoints

Los breakpoints impulsan los mixins responsivos. Los niveles viven en dos
lugares que deben mantenerse sincronizados: `v.$breakpoint-sizes` (accesador
de tokens) y `m.$breakpoints` (motor de mixins). Ambos son mapas `!default`
con los mismos valores por defecto.

| Nivel | Ancho |
| --- | --- |
| `xs` | `0` |
| `sm` | `640px` |
| `md` | `768px` |
| `lg` | `1024px` |
| `xl` | `1280px` |
| `2xl` | `1536px` |
| `3xl` | `1920px` |

```scss
@use "katanakit-css/src/scss/mixins" as m;
@use "katanakit-css/src/scss/variables" as v;

// El accesador de tokens devuelve valores crudos para tus propias media queries:
$tablet: v.breakpoint("md"); // 768px
```

Las claves que contienen digitos (`2xl`, `3xl`) son nombres de primera clase;
pasalas siempre como strings.

## El mixin generico

`breakpoint($from, $direction: up, $to: null)` abre una consulta `@media`.
`$from` (y `$to`) aceptan un nombre de nivel o un numero px en bruto. `bp()`
es un alias que reenvia sus argumentos.

| Direccion | Consulta media | Requiere `$to` |
| --- | --- | --- |
| `up` | `(min-width: X)` | no |
| `down` | `(max-width: calc(X - 0.02px))` | no |
| `only` | `(min-width: X) and (max-width: calc(Y - 0.02px))` | si |
| `between` | `(min-width: X) and (max-width: Y)` | si |

```scss
@use "katanakit-css/src/scss/mixins" as m;

@include m.breakpoint("md", up) {
  .card { display: grid; }
}

@include m.bp("lg", down) { /* alias, igual que breakpoint("lg", down) */ }

@include m.breakpoint("sm", only, "md") { /* solo tablets */ }

@include m.breakpoint(900px, between, 1200px) { /* los valores en bruto tambien funcionan */ }
```

## Mixins de direccion (mobile-first)

Mixins de atajo para la direccion `up`, incluyendo alias `xxl` / `xxxl` para
las claves con digitos:

```scss
@include m.xs   { /* >= 0     */ }
@include m.sm   { /* >= 640px */ }
@include m.md   { /* >= 768px */ }
@include m.lg   { /* >= 1024px */ }
@include m.xl   { /* >= 1280px */ }
@include m.xxl  { /* >= 1536px (2xl) */ }
@include m.xxxl { /* >= 1920px (3xl) */ }
```

## Mixins down (desktop-first)

```scss
@include m.xs-down   { /* <= 0 */ }
@include m.sm-down   { /* <= 639.98px */ }
@include m.md-down   { /* <= 767.98px */ }
@include m.lg-down   { /* <= 1023.98px */ }
@include m.xl-down   { /* <= 1279.98px */ }
@include m.x2l-down  { /* <= 1535.98px (2xl) */ }
@include m.x3l-down  { /* <= 1919.98px (3xl) */ }

// Alias canonicos para las claves con digitos:
@include m.xxl-down  { /* = x2l-down */ }
@include m.xxxl-down { /* = x3l-down */ }
```

## Combinando ambas direcciones

Una rejilla de tarjetas responsiva tipica, mobile-first y luego limitada en
el extremo superior:

```scss
@use "katanakit-css/src/scss/mixins" as m;

.grid {
  display: grid;
  grid-template-columns: 1fr;

  @include m.sm { grid-template-columns: repeat(2, 1fr); }
  @include m.lg { grid-template-columns: repeat(4, 1fr); }
}
```

Consulta la [referencia del mixin Breakpoints](/es/mixins/breakpoints/) para
la referencia tecnica completa del mixin generico.

## Consultas de caracteristicas

Mas alla de los anchos, el modulo incluye atajos para media features:

| Mixin | Consulta media |
| --- | --- |
| `m.portrait` | `(orientation: portrait)` |
| `m.landscape` | `(orientation: landscape)` |
| `m.reduced-motion` | `(prefers-reduced-motion: reduce)` |
| `m.hoverable` | `(hover: hover) and (pointer: fine)` |
| `m.touch` | `(hover: none) and (pointer: coarse)` |
| `m.dark-mode` | `(prefers-color-scheme: dark)` |
| `m.light-mode` | `(prefers-color-scheme: light)` |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.hero-animation {
  animation: slide-up 300ms ease;

  @include m.reduced-motion {
    animation: none;
  }

  @include m.touch {
    // Blancos de toque mas grandes en dispositivos tactiles
    padding: 1.5rem;
  }
}
```

`m.dark-mode` y `m.light-mode` siguen la preferencia del **sistema**. Para
el tema basado en clases, consulta [Modo oscuro](/es/core/dark-mode/).

## Sobreescribir los niveles

Como ambos mapas son `!default`, configuralos antes del primer uso:

```scss
@use "katanakit-css/src/scss/variables" as v with (
  $breakpoint-sizes: (
    "xs": 0,
    "sm": 600px,
    "md": 900px,
    "lg": 1200px,
    "xl": 1440px,
    "2xl": 1600px
  )
);
@use "katanakit-css/src/scss/mixins" as m with (
  $breakpoints: (
    "xs": 0,
    "sm": 600px,
    "md": 900px,
    "lg": 1200px,
    "xl": 1440px,
    "2xl": 1600px
  )
);
```
