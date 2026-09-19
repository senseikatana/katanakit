---
title: Generic Watch
sidebar_position: 4
description: Framework-agnostic reactive watcher for Vue and Nuxt with deep:true by default.
---

`useKatanaWatch` (aliased as `useWatch`) is a generic watcher for any Vue state. Props come straight from the native `watch` — same source, callback and options types (`WatchSource`, `WatchCallback`, `WatchOptions` in `src/types/`) — with `deep: true` by default. The callback accepts any internal function: sync or async, with `(newValue, oldValue)` args or with no args. The watcher stops automatically on unmount.

```ts
import { useKatanaWatch } from "katanakit-js/adapters/vue";

const stop = useKatanaWatch(product, (next, prev) => {
  console.log(prev, "->", next);
});
```

## Sources

```ts
import { reactive, ref } from "vue";
import { useKatanaWatch, useWatch } from "katanakit-js/adapters/vue";

const product = ref({ name: "", price: 0 });
const state = reactive({ count: 0 });

// Ref (deep by default, nested mutations trigger).
useKatanaWatch(product, (next) => console.log(next));

// Getter function.
useKatanaWatch(() => product.value.price, (price) => console.log(price));

// Reactive object.
useKatanaWatch(state, (next) => console.log(next.count));

// Array of sources (native behaviour).
useKatanaWatch([product, state], ([nextProduct, nextState]) => console.log(nextProduct, nextState));

// Any internal function works — even with no args.
useKatanaWatch(product, () => checkValidations());
useKatanaWatch(product, async (next) => save(next));

// Short alias — same signature and behaviour.
useWatch(product, (next) => console.log(next));
```

## Options

Options mirror Vue's `watch`. Only `deep` changes its default:

| Option | Default | Notes |
|--------|---------|-------|
| `deep` | `true` | Set `false` for shallow watching |
| `immediate` | `false` | Run the callback immediately |
| `flush` | `"pre"` | `"pre"`, `"post"` or `"sync"` |
| `once` | `false` | Stop after the first trigger |

```ts
const stop = useKatanaWatch(count, onChange, { immediate: true });
stop(); // manual teardown (automatic on unmount inside setup)
```

## Nuxt

The same composable is re-exported from the Nuxt adapter (Nuxt shares Vue's reactivity):

```ts
import { useKatanaWatch } from "katanakit-js/adapters/nuxt";
```

## Validation example (schema-agnostic)

`useKatanaWatch` does not depend on Zod, Valibot, Yup or any validator. Pass any schema with `safeParse` (Zod, Valibot), Standard Schema (`~standard.validate`) or a custom function:

```ts
import { ref } from "vue";
import { useKatanaWatch } from "katanakit-js/adapters/vue";

const newProduct = ref({ name: "", price: 0 });
const fieldErrors = ref<Record<string, string>>({});

const checkValidations = (): boolean => {
  fieldErrors.value = {};
  const result = productSchema.safeParse(newProduct.value);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string") fieldErrors.value[field] = issue.message;
    }
    return false;
  }
  return true;
};

// Revalidate on every nested change.
useKatanaWatch(newProduct, () => checkValidations(), { deep: true });
```
