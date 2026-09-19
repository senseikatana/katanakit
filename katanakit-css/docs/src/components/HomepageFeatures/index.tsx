import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Design Tokens',
    description: (
      <>
        Fonts, spacing, radius, shadows, z-layers, durations and easings — all
        from <code>!default</code> maps you can override before importing.
      </>
    ),
  },
  {
    title: 'Utility Classes',
    description: (
      <>
        Spacing, sizing, flex, effects, typography and layout generated from
        maps. Tailwind-like API with zero runtime overhead.
      </>
    ),
  },
  {
    title: 'Layout Mixins',
    description: (
      <>
        Full CSS Grid toolkit, flexbox helpers and responsive breakpoints with
        mobile-first approach. Plus a tiny <code>@apply</code> registry.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md padding-vert--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
