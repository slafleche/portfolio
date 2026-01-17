'use client';

import clsx from 'clsx';
import type { ComponentPropsWithoutRef, MouseEvent } from 'react';
import { useCallback } from 'react';

import * as skipNavStyles from '@/styles/components/skipNav.css';

type SkipNavLinkProps = ComponentPropsWithoutRef<'a'> & {
  contentId?: string;
};

export function SkipNavLink({
  contentId = 'main',
  className,
  onClick,
  children,
  ...rest
}: SkipNavLinkProps) {
  const normalizedContentId = contentId.startsWith('#')
    ? contentId.slice(1)
    : contentId;
  const href = `#${normalizedContentId}`;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(event);
        if (event.defaultPrevented) return;
      }

      if (typeof window === 'undefined') return;
      const targetId = href.slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      event.preventDefault();
      const scrollPaddingTop = window.getComputedStyle(
        document.documentElement,
      ).scrollPaddingTop;
      const paddingValue = Number.parseFloat(scrollPaddingTop);
      const padding = Number.isFinite(paddingValue)
        ? paddingValue
        : 0;
      const top = target.getBoundingClientRect().top + window.scrollY;
      const nextTop = Math.max(0, top - padding);
      const before = window.scrollY;
      window.scrollTo({
        top: nextTop,
        behavior: 'smooth',
      });
      if (window.scrollY === before) {
        window.scrollTo(0, nextTop);
      }
      if (typeof target.focus === 'function') {
        const previousTabIndex = target.getAttribute('tabindex');
        if (previousTabIndex == null) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener(
            'blur',
            () => {
              target.removeAttribute('tabindex');
            },
            { once: true },
          );
        }
        target.focus({ preventScroll: true });
      }
    },
    [
      href,
      onClick,
    ],
  );

  return (
    <a
      href={href}
      className={clsx(skipNavStyles.link, className)}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}
