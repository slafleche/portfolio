'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AVAILABLE_LOCALES,
  LOCALE_LABELS,
  type Locale,
} from '@/data/locales.gen';
import * as s from '@/styles/menu.css.ts';

export default function Menu() {
  const pathname = usePathname() || '/';
  const first = pathname.split('/').filter(Boolean)[0];

  const current: Locale = (AVAILABLE_LOCALES as readonly string[]).includes(
    first as string,
  )
    ? (first as Locale)
    : (AVAILABLE_LOCALES[0] as Locale); // fallback to first available (likely "en")

  // show ONLY the other locales
  const others = (AVAILABLE_LOCALES as readonly Locale[]).filter(
    (l) => l !== current,
  );

  return (
    <nav className={s.headerBar}>
      <div className={s.nav}>
        {others.map((l) => (
          <Link key={l} href={`/${l}`} className={s.link} hrefLang={l}>
            {LOCALE_LABELS[l]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
