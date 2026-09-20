# KatanaWP

Code-first WordPress configuration and custom fields — **without plugins**.

KatanaWP replaces the paid parts of ACF with a declarative configuration file
(JSON, YAML or PHP) and native WordPress primitives. Define theme supports,
menus, image sizes, assets, custom post types, taxonomies and custom fields in
one readable file. Metaboxes are generated automatically and everything is
exposed through the WordPress REST API for headless frontends (Astro, React,
Vue, …).

> **Status:** Phase 1 — configuration loader + theme support module. Post
> types, taxonomies, custom fields and REST serialization ship in later phases.

## Requirements

- PHP **8.1+**
- WordPress **6.0+**
- Composer (for installation)

## Installation

```bash
composer require katanakit/wp
```

## Quick start

Create a `katana.json` next to your theme's `style.css` and boot KatanaWP from
`functions.php`:

```php
<?php

use KatanaWP\KataWP;

KataWP::boot(get_stylesheet_directory() . '/katana.json');
```

`katana.json`:

```json
{
  // Theme supports (plain names, or "feature": { ...args }).
  "supports": ["title-tag", "post-thumbnails", "custom-logo"],

  // Navigation menus: location => description.
  "menus": {
    "primary": "Primary Menu",
    "footer": "Footer Menu"
  },

  // Image sizes: name => [width, height, crop].
  "image_sizes": {
    "hero": [1600, 900, true],
    "card": [600, 400, false]
  },

  // Assets to enqueue (optional).
  "assets": {
    "styles": [{ "handle": "main", "src": "assets/css/main.css" }],
    "scripts": [{ "handle": "main", "src": "assets/js/main.js", "in_footer": true }]
  }
}
```

JSON files also accept `//` and `/* */` comments (comments inside string
literals, such as URLs, are preserved).

## Configuration formats

KatanaWP auto-detects the format by extension:

| Extension | Notes |
|---|---|
| `.json` | Native, zero dependencies. Comments allowed. |
| `.yaml` / `.yml` | Requires `composer require symfony/yaml`. |
| `.php` | Must `return` an array. |

You can also pass an inline array:

```php
KataWP::boot([
    'supports' => ['title-tag', 'post-thumbnails'],
    'menus' => ['primary' => 'Primary Menu'],
]);
```

## API

- `KataWP::boot(string|array $source): Config` — loads config and registers everything.
- `KataWP::config(): Config` — access the booted configuration.
- `KatanaWP\Config\Loader::load(string $path): array` — load a config file directly.

## Development

```bash
composer install
composer test        # PHPUnit
composer lint        # PHP_CodeSniffer (WordPress Coding Standards)
composer lint:fix    # auto-fix
```

Spin up a local WordPress with the official `wp-env` Docker environment:

```bash
npx @wordpress/env start
```

## Roadmap

- [x] Phase 1 — configuration loader (JSON/YAML/PHP) + theme support (supports, menus, image sizes, assets).
- [ ] Phase 2 — custom post types and taxonomies.
- [ ] Phase 3 — custom fields (core types) + auto-generated metaboxes.
- [ ] Phase 4 — REST serializers + options pages.
- [ ] Phase 5 — `katanakit-wp-js` typed client.
- [ ] Phase 6 — Astro showcase themes.
- [ ] Later — repeater fields, React/Next and Vue/Nuxt showcases.

## License

MIT © senseikatana - Sergio Jurado
