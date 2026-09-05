# Primeros pasos

Instala katanakit-css y escribe tus primeros estilos.

# Primeros pasos

Esta guia te acompana en la instalacion de `katanakit-css` y la escritura de
tus primeros estilos. Asume familiaridad basica con la sintaxis de modulos de
Sass (`@use`). Si eres nuevo en el framework, revisa la
[Introduccion](/es/) primero; esta guia profundiza mas en las
opciones de configuracion concretas.

La superficie API completa y verificada por codigo vive en la
[Referencia API](/es/reference/api-reference/).

---

## Requisitos previos

- **Node.js** (>= 20 es un limite seguro) para instalar el paquete.
- Un **compilador Sass** (Dart Sass es con lo que se prueba este proyecto)
  cuando consumas el codigo fuente SCSS. `sass` es un devDependency del
  repositorio, pero es tu responsabilidad en los proyectos dependientes.
- La **hoja de estilos precompilada** (`dist/css/katanakit.css`) no necesita
  herramientas adicionales.

**No hay tiempo de ejecucion**: `katanakit-css` es SCSS/CSS puro de tiempo
de compilacion.

---

## Instalacion

```bash
npm install katanakit-css
# o
yarn add katanakit-css
```

### Elegir un punto de entrada

| Entrada | Que obtienes |
| --- | --- |
| `dist/css/katanakit.css` | **Hoja completa** compilada y minificada (reset + tokens + utilidades). |
| `katanakit-css/src/scss/main` | Hoja completa como SCSS que tu compilas (permite prefijos de navegador, purga personalizada, tree-shaking de modulos SCSS). |
| `katanakit-css/src/scss/*` | Modulos individuales que compones en una hoja personalizada. |

Todas las importaciones SCSS usan `@use` en **minusculas** con un namespace
explicito. No hay `@import` heredado en ningun lugar.

---

## Ruta 1 — CSS precompilado

Enlazalo o importalo:

```html
<link rel="stylesheet" href="/node_modules/dist/css/katanakit.css" />
```

O importalo desde tu entrada de JavaScript en una aplicacion basada en bundler:

```js
import "katanakit-css/dist/css/katanakit.css";
```

La hoja ya contiene todas las clases de utilidad que el framework puede
generar, asi que puedes empezar a escribir markup inmediatamente:

```html
<body class="bg-neutral-100 text-neutral-500">
  <main class="p-8">
    <h1 class="text-2xl mb-4">Hola KatanaKIT</h1>
    <div class="card"><!-- estilado por tu propio CSS de componente --></div>
  </main>
</body>
```

Compensacion: la hoja completa es comoda, pero incluye todas las utilidades.
Para un resultado mas pequeno, usa la Ruta 2 o 3 y deja que tu compilacion
(o PurgeCSS, como hace la demo) elimine las clases no utilizadas.

---

## Ruta 2 — compilar la entrada SCSS completa

```scss
// styles/main.scss
@use "katanakit-css/src/scss/main";
```

Anade `styles/main.scss` a tu canalizacion de Sass. Esto compila el mismo
contenido que la hoja precompilada: un reset preflight al estilo Tailwind,
propiedades personalizadas de tokens en `:root`, propiedades personalizadas
de color y utilidades, y todos los generadores de utilidades.

Para usar el registro `@apply` o los mixins en tu propio SCSS, carga los
parciales tambien:

```scss
@use "katanakit-css/src/scss/mixins" as m;

.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);

  @include m.md {
    @include m.apply(flex-row, gap-6);
  }
}
```

---

## Ruta 3 — componer una hoja personalizada

Solo pagas por los modulos que cargas. Cada parcial es importable; todos los
mapas de tokens son `!default`.

```scss
// styles/theme.scss
@use "katanakit-css/src/scss/reset";
@use "katanakit-css/src/scss/variables" as v;
@use "katanakit-css/src/scss/functions" as f;
@use "katanakit-css/src/scss/mixins" as m;
@use "katanakit-css/src/scss/utilities" as u;

// Tokens y variables de color
@include v.generate-css-tokens();
@include v.generate-css-vars();

// Utilidades de color: texto, fondos y hover text/bg
@include v.all-utilities();

// Generadores de utilidades (opt-in)
@include u.generate-all-utilities();
```

Recuerda: con solo cargar el modulo `utilities` se emiten automaticamente las
clases de espaciado — padding y margin en todas las direcciones (`.p-*`,
`.px-*`, `.py-*`, `.pt-*`, `.m-*`, `.mx-*`, `.my-*`, ...) mas
`gap-*`/`gap-x-*`/`gap-y-*` — tamanos de texto (`.text-xs` ... `.text-4xl`)
y anchos de borde (`.border`, `.border-0`/`2`/`4`/`8`), asi como `.gap`,
`.shadow` y `.rounded`. `generate-all-utilities()` anade clases de
dimensiones, flex, efectos y layout. Omite los generadores que no necesites.

---

## Sobreescribir tokens de diseno

Los mapas de tokens son `!default`, asi que los sobreescribes con una clausula
`with` de Sass. Como un modulo solo puede configurarse una vez por compilacion,
configura `variables` **antes** de que cualquier otro lo cargue:

```scss
// styles/tokens.scss — configurar primero
@use "katanakit-css/src/scss/variables" with (
  $font-families: (
    "sans-serif": (system-ui, -apple-system, "Segoe UI", sans-serif),
    "serif": (Georgia, "Times New Roman", serif),
    "mono": (ui-monospace, "SFMono-Regular", Menlo, monospace),
  ),
  $spacing-scale: (
    "0": 0, "1": 0.25rem, "2": 0.5rem, "3": 0.75rem, "4": 1rem,
    "6": 1.5rem, "8": 2rem, "12": 3rem, "16": 4rem, "20": 5rem,
  ),
  $breakpoint-sizes: ("xs": 0, "sm": 600px, "md": 900px, "lg": 1200px, "xl": 1440px, "2xl": 1600px, "3xl": 1920px),
);

// styles/main.scss — luego consumir
@use "tokens";
@use "katanakit-css/src/scss/main";
```

Los mapas de utilidades (`_utilities.scss`) se configuran de la misma manera
si los cargas directamente, por ejemplo `$sizing-map`, `$spacing-map`,
`$radius-map`, `$shadow-map`, `$z-layers-map`, `$opacity-values`,
`$font-weight-values`, etc.

---

## Colores y tema oscuro

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-vars();
@include v.theme("dark"); // paletas invertidas bajo :root[data-theme="dark"]
```

```html
<html data-theme="dark">
  <body class="bg-neutral-100 text-neutral-500">
    <!-- neutral 100 es ahora el tono mas oscuro cuando el tema oscuro esta activo -->
  </body>
</html>
```

Las funciones te dan los colores crudos en tiempo de compilacion:
`v.get-color("info", 300)`, `v.get("success")`, `v.alpha("danger", 500, 0.4)`.

---

## Siguientes pasos

- [Referencia API](/es/reference/api-reference/) — lista completa de
  funciones, mixins y mapas por modulo.
- [Arquitectura](/es/reference/architecture/) — grafo de modulos y flujo de
  compilacion.
- [Hoja de ruta](/es/reference/roadmap/) — trabajo enviado y planificado.
- [Demo](https://github.com/senseikatana/katanakit-css#run-the-demo-locally) —
  ejecuta `yarn dev` e inspecciona `index.html` + `demo/main.js` para un
  ejemplo funcional de todo lo anterior.
