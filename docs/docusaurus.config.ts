import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'KatanaKIT CSS',
  tagline: 'A lightweight, modular SCSS mini-framework',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://senseikatana.github.io',
  baseUrl: '/katanakit-css/',

  organizationName: 'senseikatana',
  projectName: 'katanakit-css',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeConfigs: {
      en: { label: 'English' },
      es: { label: 'Español' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/senseikatana/katanakit-css/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'KatanaKIT CSS',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/senseikatana/katanakit-css',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'API Reference', to: '/docs/reference/api-reference' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/senseikatana/katanakit-css' },
            { label: 'Issues', href: 'https://github.com/senseikatana/katanakit-css/issues' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Sergio Jurado (senseikatana). Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['scss', 'css', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
