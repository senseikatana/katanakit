# Hoja de ruta

Que se ha enviado y que esta planificado.

# Hoja de ruta

Una lista viva de hacia donde se dirige `katanakit-css` (mini-framework
SCSS). Las contribuciones son bienvenidas; elige un elemento, discutelo en
un issue y abre un pull request.

Leyenda: `[x]` hecho . `[ ]` planificado (sin compromiso de orden).

---

## Estado actual

El framework esta en **0.1.0 (no publicado)**. El ambito enviado esta
documentado en
[CHANGELOG.md](https://github.com/senseikatana/blob/main/CHANGELOG.md); la API en la
[Referencia API](/es/reference/api-reference/).

## Enviado para 0.1.0

- [x] Arquitectura SCSS modular con parciales modernos `@use`/`@forward` y
      una entrada publica sin componentes (`src/scss/main.scss`).
- [x] Sistema de tokens de diseno — mapas `!default` para fuentes, sombras,
      contenedores, breakpoints, espaciado, radios, z-index, duraciones de
      transicion y temporizaciones, emitidos como propiedades personalizadas
      CSS (`--font-*`, `--shadow-*`, `--spacing-*`, `--radius-*`, `--z-*`,
      `--duration-*`, `--ease-*`, ...).
- [x] Sistema de color — seis paletas semanticas (`neutral`, `purple`, `info`,
      `warning`, `danger`, `success`) con **7 tonos cada una** (100–700) mas
      cuatro colores especiales; variables CSS, clases de utilidad
      (`text`/`bg`/`border`/ hover) e inversion de tema oscuro via
      `:root[data-theme="dark"]`.
- [x] Breakpoints responsivos — 7 niveles (`xs` ... `3xl`), generico
      `breakpoint()`/`bp()` con `up`/`down`/`only`/`between`, alias `up` y
      `down` con nombre (`xxl`/`xxxl`, `xxl-down`/`xxxl-down`) y consultas
      de caracteristicas.
- [x] Mixins CSS Grid — auto-fill/fit responsivo, columnas fijas, columnas
      por breakpoint, contenedores, areas, colocacion, apilamiento, helpers
      de elementos, subgrid y (experimental) masonry.
- [x] Mixins Flexbox — contenedor, centrado, gap y helpers de elementos.
- [x] Funciones puras — `rem()`, `px()`, `to-unit()`, `strip-unit()`,
      `fluid()` -> `clamp()`, `tint()`, `shade()`, `saturate-color()`,
      `desaturate-color()`, `complement()`, `contrast()`, `color-mix-var()`,
      `to-class()`.
- [x] Motor de utilidades impulsado por mapas de `_utilities.scss` — clases
      de padding y margin en todas las direcciones (`.p-*`, `.px-*`, `.py-*`,
      `.pt-*`, `.m-*`, `.mx-*`, `.my-*`, ...), `gap-*`/`gap-x-*`/`gap-y-*`,
      tamanos de texto (`.text-xs` ... `.text-4xl`) y anchos de borde
      (`.border`, `.border-0/2/4/8`) activos por defecto; generadores de
      sizing/flex/effects/layout opt-in.
- [x] Registro al estilo `@apply` (`register-utility` + `apply`) mantenido
      en sincronia con los mapas de utilidad.
- [x] Reset preflight extendido al estilo Tailwind cuyos valores por defecto
      son propiedades personalizadas sobreescribibles.
- [x] Demo con Vite (`index.html` + `demo/main.js`) con HMR, un **selector
      de version** (`demo/version-switcher.js`, `yarn build:versions` ->
      `public/versions/`) y una compilacion de produccion con PurgeCSS en
      `demo-dist/`.
- [x] Componentes de ejemplo construidos sobre `@apply`
      (`components/_index.scss`).
- [x] Suite de pruebas (vitest, 26 pruebas sobre fixtures) y documentacion
      completa en ingles (README + `docs/` + CONTRIBUTING/SECURITY/CHANGELOG),
      mas el sitio de documentacion Astro + Starlight en `site/`.

## Planificado

### Utilidades como clases reales

- [ ] Extraer la generacion de clases de `gap`/`margin`/`padding` direccionales
      en un bucle dedicado para que futuras escalas puedan anadir claves sin
      tocar el bloque de auto-emision.

### Arquitectura de tokens

- [ ] **Unificar las dos escalas de espaciado**: `$spacing-scale` (variables
      de tokens y el registro `@apply`) y `$spacing-map` (clases de utilidad)
      actualmente contienen conjuntos de claves diferentes. Unificarlas haria
      que las variables `--spacing-*`, las clases `.p-*` y los nombres de
      `apply()` fueran una sola fuente de verdad.
- [ ] Prefijo configurable para las propiedades personalizadas CSS generadas
      (un `$prefix` opcional en `generate-css-tokens()`/`generate-css-vars()`).
- [ ] Evaluar un tercer nivel de escala (tamanos `3xl`/`4xl`) y alias de
      opacidad/grosor con nombre.

### Colores

- [ ] Extender el sistema de paletas mas alla de 7 tonos (por ejemplo tonos
      50 y 800/900) sin romper los consumidores existentes de 100–700.
- [ ] Variantes hover para `border-*` (`hover-border-*`), reflejando
      `hover-text-*`/`hover-bg-*`.
- [ ] Documentacion para la paleta de marca personal (`colors-palette.md`)
      como tema de partida, mantenido separado de las paletas del framework.

### Componentes y extras

- [ ] Distribuir un modulo `components` opt-in en npm (solo los mixins/registro
      que necesita), manteniendo la hoja publica sin componentes.
- [ ] Mixins de ayuda contenedor/`max-w` sobre los tokens `--container-*`.

### DX y herramientas

- [ ] Integracion continua con GitHub Actions (probar con multiples versiones
      de Dart Sass, compilar ambos artefactos, cachear Yarn).
- [ ] Documentar la biblioteca TypeScript hermana `katanakit-js` junto a este
      repositorio para que los dos proyectos esten claramente distinguidos.

---

## Contribuir a la hoja de ruta

Si quieres abordar un elemento planificado, abre un issue primero para
acordar el enfoque (algunos elementos toman decisiones de API que rompen
compatibilidad). Consulta
[CONTRIBUTING.md](https://github.com/senseikatana/blob/main/CONTRIBUTING.md) para el flujo
de desarrollo.
