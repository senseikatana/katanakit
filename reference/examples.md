# Examples

Full working examples — tokens, layout, dark mode and components.

# Examples

Four working examples live in the `examples/` directory of the repository.
Each one is a standalone SCSS file you can compile with:

```bash
sass --load-path src/scss examples/<category>/<file>.scss out.css
```

## 1. Custom design tokens

`examples/tokens/custom-tokens.scss` — override the `!default` token maps
with a `with` clause **before** anything uses them, then consume the new
values through the accessors.

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

The key idea: **configure once, before first use**. Because a Sass module can
only be configured once per compilation, the `with` clause must come before
any other module loads `variables`. See
[Design Tokens](/core/tokens/) for the full token reference.

## 2. Grid dashboard layout

`examples/layout/grid-dashboard.scss` — a dashboard built with the grid
mixins: a 12-column container, explicit spans, a mobile-first collapse via
`md-down` and a responsive card grid with `auto-fill`.

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

The sidebar and content share the same 12-column grid; below `md` everything
falls back to a single column. See the [Grid mixins](/mixins/grid/)
for every mixin used here.

## 3. Dark theme

`examples/theme/dark-mode.scss` — publish the inverted palettes under
`:root[data-theme="dark"]` and add a system-preference hook on top.

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

Then toggle the attribute from markup or JavaScript:

```html
<html data-theme="dark">…</html>
```

Read [Dark Mode](/core/dark-mode/) for the inversion table and
JavaScript snippets.

## 4. Button and card components

`examples/components/button-card.scss` — composite components built with the
[`@apply`](/core/apply/) system.

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

Each component stays a single, readable block of utility names — the registry
expands them to plain declarations at compile time, so the output CSS
contains no utility classes for these components.
