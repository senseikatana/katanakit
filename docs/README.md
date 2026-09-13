# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

**Note**: feel free to use the package manager of your choice.

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true npm run deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
```

If you are using GitHub Pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Theme switch

The navbar color mode switch is a swizzled `ColorModeToggle`
(`src/theme/ColorModeToggle/`). It replaces the default icon button with a
checkbox switch while keeping Docusaurus' color mode state:

- Visuals are driven by `html[data-theme]`, so the switch is correct before
  hydration.
- The checkbox reflects the effective theme and pins `light`/`dark` on change;
  the system preference still applies on the first visit.
- Colors: gray track in light mode, cyan track in dark mode.
- Keyboard focus renders a ring; `prefers-reduced-motion` disables transitions.

To restore the default component, delete `docs/src/theme/ColorModeToggle/` —
Docusaurus falls back to its own implementation.
