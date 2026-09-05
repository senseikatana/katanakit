# Modo oscuro

Tema oscuro automatico con paletas invertidas via data-theme.

# Modo oscuro

KatanaKIT CSS genera un tema oscuro basado en clases de forma gratuita:
`v.theme("dark")` toma las seis paletas, **invierte cada tono** (`100 <-> 700`,
`200 <-> 600`, `300 <-> 500`) y publica el resultado como propiedades
personalizadas bajo `:root[data-theme="dark"]`.

La inversion se aplica a las **propiedades personalizadas** (`--neutral-100`,
...). Las clases de utilidad de color (`.bg-neutral-100`,
`.text-neutral-500`, ...) compilan a valores literales y son independientes
del tema; usa las variables en tus propias reglas cuando necesites estilos
conscientes del tema.

## Activar el tema oscuro

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-vars(); // valores por defecto claros en :root
@include v.theme("dark");       // paletas invertidas en :root[data-theme="dark"]
```

```css
:root[data-theme="dark"] {
  --neutral-100: hsl(0, 0%, 12%);   /* era 700 */
  --neutral-200: hsl(0, 0%, 24%);   /* era 600 */
  /* ... */
  --neutral-700: hsl(0, 0%, 93%);   /* era 100 */
}
```

Luego cambia el tema estableciendo el atributo:

```html
<html data-theme="dark">
  <body class="surface text-body">
    <!-- .surface/.text-body son TUS reglas que consumen
         var(--neutral-100) / var(--neutral-500): bajo el
         tema oscuro esas variables ahora contienen los tonos invertidos -->
  </body>
</html>
```

```js
// Alternar entre claro y oscuro
document.documentElement.setAttribute("data-theme", "dark");
document.documentElement.removeAttribute("data-theme");
```

## Como funciona la inversion

La inversion es una transformacion pura de mapa: `$inverted: 800 - $shade`.

| Tono claro | Tono oscuro |
| --- | --- |
| `100` | `700` |
| `200` | `600` |
| `300` | `500` |
| `400` | `400` |
| `500` | `300` |
| `600` | `200` |
| `700` | `100` |

Por esto el vocabulario tonal se mantiene estable: `bg-neutral-100` es
siempre "la superficie", `text-neutral-500` es siempre "el texto legible";
los valores HSL reales se intercambian por debajo.

## Construir sobre las variables

Las variables del tema oscuro son propiedades personalizadas normales, asi
que componlas libremente:

```scss
@use "katanakit-css/src/scss/variables" as v;

@include v.generate-css-vars();
@include v.theme("dark");

body {
  background-color: var(--neutral-100);
  color: var(--neutral-500);
}

.brand {
  color: var(--purple-400);
}
```

Observa que las **clases de utilidad** de color (`v.text-utilities()` etc.)
compilan a valores literales, no a referencias `var()`. Si necesitas clases
conscientes del tema, usa las propiedades personalizadas en tus propias
reglas, como se muestra arriba.

## Sobreescribir la paleta oscura

`theme()` acepta un mapa `$overrides` que se fusiona sobre el resultado
invertido:

```scss
@include v.theme(
  "dark",
  (
    "neutral": (
      100: hsl(0, 0%, 8%),
      500: hsl(0, 0%, 88%)
    )
  )
);
```

## Combinar con la preferencia del sistema

Combina el tema basado en atributo con la consulta de caracteristica
`m.dark-mode` para sincronizar `color-scheme` (barras de desplazamiento,
controles de formulario) con la preferencia del sistema:

```scss
@use "katanakit-css/src/scss/variables" as v;
@use "katanakit-css/src/scss/mixins" as m;

@include v.generate-css-vars();
@include v.theme("dark");

@include m.dark-mode {
  :root {
    color-scheme: dark;
  }
}
```

Para seguir la preferencia del sistema automaticamente, establece
`data-theme` desde JavaScript:

```js
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const apply = () =>
  document.documentElement.toggleAttribute("data-theme", mq.matches);

apply();
mq.addEventListener("change", apply);
```

## Paginas relacionadas

- [Colores](/es/core/colors/) — paletas y `generate-css-vars()`.
- [Breakpoints](/es/core/breakpoints/) — la consulta de caracteristica `m.dark-mode`.
- [Color de texto](/es/utilities/text-color/) y
  [Color de fondo](/es/utilities/background-color/) — las clases de utilidad
  de color.
