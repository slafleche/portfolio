'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AVAILABLE_LOCALES, type Locale } from '@/data/locales';
import { useVisualViewportFrame } from '@/lib/responsive/useVisualViewportFrame';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import {
  canonicalToLocalizedSlugs,
  localizedToCanonicalSlugs,
} from '@/lib/routes/localeSlugs';
import {
  type AnchorTarget,
  useActiveAnchors,
} from '@/lib/useActiveAnchors';
import * as s from '@/styles/components/menu.css.ts';

import {
  glassLinkShine,
  glassyButtonHover,
} from '../styles/components/glassyButtons.css';
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
  locale: Locale;
  homeLabel: string;
  skipNavLabel: string;
  navLabel: string;
  localeChangeLabel: string;
  localeLinks: ReadonlyArray<LocaleLink>;
  anchorLinks?: ReadonlyArray<AnchorLink>;
  anchorNavLabel: string;
  ctaLabel: string;
  ctaWatchId?: string;
  forceCtaVisible?: boolean;
};

export default function Menu({
  root,
  locale,
  homeLabel,
  skipNavLabel,
  navLabel,
  localeChangeLabel,
  localeLinks,
  anchorLinks = [],
  anchorNavLabel,
  ctaLabel,
  ctaWatchId,
  forceCtaVisible: forceCtaVisibleProp = false,
}: MenuProps) {
  const pathname = usePathname();
  const { layoutTick } = useWindowSize();
  const { frame, frameStyle } = useVisualViewportFrame();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [
    portalTarget,
    setPortalTarget,
  ] = useState<HTMLElement | null>(null);
  const [
    ctaVisibleFromKeyboard,
    setCtaVisibleFromKeyboard,
  ] = useState(false);
  const alternateLocale = localeLinks[0];
  const localeHref =
    alternateLocale && pathname
      ? buildAlternateLocaleHref(
          pathname,
          locale,
          alternateLocale.locale,
        )
      : alternateLocale
        ? `/${alternateLocale.locale}`
        : undefined;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      setCtaVisibleFromKeyboard(true);
    };

    const handlePointer = () => {
      setCtaVisibleFromKeyboard(false);
    };

    window.addEventListener('keydown', handleKeyDown, {
      capture: true,
    });
    window.addEventListener('mousedown', handlePointer, {
      capture: true,
    });
    window.addEventListener('touchstart', handlePointer, {
      capture: true,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, {
        capture: true,
      });
      window.removeEventListener('mousedown', handlePointer, {
        capture: true,
      });
      window.removeEventListener('touchstart', handlePointer, {
        capture: true,
      });
    };
  }, []);

  const handleHomeClick = () => {
    if (typeof window === 'undefined') return;
    if (pathname !== root && pathname !== `${root}/`) return;
    setManualActive(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const viewportStyle =
    frame.width > 0 && frame.height > 0 ? frameStyle : undefined;

  return (
    <header className={s.root}>
      <SkipNavLink>{skipNavLabel}</SkipNavLink>
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
                className={clsx(
                  s.homeLink,
                  surface,
                  glassyButtonHover,
                )}
                data-ui="link"
                onClick={handleHomeClick}
              >
                <div className={glassLinkShine} aria-hidden="true" />
                <Logo idBase="nav-logo" />
              </Link>
            </li>
            {alternateLocale ? (
              <li
                className={clsx(s.item, s.localeItem)}
                data-ui="list-item"
              >
                <Link
                  href={localeHref ?? `/${alternateLocale.locale}`}
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
            forceVisible={
              forceCtaVisibleProp || ctaVisibleFromKeyboard
            }
          />
        ) : null}
      </div>
    </header>
  );
}

const buildAlternateLocaleHref = (
  pathname: string,
  currentLocale: Locale,
  targetLocale: Locale,
) => {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  const hasLocale =
    first && AVAILABLE_LOCALES.includes(first as Locale);
  const rest = hasLocale ? segments.slice(1) : segments;
  const canonicalSegments = rest.map(
    (segment) =>
      localizedToCanonicalSlugs[currentLocale]?.[segment] ?? segment,
  );
  const localizedSegments = canonicalSegments.map(
    (segment) =>
      canonicalToLocalizedSlugs[targetLocale]?.[segment] ?? segment,
  );
  return `/${targetLocale}${
    localizedSegments.length ? `/${localizedSegments.join('/')}` : ''
  }`;
};
