'use client';

import Link from 'next/link';
import Logo from './Logo';
import { SkipNavLink } from './SkipNavLink';
import type { Locale } from '@/data/locales';

type LocaleLink = {
  locale: Locale;
  label: string;
};

type MenuProps = {
  root: string;
  skipNavLabel: string;
  localeChangeLabel: string;
  localeLinks: ReadonlyArray<LocaleLink>;
};

export default function Menu({
  root,
  skipNavLabel,
  localeChangeLabel,
  localeLinks,
}: MenuProps) {
  const alternateLocale = localeLinks[0];

  return (
    <header>
      <SkipNavLink contentId="body">{skipNavLabel}</SkipNavLink>
      <nav aria-label="Primary navigation">
        <ul>
          <li>
            <Link href={root} prefetch={false} aria-label="Home">
              <Logo idBase="nav-logo" />
            </Link>
          </li>
          {alternateLocale ? (
            <li>
              <Link
                href={`/${alternateLocale.locale}`}
                hrefLang={alternateLocale.locale}
                aria-label={localeChangeLabel}
              >
                {alternateLocale.label}
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}
