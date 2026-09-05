# Breakpoints

Referencia tecnica del motor de mixins de breakpoints.

# Breakpoints

Referencia tecnica del motor de mixins responsivos en el modulo `mixins`. Para
una vista conceptual y las consultas de caracteristicas, consulta
[Breakpoints](/es/core/breakpoints/).

```scss
@use "katanakit-css/src/scss/mixins" as m;
```

## Configuracion

`m.$breakpoints` (todos `!default`):

| Nivel | Ancho |
| --- | --- |
| `xs` | `0` |
| `sm` | `640px` |
| `md` | `768px` |
| `lg` | `1024px` |
| `xl` | `1280px` |
| `2xl` | `1536px` |
| `3xl` | `1920px` |

## `breakpoint($from, $direction: up, $to: null)`

Abre una consulta `@media`. `$from` y `$to` aceptan un nombre de nivel
(string) o un numero px en bruto (los numeros sin unidad se tratan como px).
`bp($args...)` es un alias que reenvia sus argumentos.

| Direccion | Consulta media |
| --- | --- |
| `up` | `(min-width: X)` |
| `down` | `(max-width: calc(X - 0.02px))` |
| `only` | `(min-width: X) and (max-width: calc(Y - 0.02px))` — requiere `$to` |
| `between` | `(min-width: X) and (max-width: Y)` — requiere `$to` |

```scss
@include m.breakpoint("sm", up)      { /* >= 640px */ }
@include m.breakpoint("md", down)    { /* <= 767.98px */ }
@include m.breakpoint("sm", only, "md") { /* 640px–767.98px */ }
@include m.breakpoint("md", between, "xl") { /* 768px–1280px */ }
@include m.breakpoint(500px, up)     { /* valor en bruto */ }
@include m.bp("lg", down)            { /* alias */ }
```

Una direccion invalida o un `$to` faltante lanza un `@error` en tiempo de
compilacion.

## Mixins con nombre — direccion `up`

| Mixin | Equivalente |
| --- | --- |
| `m.xs` | `breakpoint("xs", up)` |
| `m.sm` | `breakpoint("sm", up)` |
| `m.md` | `breakpoint("md", up)` |
| `m.lg` | `breakpoint("lg", up)` |
| `m.xl` | `breakpoint("xl", up)` |
| `m.xxl` | `breakpoint("2xl", up)` |
| `m.xxxl` | `breakpoint("3xl", up)` |

```scss
.sidebar {
  display: none;

  @include m.lg { display: block; }
}
```

## Mixins con nombre — direccion `down`

| Mixin | Equivalente |
| --- | --- |
| `m.xs-down` | `breakpoint("xs", down)` |
| `m.sm-down` | `breakpoint("sm", down)` |
| `m.md-down` | `breakpoint("md", down)` |
| `m.lg-down` | `breakpoint("lg", down)` |
| `m.xl-down` | `breakpoint("xl", down)` |
| `m.x2l-down` | `breakpoint("2xl", down)` |
| `m.x3l-down` | `breakpoint("3xl", down)` |
| `m.xxl-down` | alias de `m.x2l-down` |
| `m.xxxl-down` | alias de `m.x3l-down` |

```scss
.grid {
  grid-template-columns: repeat(4, 1fr);

  @include m.md-down { grid-template-columns: 1fr; }
  @include m.xxl-down { padding-inline: 2rem; }
}
```

## Mixins de consultas de caracteristicas

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
.menu {
  @include m.touch { padding: 1rem; }   // blancos mas grandes en dispositivos tactiles
  @include m.reduced-motion { transition: none; }
}
```
