---
title: Bun Adapter
sidebar_position: 5
description: Serve dummyjson.com-backed HTTP routes with Bun.serve, a native alternative to Express.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

KatanaKit ships a Bun-native server adapter (`katanakit-js/adapters/bun`) built on `Bun.serve` with the modern `routes` API (Bun v1.2.3+). It's a drop-in alternative to the Express adapter for Bun projects — no Express, no middleware chain, just a typed route table.

## Install

```bash
bun add katanakit-js
```

Add `bun-types` to your `tsconfig.json` `types` for the `Bun` global:

```json
{
  "compilerOptions": {
    "types": ["bun-types"]
  }
}
```

## Quick start

`bun run bun:dev` boots the dummyjson demo server:

```bash
bun run bun:dev
# Server running at http://localhost:3000
```

```ts
import { useInitDummyJson, useBunStart } from "katanakit-js/adapters/bun";

useInitDummyJson();

const server = useBunStart(3000);
console.log(`Server running at ${server.url}`);
```

## The route table

`useBuildDummyJsonRoutes()` returns a typed `Bun.serve` route table. Handlers are pure and return `Response` — they reuse the core `useFetch` with the Safe Result pattern.

```ts
import { useBuildDummyJsonRoutes } from "katanakit-js/adapters/bun";

Bun.serve({
  routes: useBuildDummyJsonRoutes(),
  fetch: () => new Response("Not Found", { status: 404 }),
});
```

| Route | Handler |
|---|---|
| `GET /api/status` | static JSON |
| `GET /api/products` | `useDummyJsonProducts` |
| `GET /api/products/:id` | `useDummyJsonProductById` |
| `GET /api/products/search?q=` | `useDummyJsonProductSearch` |
| `GET /api/products/categories` | `useDummyJsonProductCategories` |
| `GET /api/products/category/:category` | `useDummyJsonProductsByCategory` |
| `GET /api/users`, `GET /api/users/:id` | users |
| `GET /api/posts`, `GET /api/posts/:id` | posts |
| `GET /api/quotes`, `GET /api/quotes/random` | quotes |
| `GET /api/seed` | offline seed data |
| `GET /api/*` | 404 catch-all |

## Direct handlers

You can use the handlers anywhere a `Response` is expected — no Bun router required:

```ts
import { useInitDummyJson, useDummyJsonProducts } from "katanakit-js/adapters/bun";

useInitDummyJson();
const response = await useDummyJsonProducts(); // Response with the product list
```

## Seed data

```ts
import { useGetDummyJsonSeed } from "katanakit-js/adapters/bun";

const seed = useGetDummyJsonSeed();
seed.products; // [{ id, title, description, category, price, rating, stock, brand }]
seed.users;    // [{ id, firstName, lastName, username, email, age, role }]
```

## Server facade

`useBunCreate` is a singleton — subsequent calls return the same server:

```ts
import { useBunCreate, useBunGetServer, useBunStop } from "katanakit-js/adapters/bun";

useBunCreate({ port: 3000, hostname: "localhost" });
useBunGetServer()?.url; // URL
await useBunStop();
```
