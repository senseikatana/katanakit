import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

type FeatureItem = {
  title: string;
  description: React.ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Safe Results',
    description: (
      <>
        Every async operation returns <code>{'{ data, error, ok }'}</code>{' '}
        instead of throwing. No more uncaught exceptions in production.
      </>
    ),
  },
  {
    title: 'Zero Side Effects',
    description: (
      <>
        Importing any module is safe. No <code>fetch</code> calls, no{' '}
        <code>console.log</code>, no storage writes, no timers. Ever.
      </>
    ),
  },
  {
    title: 'Hexagonal Architecture',
    description: (
      <>
        Pure core, infrastructure adapters, framework adapters. Clean separation
        that scales with your project.
      </>
    ),
  },
  {
    title: 'Tree-shakeable',
    description: (
      <>
        Destructured re-exports from Singleton facades. Import only what you use.
        The rest gets eliminated at build time.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--6')}>
      <div className="text--center padding-horiz--md padding-vert--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): React.ReactNode {
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
