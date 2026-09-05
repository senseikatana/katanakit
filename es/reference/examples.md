# Ejemplos

Ejemplos completos funcionales: tokens, layout, modo oscuro y componentes.

# Ejemplos

Cuatro ejemplos funcionales viven en el directorio `examples/` del
repositorio. Cada uno es un archivo SCSS independiente que puedes compilar
con:

```bash
sass --load-path src/scss examples/<categoria>/<archivo>.scss out.css
```

## 1. Tokens de diseno personalizados

`examples/tokens/custom-tokens.scss` — sobreescribe los mapas de tokens
`!default` con una clausula `with` **antes** de que cualquier cosa los use,
luego consume los nuevos valores a traves de los accesadores.

```scss
// ============================================================
//  examples/tokens/custom-tokens.scss
//  Cómo sobreescribir los tokens del framework ANTES de usarlos.
// ============================================================

// 1) Override de mapas con @use ... with (antes de cualquier @include)
@use "variables" as v with (
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
  )
);

// 2) Emite los tokens como custom properties en :root
@include v.generate-css-tokens();

// 3) Usa las funciones de acceso con los nuevos valores
.hero {
  padding: v.spacing(4);
  border-radius: v.radius("default");
  box-shadow: v.shadow("lg");
  font-family: v.font-family("sans-serif");
}
```

La idea clave: **configurar una vez, antes del primer uso**. Como un modulo
Sass solo puede configurarse una vez por compilacion, la clausula `with` debe
venir antes de que cualquier otro modulo cargue `variables`. Consulta
[Tokens de diseno](/es/core/tokens/) para la referencia completa de tokens.

## 2. Layout de dashboard con grid

`examples/layout/grid-dashboard.scss` — un dashboard construido con los
mixins de grid: un contenedor de 12 columnas, spans explicitos, un colapso
mobile-first via `md-down` y una rejilla responsiva de tarjetas con
`auto-fill`.

```scss
// ============================================================
//  examples/layout/grid-dashboard.scss
//  Layout de dashboard con los mixins de grid y breakpoints.
// ============================================================

@use "mixins" as m;
@use "variables" as v;

.dashboard {
  @include m.grid-container(12, $gap: 1rem, $place-items: stretch, $place-content: stretch);

  // Sidebar: ocupa 3 columnas, el contenido 9
  .sidebar {
    @include m.grid-span(3);
  }

  .content {
    @include m.grid-span(9);
  }

  // En pantallas medianas o menores, todo apila a 1 columna
  @include m.md-down {
    grid-template-columns: 1fr;

    .sidebar,
    .content {
      @include m.grid-span(1);
    }
  }
}

// Rejilla responsive de tarjetas con auto-fill
.cards {
  @include m.grid-responsive(280px, fill, 1fr, 1.5rem);
}

// Colocación explícita de un ítem
.pinned-card {
  @include m.grid-placement(2, 4, 1, 2);
}

// Centrado absoluto
.modal-overlay {
  @include m.grid-center(0);

  .modal {
    @include m.grid-item-center;
    max-width: v.container("md");
  }
}
```

El sidebar y el contenido comparten la misma grid de 12 columnas; por debajo
de `md` todo vuelve a una sola columna. Consulta los
[mixins de Grid](/es/mixins/grid/) para cada mixin usado aqui.

## 3. Tema oscuro

`examples/theme/dark-mode.scss` — publica las paletas invertidas bajo
`:root[data-theme="dark"]` y anade un hook de preferencia del sistema
encima.

```scss
// ============================================================
//  examples/theme/dark-mode.scss
//  Tema oscuro automático: las paletas se invierten (tono 100
//  ↔ 700) bajo :root[data-theme='dark'].
// ============================================================

@use "variables" as v;
@use "mixins" as m;

// Emite :root[data-theme='dark'] con las paletas invertidas
@include v.theme("dark");

// Y añade tu propio hook de sistema si quieres:
@include m.dark-mode {
  :root {
    color-scheme: dark;
  }
}
```

Luego cambia el atributo desde el markup o JavaScript:

```html
<html data-theme="dark">...</html>
```

Lee [Modo oscuro](/es/core/dark-mode/) para la tabla de inversion y los
fragmentos de JavaScript.

## 4. Componentes de boton y tarjeta

`examples/components/button-card.scss` — componentes compuestos construidos
con el sistema [`@apply`](/es/core/apply/).

```scss
// ============================================================
//  examples/components/button-card.scss
//  Componentes compuestos con el sistema @apply propio.
// ============================================================

@use "mixins" as m;

.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);

  &:hover {
    @include m.apply(shadow-lg);
  }
}

.button {
  @include m.apply(
    inline-flex,
    items-center,
    justify-center,
    px-4,
    py-2,
    rounded-md,
    font-semibold,
    transition-colors
  );

  &:hover {
    @include m.apply(bg-white, text-black);
  }
}
```

Cada componente permanece como un unico bloque legible de nombres de
utilidad; el registro los expande a declaraciones puras en tiempo de
compilacion, por lo que el CSS de salida no contiene clases de utilidad para
estos componentes.
