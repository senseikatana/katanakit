module.exports = {
  plugins: {
    autoprefixer: {},
    '@fullhuman/postcss-purgecss': {
      content: [
        './index.html',
        './demo/**/*.{js,ts,html}',
        './docs/**/*.{md,mdx}',
        './src/scss/**/*.scss',
      ],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        // Keep responsive prefixes so they're never purged.
        standard: [
          /^sm:/, /^md:/, /^lg:/, /^xl:/, /^2xl:/, /^3xl:/,
          /^hover:/, /^focus:/, /^active:/, /^disabled:/,
        ],
        deep: [/^data-/],
        greedy: [/^is-/, /^has-/],
      },
      keyframes: true,
      fontFace: true,
      // Keep custom properties (--*) even if not referenced by class names.
      variables: true,
      rejected: false,
    },
  },
};
