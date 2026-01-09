'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Locale } from '@/data/locales';
import { useVisualViewportFrame } from '@/lib/responsive/useVisualViewportFrame';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import {
  type AnchorTarget,
  useActiveAnchors,
} from '@/lib/useActiveAnchors';
import * as s from '@/styles/components/menu.css.ts';

import { surface } from '../styles/glassy.css';
import AnchorMenu from './AnchorMenu';
import ContactButton from './ContactButton';
import Logo from './Logo';
import { SkipNavLink } from './SkipNavLink';

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
  ctaLabel?: string;
  ctaWatchId?: string;
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
  ctaLabel,
  ctaWatchId,
}: MenuProps) {
  const { layoutTick } = useWindowSize();
  const { frame, frameStyle } = useVisualViewportFrame();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [
    portalTarget,
    setPortalTarget,
  ] = useState<HTMLElement | null>(null);
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
    [
      anchorLinks,
    ],
  );

  const { activeHref, setManualActive } = useActiveAnchors(
    anchorTargets,
    {
      hashSync: { enabled: true },
      layoutTick,
    },
  );

  useEffect(() => {
    setPortalTarget(frameRef.current);
  }, []);

  const viewportStyle =
    frame.width > 0 && frame.height > 0 ? frameStyle : undefined;

  return (
    <header className={s.root}>
      <SkipNavLink contentId="body">{skipNavLabel}</SkipNavLink>
      <div
        ref={frameRef}
        className={s.viewportFrame}
        style={viewportStyle}
      >
        <nav aria-label={navLabel} className={s.nav}>
          <ul className={s.items} data-ui="list-unordered">
            <li
              className={clsx(s.item, s.logoItem)}
              data-ui="list-item"
            >
              <Link
                href={root}
                prefetch={false}
                aria-label={homeLabel}
                className={clsx(s.homeLink, surface)}
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
        {ctaLabel && ctaWatchId ? (
          <ContactButton
            watchId={ctaWatchId}
            label={ctaLabel}
            portalTarget={portalTarget}
          />
        ) : null}
      </div>
    </header>
  );
}
