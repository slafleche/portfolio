'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AVAILABLE_LOCALES,
  LOCALE_LABELS,
  type Locale,
} from '@/data/locales.gen';
import * as s from '@/styles/menu.css.ts';
import Logo from '@/assets/SVG/logo.svg';

export default function Menu() {
  const pathname = usePathname() || '/';
  const first = pathname.split('/').filter(Boolean)[0];
  const locales = AVAILABLE_LOCALES as readonly Locale[];
  const current = (locales as readonly string[]).includes(first)
    ? (first as Locale)
    : locales[0];

  return (
    <>
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

        <svg
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
          className={s.bridge}
        >
          <defs>
            {/* <!-- Mask to cut out the bottom oval --> */}
            <mask id="bridge-mask">
              <rect x="0" y="0" width="100" height="50" fill="white" />
              <ellipse cx="50" cy="50" rx="50" ry="25" fill="black" />
            </mask>

            {/* <!-- Shadow filter --> */}
            {/* <filter id="bridge-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="rgba(0,0,0,0.35)"/>
            </filter> */}
          </defs>

          {/* <!-- Rectangle with bottom oval cutout and shadow --> */}
          <rect
            x="0"
            y="0"
            width="100"
            height="50"
            fill="#4cafef"
            mask="url(#bridge-mask)"
            // filter="url(#bridge-shadow)"
          />
        </svg>
      </nav>
      <Logo className={s.logo} />
    </>
  );
}
