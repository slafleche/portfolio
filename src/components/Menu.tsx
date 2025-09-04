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
  const locales = AVAILABLE_LOCALES as readonly Locale[];
  const current = (locales as readonly string[]).includes(first)
    ? (first as Locale)
    : locales[0];

  return (
    <nav className={s.headerBar}>
      <div className={s.nav}>
        {locales
          .filter((l) => l !== current) // only other locales (your rule)
          .map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              className={s.link}
              hrefLang={l}
              data-active={false}
            >
              {LOCALE_LABELS[l]}
            </Link>
          ))}
        {/* show current (non-link) if you want to indicate it */}
        <span className={s.link} data-active aria-current="page">
          {LOCALE_LABELS[current]}
        </span>
      </div>
    </nav>
  );
}
