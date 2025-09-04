import Link from 'next/link';
import * as styles from '@/styles/menu.css.ts';

import {
  AVAILABLE_LOCALES,
  LOCALE_LABELS,
  type Locale,
} from '@/data/locales.gen';

export default function Menu({ locale }: { locale: Locale }) {
  const otherLocales = (AVAILABLE_LOCALES as readonly string[]).filter(
    (l) => l !== locale,
  ) as Locale[];

  return (
    <div className={styles.headerBar}>
      <nav className={styles.nav}>
        {otherLocales.map((l) => (
          <Link key={l} href={`/${l}`} className={styles.link}>
            {LOCALE_LABELS[l]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
