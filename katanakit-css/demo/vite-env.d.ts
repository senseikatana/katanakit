/// <reference types="vite/client" />

// Vite compila SCSS a CSS en el grafo de módulos: los imports de .scss
// son válidos y no tienen tipos propios.
declare module '*.scss';
