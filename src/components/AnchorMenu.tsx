'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as s from '@/styles/components/anchorMenu.css.ts';
import clsx from 'clsx';
import { useSafeId } from '@/lib/dom';
import { visuallyHidden } from '@/styles/components/forms.css.ts';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';

export type AnchorLink = {
  title: string;
  href: string;
};

type MenuProps = {
  anchorLinks?: ReadonlyArray<AnchorLink>;
  anchorNavLabel: string;
  className?: string;
  activeHref?: string;
  onActivate?: (anchorId: string) => void;
};

export default function AnchorMenu({
  className,
  anchorNavLabel,
  anchorLinks = [],
  activeHref,
  onActivate,
}: MenuProps) {
  const idPrefix = useSafeId('anchorMenu-');
  const rootId = `${idPrefix}-root`;
  const anchorListId = `${idPrefix}-anchorList`;
  const [hideAnchors, setHideAnchors] = useState(false);
  const { layoutTick } = useWindowSize();
  const scheduleUpdateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rootEl = document.getElementById(rootId);
    const listEl = document.getElementById(anchorListId);
    if (!rootEl || !listEl) return;

    let frameId: number | null = null;

    const updateVisibility = () => {
      const styles = window.getComputedStyle(rootEl);
      const paddingTop = Number.parseFloat(styles.paddingTop || '0');
      const paddingBottom = Number.parseFloat(
        styles.paddingBottom || '0',
      );
      const reservedSpace = paddingTop + paddingBottom;
      const anchorsHeight = listEl.getBoundingClientRect().height;
      const availableHeight = window.innerHeight - reservedSpace;

      setHideAnchors(availableHeight < anchorsHeight);
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateVisibility();
      });
    };

    updateVisibility();
    scheduleUpdateRef.current = scheduleUpdate;

    let rootObserver: ResizeObserver | null = null;
    let listObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      rootObserver = new ResizeObserver(scheduleUpdate);
      listObserver = new ResizeObserver(scheduleUpdate);
      rootObserver.observe(rootEl);
      listObserver.observe(listEl);
    }

    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      rootObserver?.disconnect();
      listObserver?.disconnect();
      scheduleUpdateRef.current = null;
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [
    anchorListId,
    rootId,
  ]);

  useEffect(() => {
    scheduleUpdateRef.current?.();
  }, [
    layoutTick,
  ]);

  if (anchorLinks.length === 0 || hideAnchors) {
    return null;
  }
  return (
    <div id={rootId} className={clsx(s.root, className)}>
      <h2 id={idPrefix} className={visuallyHidden}>
        {anchorNavLabel}
      </h2>
      <ul
        id={anchorListId}
        className={s.list}
        aria-labelledby={idPrefix}
        data-ui="list-unordered"
      >
        {anchorLinks.map((anchor) => {
          const isActive = anchor.href === activeHref;
          const anchorId =
            anchor.href && anchor.href.startsWith('#')
              ? anchor.href.slice(1)
              : anchor.href;
          return (
            <li
              data-ui="list-item"
              key={anchor.href}
              className={s.item}
              data-active={isActive ? 'true' : 'false'}
            >
              <Link
                data-ui="link"
                data-active={isActive ? 'true' : 'false'}
                className={s.link}
                href={anchor.href}
                aria-label={anchor.title}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => {
                  if (anchorId) {
                    onActivate?.(anchorId);
                  }
                }}
              >
                <span className={s.handle}>
                  <span className={s.dotWrapper}>
                    <span className={s.dot} />
                  </span>

                  <span className={s.labelWrapper}>
                    <span className={s.label}>{anchor.title}</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
