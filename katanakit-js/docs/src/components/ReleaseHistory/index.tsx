import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {releases, type Release, type ReleaseKind} from '@site/src/data/releases';
import styles from './styles.module.css';

const GITHUB_RELEASES =
  'https://github.com/senseikatana/katanakit-js/releases/tag';

const badgeLabel: Record<ReleaseKind, string> = {
  latest: 'Latest release',
  major: 'Major release',
  minor: 'Minor release',
};

function CheckIcon(): ReactNode {
  return (
    <svg className={styles.check} viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.78 4.22a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l2.47 2.47 5.97-5.97a.75.75 0 0 1 1.06 0Z"
      />
    </svg>
  );
}

function ReleaseCard({release}: {release: Release}): ReactNode {
  return (
    <article
      className={clsx(
        styles.card,
        release.kind === 'latest' && styles.cardLatest,
      )}>
      <header className={styles.cardHeader}>
        <span className={styles.badge}>{badgeLabel[release.kind]}</span>
        <Heading as="h3" className={styles.version}>
          KatanaKit {release.version}
        </Heading>
        <span className={styles.date}>{release.date}</span>
      </header>
      <p className={styles.summary}>{release.summary}</p>
      <ul className={styles.highlights}>
        {release.highlights.map((item) => (
          <li key={item} className={styles.highlight}>
            <CheckIcon />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link className={styles.link} href={`${GITHUB_RELEASES}/${release.tag}`}>
        View release notes →
      </Link>
    </article>
  );
}

export default function ReleaseHistory(): ReactNode {
  return (
    <section className={styles.releases}>
      <div className="container">
        <div className={styles.intro}>
          <span className={styles.pill}>Releases</span>
          <Heading as="h2" className={styles.title}>
            What each release brought
          </Heading>
          <p className={styles.subtitle}>
            The short version of how KatanaKit got here.
          </p>
        </div>
        <div className={styles.list}>
          {releases.map((release) => (
            <ReleaseCard key={release.tag} release={release} />
          ))}
        </div>
      </div>
    </section>
  );
}
