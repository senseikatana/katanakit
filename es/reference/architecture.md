# Arquitectura

Como esta organizado KatanaKIT CSS y como funciona la canalizacion de compilacion.

# Arquitectura

Este documento explica como esta organizado `katanakit-css`, como se
relacionan los modulos entre si y como un archivo fuente `.scss` se
convierte en los artefactos que distribuyes.

> Resumen — `katanakit-css` es **SCSS de tiempo de compilacion**. No hay
> runtime de JavaScript. Todo lo produce el compilador Sass a partir de mapas
> de tokens con `!default`.

---

## 1. Vision general

El framework es una coleccion de **modulos** Sass (parciales) mas dos
entradas compilables:

| Entrada | Que emite | Usado para |
| --- | --- | --- |
| `src/scss/main.scss` | "Hoja completa" publica: reset + propiedades personalizadas de tokens + variables de color y utilidades + todos los generadores de utilidades. **Sin componentes.** | Artefacto npm `dist/css/katanakit.css` y consumidores de `@use "katanakit-css/src/scss/main"`. |
| `src/scss/demo.scss` | `@use "main"` + `@use "components/index"` (componentes de ejemplo construidos sobre `apply`). | Demo local solamente (Vite). |

Los componentes se mantienen intencionalmente fuera de `main.scss`: son
estilos de *ejemplo*, no API del framework.

---

## 2. Modelo de capas

```
+------------------------------------------------------------------+
| PUNTOS DE ENTRADA                                                 |
|   main.scss  .  demo.scss                                         |
+-----------------+------------------------------------------------+
                  | @use
+-----------------v------------------------------------------------+
| MODULOS NUCLEO (src/scss/*.scss)                                  |
|   reset . variables(v) . functions(f) . mixins(m)                 |
|   utilities(u)                                                    |
+--------+----------------------------+----------------------------+
         | @use/@forward              | @use
+--------v-----------------------+ +-v----------------------------+
| (fusionado en _mixins.scss)    | | COMPONENTES (solo demo)       |
|  breakpoints . grid . flex     | |   components/_index.scss      |
|  apply . theme . core          | |   usa mixins                  |
+--------------------------------+ +-------------------------------+
```

Los modulos nunca se `@import` entre si; usan `@use` moderno (minusculas)
con namespaces explicitos. Las anteriores capas `partials/` y
`partials/utils/` han sido consolidadas: `_variables.scss` absorbe colores
y tema, `_mixins.scss` absorbe breakpoints, grid, flex, apply y generadores
nucleo, y `_utilities.scss` absorbe todos los mapas y generadores de clases.

---

## 3. Responsabilidades de cada parcial

| Parcial | Namespace | Responsabilidad |
| --- | --- | --- |
| `_reset.scss` | — | Reset moderno. Los valores por defecto se exponen como propiedades personalizadas `:root` (`--m-reset`, `--box-sizing`, `--min-h-screen`, ...) para que un tema pueda cambiarlos sin editar el reset. |
| `_variables.scss` | `as v` | Mapas de tokens `!default` (fuentes, sombras, contenedores, breakpoints, espaciado, radios, z, duraciones, temporizaciones), funciones de acceso, `generate-css-tokens()`, tokens/funciones de color (`get-color`/`get`/`alpha`), `generate-css-vars()`, utilidades de color y `theme()`. |
| `_functions.scss` | `as f` | Helpers puros: conversion de unidades, `fluid()` -> `clamp()`, manipulacion de color, `color-mix-var()`, `to-class()`. Sin salida CSS. |
| `_mixins.scss` | `as m` | Consultas de breakpoint (`breakpoint()`/`bp()`, alias con nombre, consultas de caracteristicas), mixins de composicion de grid, mixins de contenedor/elemento flex, registro `@apply` (`register-utility()`/`apply()`), generadores nucleo (`utils-classes`, `vars-list`/`vars-map`, helpers de centrado) y hook de tema. |
| `_utilities.scss` | `as u` | Mapas de tokens de utilidad (`$sizing-map`, `$font-size-map`, `$border-width-map`, etc.) mas todos los generadores de clases (`get-sizing-classes`, `generate-flex-utilities`, `generate-effects-utilities`, `generate-layout-utilities`, `generate-all-utilities`). |

---

## 4. El motor de utilidades

El sistema de utilidades esta deliberadamente impulsado por mapas para que
los tokens y las clases generadas no puedan desviarse.

### 4.1 Los mapas son la fuente unica de verdad

`_utilities.scss`, `_variables.scss` y `_mixins.scss` contienen los mapas
de tokens de utilidad. Los mapas de sizing/font-size/border-width viven en
`_utilities.scss`; `$spacing-map` vive en `_variables.scss` (compartido por
el generador de clases y el registro `@apply`); el resto vive en
`_mixins.scss` junto al generador de clases generico:

- `$sizing-map` (valores de width/height, incl. `full`, `screen`, `min`,
  `max`, `fit`),
- `$spacing-map` (escala de padding/margin/gap; las claves son literales:
  `"05"`, `"1-5"`, `"2-5"`, `"3-5"`, `"base"` ...),
- `$font-size-map` (`.text-xs` ... `.text-4xl`),
  `$border-width-map` (`.border-0/2/4/8`),
- `$flex-direction-map`, `$flex-wrap-list`, `$align-items-map`,
  `$justify-content-map`,
- `$shadow-map`, `$radius-map`, `$z-layers-map`, `$transition-duration-map`,
  `$transition-timing-map`, `$opacity-values`,
- `$font-weight-values`, `$text-align-values`, `$display-values`,
  `$position-values`, `$overflow-values`, `$white-space-list`,
  `$overflow-wrap-list`.

Todos los mapas son `!default`, por lo que los proyectos dependientes pueden
sobreescribirlos con la clausula `with` de Sass.

### 4.2 De mapas a clases CSS

```
_utilities.scss (mapas) -> generadores (_utilities.scss)
                              |  usa m.utils-classes($input, $property, $prefix)
                              v
                     .w-full { width: 100% }
                     .hidden { display: none }   // $display-values mapea hidden -> none
                     .font-normal { font-weight: 400 }
                     .gap-4 { gap: 1rem }
                     ...
```

- `_mixins.scss` proporciona los mixins genericos `utils-classes()` /
  `utils-classes-hover()` mas helpers de variables CSS (`vars-list`,
  `vars-map`) y helpers de centrado (`absolute-center`, `center-mx`,
  `center-my`).
- `_utilities.scss` emite, automaticamente al cargarse: clases de padding y
  margin en todas las direcciones (`.p-*`, `.px-*`, `.py-*`, `.pt-*`, ...,
  `.m-*`, `.mx-*`, `.my-*`, ...), `gap-*`/`gap-x-*`/`gap-y-*` para cada
  clave de `$spacing-map`, tamanos de texto (`.text-xs` ... `.text-4xl`),
  anchos de borde (`.border`, `.border-0/2/4/8`), mas `.gap`, `.shadow` y
  `.rounded`. Esto significa que cargar el modulo es suficiente para obtener
  las clases comunes de espaciado y tipografia.
- El resto es **opt-in**: `get-sizing-classes()`,
  `generate-flex-utilities()`, `generate-effects-utilities()` y
  `generate-layout-utilities()`. `generate-all-utilities()` las llama a
  todas, lo que invoca `main.scss`.

### 4.3 El registro apply refleja los mismos mapas

`_mixins.scss` construye su registro automatico con bucles `@each` sobre
**los mismos mapas de utilidad que impulsan los generadores de clases** —
`$radius-map`, `$shadow-map`, `$z-layers-map`, `$transition-duration-map`,
`$transition-timing-map`, `$opacity-values`, `$display-values`,
`$position-values`, `$overflow-values`, `$text-align-values`,
`$font-weight-values`, `$flex-direction-map`, `$flex-wrap-list`,
`$align-items-map`, `$justify-content-map` — mas el mapa de tokens
`$spacing-scale` de `_variables.scss` para los nombres de espaciado**. Esto
mantiene `apply(flex, p-4, rounded-lg, ...)` consistente con las clases
generadas `.flex`, `.p-4` y `.rounded-lg`, y significa que un cambio de
escala se propaga a ambos sistemas a la vez.

El registro tambien lleva helpers escritos a mano que *no* se generan como
clases (`flex-1`, `flex-auto`, `flex-none`, columnas de grid (`grid-cols-*`,
`col-span-full`), transiciones, ...). Esos nombres solo estan disponibles
dentro de `@include a.apply(...)`.

### 4.4 Utilidades de color

Las utilidades de color **no** pasan por el motor generico. `_variables.scss`
las emite con un helper dedicado que itera `$colors` x `$shades` y
`$special-colors`:

```
.text-neutral-500  { color: hsl(0 0% 35%) }
.bg-info-300       { background-color: ... }
.border-white      { border-color: ... }
.hover-bg-success-600:hover { ... }
```

Las propiedades personalizadas de paleta (`--neutral-500`, `--white`, ...)
son una salida paralela de `generate-css-vars()`; las clases de utilidad
mantienen **valores literales** para que la purga de CSS basada en clases
pueda eliminarlas de forma segura mientras las variables de tokens permanecen
en `:root`.

---

## 5. Tokens y el bloque `:root`

`main.scss` llama, en orden:

```scss
@use "./reset";            // el reset emite sus propios :root defaults
@use "./variables" as v;
@use "./functions" as f;
@use "./mixins" as m;
@use "./utilities" as u;

@include v.generate-css-tokens();  // --font-*, --shadow-*, --spacing-*, ...
@include v.generate-css-vars();    // --neutral-100..., --white, ...
@include v.all-utilities();        // .text-*, .bg-*, .border-*, hover
@include u.generate-all-utilities();
```

Las propiedades personalizadas CSS se agrupan bajo `:root`. Como cada mapa
de tokens es `!default`, un consumidor puede reconfigurar toda la salida
cargando el modulo `variables` con una clausula `with` *antes* de que
cualquier otro lo cargue (un modulo Sass solo puede configurarse una vez
por compilacion).

Los temas oscuros no editan `:root`: `theme("dark")` emite un bloque
*adicional* bajo `:root[data-theme="dark"]` con cada paleta invertida
(`100` ↔ `700`, `200` ↔ `600`, `300` ↔ `500`), dejando los valores por defecto
claros intactos.

---

## 6. Canalizacion de compilacion

Dos canalizaciones independientes producen los artefactos:

```
(1) artefacto npm
    src/scss/main.scss
          |  yarn build:css
          |  sass src/scss/main.scss dist/css/katanakit.css
          |  --no-source-map --style=compressed
          v
    dist/css/katanakit.css            <-- distribuido, referenciado por "style"

(2) demo local
    src/scss/demo.scss  +  index.html + demo/main.js
          |  yarn dev        ->  vite dev server (HMR, puerto 4321)
          |  yarn build:demo ->  vite build
          |                     PostCSS autoprefixer  +  PurgeCSS
          v
    demo-dist/ (index.html + assets/*.css + assets/*.js)
```

Notas sobre la compilacion de la demo (`vite.config.js`):

- `publicDir: false` — no hay carpeta estatica; el CSS se compila desde el
  grafo de modulos SCSS.
- El contenido de PurgeCSS es `index.html` + `demo/**/*.{js,ts}`. Una lista
  segura mantiene tokens que parecen variantes (`hover:*`, `md:*`, ...) y se
  preservan keyframes/font-faces.
- `variables: false` — PurgeCSS mantiene las propiedades personalizadas en
  `:root` (las variables de tokens/color) aunque las clases de utilidad usen
  valores literales.
- La salida va a `demo-dist/`, intencionalmente **no** a `dist/`, para que la
  demo nunca sobreescriba el artefacto CSS de npm.
- El artefacto `dist/css/katanakit.css` lo produce el CLI de Sass solo;
  ejecuta tu propio PostCSS (por ejemplo autoprefixer) cuando consumas el
  fuente SCSS si necesitas prefijos para navegadores antiguos.

La suite de pruebas (`vitest`, `test/**/*.test.mjs`) compila las entradas y
fixtures en memoria via la API JS de Sass (`loadPaths: src/scss`) y afirma
sobre el CSS compilado; nunca escribe en `src/` ni `dist/`.

---

## 7. Convenciones que mantienen la arquitectura intacta

1. **Una responsabilidad por parcial** — pon nuevas capacidades en el modulo
   que posee esa preocupacion (tokens y colores en `_variables.scss`, mixins
   en `_mixins.scss`, mapas de utilidad y generadores en `_utilities.scss`,
   ...).
2. **Solo sintaxis de modulos moderna** — `@use`/`@forward`, nunca `@import`.
3. **Los mapas son `!default`** — cualquier escala puede sobreescribirse sin
   forks.
4. **Claves literales en kebab-case** — las claves de utilidad (`.p-05`,
   `.p-1-5`, `.w-screen`) coinciden exactamente con las claves del mapa; no
   hay capa de conversion de corchetes.
5. **Clases generadas vs registro** — solo los mixins emiten clases
   explicitamente; registrar una utilidad para `apply` nunca crea una clase
   por si sola.
6. **`main.scss` permanece sin componentes** — los componentes de ejemplo
   viven en `components/_index.scss` y los引入 `demo.scss`, nunca la hoja
   publica.
