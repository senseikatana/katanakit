import React, {type ReactNode, useEffect, useState} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {useColorMode} from '@docusaurus/theme-common';
import type {Props} from '@theme/ColorModeToggle';

import styles from './styles.module.css';

function useAriaLabel(isDark: boolean): string {
  const mode = translate(
    isDark
      ? {
          message: 'dark mode',
          id: 'theme.colorToggle.ariaLabel.mode.dark',
          description: 'The name for the dark color mode',
        }
      : {
          message: 'light mode',
          id: 'theme.colorToggle.ariaLabel.mode.light',
          description: 'The name for the light color mode',
        },
  );

  return translate(
    {
      message: 'Switch between dark and light mode (currently {mode})',
      id: 'theme.colorToggle.ariaLabel',
      description: 'The ARIA label for the color mode toggle',
    },
    {mode},
  );
}

function ColorModeToggle({className, buttonClassName}: Props): ReactNode {
  const {colorMode, setColorMode} = useColorMode();
  const [mounted, setMounted] = useState(false);

  // Sync the checkbox after hydration to avoid a server/client mismatch.
  // Visuals are driven by html[data-theme], so nothing flashes meanwhile.
  useEffect(() => setMounted(true), []);

  const isDark = colorMode === 'dark';
  const ariaLabel = useAriaLabel(isDark);

  return (
    <label className={clsx(styles.switch, className)} title={ariaLabel}>
      <input
        className={styles.input}
        type="checkbox"
        role="switch"
        aria-label={ariaLabel}
        checked={mounted ? isDark : false}
        disabled={!mounted}
        onChange={(event) =>
          setColorMode(event.target.checked ? 'dark' : 'light')
        }
      />
      <span className={clsx(styles.track, buttonClassName)} aria-hidden="true" />
      <span className={styles.thumb} aria-hidden="true" />
    </label>
  );
}

export default React.memo(ColorModeToggle);
