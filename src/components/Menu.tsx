'use client';

import Link from 'next/link';
import Logo from './Logo';
import { SkipNavLink } from './SkipNavLink';
import type { Locale } from '@/data/locales';
import AnchorMenu from './AnchorMenu';
import * as s from '@/styles/components/menu.css.ts';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useActiveAnchors, type AnchorTarget } from '@/lib/useActiveAnchors';

type LocaleLink = {
  locale: Locale;
  label: string;
};

type AnchorLink = {
  title: string;
  href: string;
};

type MenuProps = {
  root: string;
  homeLabel: string;
  skipNavLabel: string;
  navLabel: string;
  localeChangeLabel: string;
  localeLinks: ReadonlyArray<LocaleLink>;
  anchorLinks?: ReadonlyArray<AnchorLink>;
  anchorNavLabel: string;
};

export default function Menu({
  root,
  homeLabel,
  skipNavLabel,
  navLabel,
  localeChangeLabel,
  localeLinks,
  anchorLinks = [],
  anchorNavLabel,
}: MenuProps) {
  const alternateLocale = localeLinks[0];
  const anchorTargets = useMemo(
    () =>
      anchorLinks.reduce<AnchorTarget[]>((acc, link) => {
        const id = link.href.startsWith('#')
          ? link.href.slice(1)
          : link.href;
        if (!id) return acc;
        acc.push({
          id,
          href: link.href,
        });
        return acc;
      }, []),
    [anchorLinks],
  );

  const { activeHref, setManualActive } = useActiveAnchors(anchorTargets, {
    hashSync: { enabled: true },
  });

  return (
    <header className={s.root}>
      <SkipNavLink contentId="body">{skipNavLabel}</SkipNavLink>
      <nav aria-label={navLabel}>
        <ul className={s.items} data-ui="list-unordered">
          <li
            className={clsx(s.item, s.logoItem)}
            data-ui="list-item"
          >
            <Link
              href={root}
              prefetch={false}
              aria-label={homeLabel}
              className={s.homeLink}
              data-ui="link"
            >
              <Logo idBase="nav-logo" />
            </Link>
          </li>
          {alternateLocale ? (
            <li
              className={clsx(s.item, s.localeItem)}
              data-ui="list-item"
            >
              <Link
                href={`/${alternateLocale.locale}`}
                hrefLang={alternateLocale.locale}
                aria-label={localeChangeLabel}
                className={s.localeLink}
                data-ui="link"
              >
                {alternateLocale.label}
              </Link>
            </li>
          ) : null}
        </ul>
        <AnchorMenu
          anchorNavLabel={anchorNavLabel}
          anchorLinks={anchorLinks}
          activeHref={activeHref ?? undefined}
          onActivate={setManualActive}
        />
      </nav>
    </header>
  );
}
