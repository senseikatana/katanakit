# KatanaKIT CSS

Un mini-framework SCSS ligero y modular: tokens de diseno, clases de utilidad y mixins de layout sin sobrecarga en tiempo de ejecucion.

## Por que KatanaKIT CSS

KatanaKIT CSS es un framework de **SCSS puro** inspirado en el enfoque
utility-first de Tailwind CSS, pero sin una canalizacion de compilacion que
no controles. Todo se genera en tiempo de compilacion a partir de mapas de
tokens de diseno con `!default`:

- **Tokens de diseno** — fuentes, espaciado, radios, sombras, capas z,
  duraciones y funciones de temporizacion como mapas SCSS, emitidos como
  propiedades personalizadas de CSS.
- **Sistema de color** — 6 paletas x 7 tonos + colores especiales, con
  clases de utilidad, variantes hover y un tema oscuro automatico.
- **Mixins de layout** — breakpoints (7 niveles, mobile-first), un conjunto
  completo de CSS Grid y helpers de flexbox.
- **Clases de utilidad** — espaciado con padding y margin direccionales
  (`.p-*`, `.px-*`, `.py-*`, `.pt-*` ... `.m-*`, `.mx-*`, `.my-*` ...),
  `gap-*`/`gap-x-*`/`gap-y-*`, tamanos de texto (`.text-xs` ... `.text-4xl`)
  y anchos de borde (`.border`, `.border-0`/`2`/`4`/`8`), mas dimensiones,
  flex, efectos, tipografia y layout generados desde mapas `!default`.
- **Preflight extendido** — un reset estilo Tailwind que normaliza
  tipografia, listas, enlaces, formularios y media sobre valores por defecto
  basados en tokens.
- **Composicion al estilo `@apply`** — un pequeno sistema de registro para
  componer utilidades dentro de tus componentes.

## Instalacion rapida

```bash
npm install katanakit-css
```

```scss
// Hoja de estilos completa (reset + tokens + utilidades)
@use "katanakit-css/src/scss/main";

// O compone tu propia hoja a partir de modulos
@use "katanakit-css/src/scss/functions" as f;
@use "katanakit-css/src/scss/variables" as v;
@use "katanakit-css/src/scss/mixins" as m;
```

Consulta [Primeros pasos](/es/getting-started/) para la guia completa y la
[Referencia API](/es/reference/api-reference/) para cada funcion, mixin y
mapa.

## Playground

El repositorio incluye una demo con Vite (`yarn dev` -> http://localhost:4321)
con un boton de **selector de version**: alterna entre el SCSS en vivo (HMR)
y las compilaciones del framework publicadas, compiladas por `yarn build:versions`
en `public/versions/`.
