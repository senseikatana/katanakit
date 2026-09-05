import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    'getting-started',
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
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
      collapsed: false,
      items: [
        { type: 'doc', id: 'utilities/padding' },
        { type: 'doc', id: 'utilities/margin' },
        { type: 'doc', id: 'utilities/gap' },
        { type: 'doc', id: 'utilities/container', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/display', customProps: { badge: 'UPDATED' } },
        { type: 'doc', id: 'utilities/typography', customProps: { badge: 'UPDATED' } },
        { type: 'doc', id: 'utilities/text-transform', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/text-decoration', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/line-height', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/font-family', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/list-style', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/colors-extended', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/effects', customProps: { badge: 'UPDATED' } },
        { type: 'doc', id: 'utilities/border-style', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/aspect-ratio', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/object', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/cursor', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/visibility', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/float', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/tables', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/grid-classes', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/flex-classes', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/position-values', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/overflow-direction', customProps: { badge: 'NEW' } },
        { type: 'doc', id: 'utilities/interactivity', customProps: { badge: 'NEW' } },
      ],
    },
    {
      type: 'category',
      label: 'Mixins',
      collapsed: false,
      items: [
        'mixins/grid',
        'mixins/flex',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: [
        'reference/functions',
        'reference/api-reference',
        'reference/architecture',
      ],
    },
  ],
};

export default sidebars;
