# Tokens de diseno

Mapas de tokens, funciones de acceso y generacion de propiedades personalizadas.

# Tokens de diseno

Cada decision de diseno en KatanaKIT CSS vive en un conjunto de mapas SCSS
con `!default` en `src/scss/_variables.scss`. Como los mapas son `!default`,
los sobreescribes **una vez por compilacion** con una clausula `with` de Sass,
y tanto los accesores de tokens como el CSS generado se actualizan en
consecuencia.

Todos los mapas de tokens se consumen a traves del modulo `variables`:

```scss
@use "katanakit-css/src/scss/variables" as v;
```

## Mapas de tokens

| Mapa | Claves | Alimenta |
| --- | --- | --- |
| `$font-families` | `sans-serif`, `serif`, `mono` | `v.font-family()` |
| `$shadow-sizes` | `default`, `sm`, `md`, `lg`, `xl`, `2xl`, `inner` | `v.shadow()` |
| `$container-sizes` | `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl` | `v.container()` |
| `$breakpoint-sizes` | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` | `v.breakpoint()` |
| `$spacing-scale` | `0`, `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`, `32` | `v.spacing()` |
| `$spacing-map` | escala completa incl. fracciones (`05`, `1-5`, `2-5`, `3-5`, `base`, `9`, `11`, `14`, ... `96`) | clases `.p-*` `.m-*` `.gap-*` |
| `$radius` | `default`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full` | `v.radius()` |
| `$z-layers` | `auto`, `0`, `10`, `20`, `30`, `40`, `50`, `dropdown`, `sticky`, `fixed`, `modal`, `popover`, `tooltip` | `v.z()` |
| `$transition-durations` | `75`, `100`, `150`, `200`, `300`, `500`, `700`, `1000` | `v.duration()` |
| `$transition-easings` | `linear`, `in`, `out`, `in-out` | `v.ease()` |

Dos mapas de espaciado coexisten a proposito:

- `$spacing-scale` es la **escala semantica** usada por el accesador
  `v.spacing()` y expuesta como propiedades personalizadas `--spacing-*`.
- `$spacing-map` es la **escala de clases** — la fuente unica de verdad para
  las clases de utilidad `.p-*`, `.m-*` y `.gap-*`. Anade pasos fraccionarios
  (`05`, `1-5`, `2-5`, `3-5`), `base` (1px) y los pasos intermedios
  (`7`, `9`, `11`, `14`, `28`, ... `96`) que los generadores de clases emiten.

## Funciones de acceso

Cada accesador valida su clave en tiempo de compilacion y lanza un `@error`
que enumera las claves validas cuando te equivocas.

| Firma | Devuelve | Ejemplo |
| --- | --- | --- |
| `v.font-family($name)` | lista de fuentes | `v.font-family("sans-serif")` |
| `v.shadow($size: "default")` | lista de sombras | `v.shadow("md")` |
| `v.container($size)` | longitud | `v.container("lg")` -> `32rem` |
| `v.breakpoint($name)` | longitud en px | `v.breakpoint("md")` -> `768px` |
| `v.spacing($size)` | longitud (numero o clave string) | `v.spacing(4)` -> `1rem` |
| `v.radius($size: "default")` | longitud | `v.radius("xl")` -> `0.75rem` |
| `v.z($layer)` | numero o `auto` | `v.z("modal")` -> `1040` |
| `v.duration($ms)` | duracion | `v.duration(200)` -> `200ms` |
| `v.ease($name: "in-out")` | funcion de temporizacion | `v.ease("out")` |

```scss
@use "katanakit-css/src/scss/variables" as v;

.card {
  padding: v.spacing(4);
  border-radius: v.radius("default");
  box-shadow: v.shadow("lg");
  font-family: v.font-family("sans-serif");
}

.overlay {
  z-index: v.z("modal");
  transition: opacity v.duration(200) v.ease("out");
}
```

## Generar propiedades personalizadas CSS

`generate-css-tokens()` emite las familias de tokens como propiedades
personalizadas en `:root`. Pasa `false` para omitir una familia:

```scss
@mixin generate-css-tokens(
  $fonts: true, $shadows: true, $containers: true, $spacing: true,
  $radius-tokens: true, $z: true, $durations: true, $easings: true
)
```

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-tokens();

// Solo fuentes y sombras:
@include v.generate-css-tokens($containers: false, $spacing: false);
```

Resultado compilado:

```css
:root {
  --font-sans-serif: ui-sans-serif, system-ui, -apple-system, ...;
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --container-xl: 36rem;
  --spacing-4: 1rem;
  --radius-full: 9999px;
  --z-tooltip: 1060;
  --duration-200: 200ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Los nombres de las variables no llevan prefijo de marca: `--font-*`,
`--shadow-*`, `--container-*`, `--spacing-*`, `--radius-*`, `--z-*`,
`--duration-*` y `--ease-*`.

## Sobreescribir tokens

Configura el modulo con `with` **antes** de que cualquier otro lo cargue; un
modulo solo puede configurarse una vez por compilacion:

```scss
// styles/tokens.scss — configurar primero
@use "katanakit-css/src/scss/variables" as v with (
  $spacing-scale: (
    "0": 0,
    "1": 0.5rem,
    "2": 1rem,
    "3": 1.5rem,
    "4": 2rem
  ),
  $radius: (
    "default": 0.5rem,
    "full": 9999px
  ),
  $breakpoint-sizes: (
    "xs": 0,
    "sm": 600px,
    "md": 900px,
    "lg": 1200px,
    "xl": 1440px
  )
);

// styles/main.scss — luego consumir
@use "tokens";
@use "katanakit-css/src/scss/main";
```

Los accesadores, las propiedades personalizadas `--spacing-*` y las clases
de utilidad que derivan de los mapas configurados toman todos los nuevos
valores.

## Paginas relacionadas

- [Colores](/es/core/colors/) — las paletas de color y sus accesadores.
- [Breakpoints](/es/core/breakpoints/) — niveles de breakpoint responsivos.
- [Funciones](/es/reference/functions/) — funciones puras auxiliares.
