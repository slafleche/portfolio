import Link from 'next/link';
import * as s from '@/styles/menu.css';

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
    <div className={s.headerBar}>
      <nav className={s.nav}>
        {otherLocales.map((l) => (
          <Link key={l} href={`/${l}`} className={s.link}>
            {LOCALE_LABELS[l]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
