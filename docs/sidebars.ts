import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    'getting-started',
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'core/tokens',
        'core/colors',
        'core/breakpoints',
        'core/dark-mode',
        'core/apply',
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      items: [
        'utilities/padding',
        'utilities/margin',
        'utilities/gap',
        'utilities/display',
        'utilities/typography',
        'utilities/effects',
      ],
    },
    {
      type: 'category',
      label: 'Mixins',
      items: [
        'mixins/grid',
        'mixins/flex',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/functions',
        'reference/api-reference',
        'reference/architecture',
      ],
    },
  ],
};

export default sidebars;
