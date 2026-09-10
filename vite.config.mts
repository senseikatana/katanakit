import { defineConfig } from 'vite';
import purgecss from 'vite-plugin-purgecss';

const PORT = Number(process.env.PORT) || 4322;

export default defineConfig({
  // Demo lives in demo/ — run with: yarn demo
  root: 'demo',
  publicDir: '../public',
  server: {
    port: PORT,
    open: false,
    host: 'localhost',
    cors: true,
    hmr: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  plugins: [
    purgecss({
      content: ['./index.html', './**/*.{js,ts}'],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [
          /^sm:/, /^md:/, /^lg:/, /^xl:/, /^2xl:/, /^3xl:/,
          /^hover:/, /^focus:/, /^active:/, /^disabled:/,
          /^group-hover:/, /^peer-checked:/,
        ],
        deep: [/^data-/],
        greedy: [/^is-/, /^has-/],
      },
      keyframes: true,
      fontFace: true,
      variables: false,
      rejected: false,
    }),
  ].filter(Boolean),
});
