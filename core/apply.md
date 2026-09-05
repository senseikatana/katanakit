# @apply

Compose utilities inside your SCSS with the apply registry.

# @apply

KatanaKIT CSS ships a small `@apply`-style system so you can compose
utilities inside your components **without** re-implementing them:

```scss
@use "katanakit-css/src/scss/mixins" as m;

.card {
  @include m.apply(flex, flex-col, p-4, rounded-lg, shadow-md, bg-white);
}
```

Two mixins power the system:

| Mixin | Behaviour |
| --- | --- |
| `m.register-utility($name, $styles)` | Registers a named utility. `$styles` is a map of CSS declarations. |
| `m.apply($utilities...)` | Emits every registered declaration for each name, in order. Throws an `@error` naming the offending utility when one is not registered. |

## Basic usage

```scss
@use "katanakit-css/src/scss/mixins" as m;

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

Compiles to plain declarations — no runtime, no duplicate class output:

```css
.card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  background-color: hsl(0, 0%, 98%);
}
```

## Registering your own utilities

The registry is open — register project-specific utilities before using them:

```scss
@use "katanakit-css/src/scss/mixins" as m;

@include m.register-utility("fade-in", (animation: fade-in 300ms ease));

.hero {
  @include m.apply(fade-in, p-8, text-2xl);
}
```

## Automatically registered utilities

Loading the `mixins` module registers a large set of names — most of them
derived from the **same maps** that drive the class generators, so names
match the class names exactly (`p-4`, `m-2`, `gap-4`, `rounded-lg`,
`shadow-md`, `z-10`, `duration-200`, `ease-out`, `opacity-50`, …).

| Category | Registered names |
| --- | --- |
| Display | `block`, `inline-block`, `inline`, `flex`, `inline-flex`, `grid`, `hidden`, `table`, `table-row`, `table-cell`, `contents`, `inline-grid` |
| Flexbox | `flex-row`, `flex-row-reverse`, `flex-col`, `flex-col-reverse`, `flex-wrap`, `flex-nowrap`, `items-start`, `items-center`, `items-end`, `items-stretch`, `justify-start`, `justify-center`, `justify-end`, `justify-between`, `justify-around`, `justify-evenly` |
| Spacing | for every key of `$spacing-map`: `p-*` `px-*` `py-*` `pt-*` `pr-*` `pb-*` `pl-*`, `m-*` `mx-*` `my-*` `mt-*` `mr-*` `mb-*` `ml-*`, `gap-*` `gap-x-*` `gap-y-*` |
| Typography | `text-xs` … `text-4xl`, `text-left`, `text-center`, `text-right`, `font-thin` … `font-black` |
| Sizing | `w-full`, `w-screen`, `w-auto`, `h-full`, `h-screen`, `h-auto` |
| Borders | `border`, `border-0`, `border-2`, `border-4`, `border-8`, `rounded-none` … `rounded-full`, `rounded` |
| Effects | `shadow-none` … `shadow-2xl` + `shadow` + `shadow-inner`, `opacity-0` … `opacity-100`, `z-auto` … `z-tooltip`, `duration-75` … `duration-1000`, `ease-linear` … `ease-in-out` |
| Position | `static`, `fixed`, `absolute`, `relative`, `sticky` |
| Overflow | `overflow-auto`, `overflow-hidden`, `overflow-scroll`, `overflow-visible` |
| Colors | `text-white`, `text-black`, `bg-white`, `bg-black`, `bg-transparent` |
| Whitespace | `whitespace-nowrap`, `whitespace-pre`, `whitespace-normal`, `wrap-break-word` |

## Registry-only utilities

**Important.** Registering a utility for `apply` does **not** create a CSS
class. A small set of names exists only inside the registry — you can use
them with `apply()`, but they will never appear as classes in the compiled
CSS:

- `flex-1`, `flex-auto`, `flex-none`
- `grid-cols-1`, `grid-cols-2`, `grid-cols-3`, `grid-cols-4`, `grid-cols-6`,
  `grid-cols-12`
- `col-span-full`
- `transition`, `transition-colors`, `transition-opacity`,
  `transition-transform`

```scss
@use "katanakit-css/src/scss/mixins" as m;

.hero-grid {
  @include m.apply(grid, grid-cols-12, gap-4);

  .main { @include m.apply(col-span-full); }
  .aside { @include m.apply(flex-1); }
}
```

```html
<!-- Wrong: .flex-1 is NOT emitted as a class by the framework -->
<div class="flex-1">…</div>
```

## Errors

Applying an unregistered name fails loudly at compile time:

```scss
@include m.apply(flex, flex-col, text-5xl);
// Error: apply(): utilidad 'text-5xl' no registrada.
//        Usa register-utility() primero.
```

## Related pages

- [Getting Started](/getting-started/) — composing sheets with modules.
- [Examples](/reference/examples/) — the button/card example in full.
