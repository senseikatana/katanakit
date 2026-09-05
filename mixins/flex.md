# Flexbox

Flexbox layout mixins — containers, gaps and item sizing.

# Flexbox

Flexbox layout mixins in the `mixins` module.

```scss
@use "katanakit-css/src/scss/mixins" as m;
```

## Containers

| Mixin | Behaviour |
| --- | --- |
| `m.flex-container($direction: row, $wrap: nowrap, $gap: null, $align-items: stretch, $justify-content: flex-start, $align-content: normal, $place-items: null, $place-content: null)` | Display flex with direction/wrap. `place-items` wins over `align-items`; `place-content` wins over `justify-content`/`align-content`. |
| `m.flex-center($gap: null)` | Centering shorthand (`place-items`/`place-content: center`). |
| `m.flex-gap($value: 1rem, $var-name: --flex-gap)` | Sets a custom property and `gap: var(--flex-gap)`. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.toolbar { @include m.flex-container(row, nowrap, 0.5rem, center, space-between); }
.hero    { @include m.flex-center(2rem); }
.list    { @include m.flex-gap(1.5rem); }
```

## Item sizing

| Mixin | Behaviour |
| --- | --- |
| `m.flex-grow($grow: 1)` | `flex-grow`. |
| `m.flex-shrink($shrink: 1)` | `flex-shrink`. |
| `m.flex-basis($basis: auto)` | `flex-basis`. |
| `m.flex-item($grow: 1, $shrink: 1, $basis: auto)` | `flex: <grow> <shrink> <basis>`. |
| `m.flex-item-center` | `align-self: center`. |
| `m.flex-item-full` | `flex: 1 1 100%`. |

```scss
@use "katanakit-css/src/scss/mixins" as m;

.logo   { @include m.flex-item(0, 0, auto); } // never grows, never shrinks
.search { @include m.flex-item-full(); }       // fills the remaining space
.badge  { @include m.flex-item-center; }
```

## Example: a navigation bar

```scss
@use "katanakit-css/src/scss/mixins" as m;

.navbar {
  @include m.flex-container(row, nowrap, 1rem, center, space-between);

  .brand {
    @include m.flex-item(0, 0, auto);
  }

  .spacer {
    @include m.flex-item(1, 1, auto); // pushes the rest to the edges
  }

  .actions {
    @include m.flex-container(row, nowrap, 0.5rem, center, flex-end);
  }
}
```

See the [Flexbox utilities](/utilities/flex-direction/) for
the class-based equivalents (`.flex`, `.items-*`, `.justify-*`, `.gap-*`).
