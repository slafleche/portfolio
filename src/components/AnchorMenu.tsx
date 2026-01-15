'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useSafeId } from '@/lib/dom';
import { shouldHideAnchors } from '@/lib/responsive/anchorMenuMeasurements';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import * as s from '@/styles/components/anchorMenu.css.ts';

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
  const [
    hideAnchors,
    setHideAnchors,
  ] = useState(false);
  const { layoutTick } = useWindowSize();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frameId: number | null = null;

    const updateVisibility = () => {
      const rootEl = rootRef.current;
      const listEl = listRef.current;
      if (!rootEl || !listEl) return;
      setHideAnchors(shouldHideAnchors(rootEl, listEl));
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateVisibility();
      });
    };

    scheduleUpdate();

    let rootObserver: ResizeObserver | null = null;
    let listObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    if (typeof ResizeObserver !== 'undefined') {
      rootObserver = new ResizeObserver(scheduleUpdate);
      listObserver = new ResizeObserver(scheduleUpdate);
      if (rootRef.current) rootObserver.observe(rootRef.current);
      if (listRef.current) listObserver.observe(listRef.current);
    } else if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(scheduleUpdate);
      if (rootRef.current) {
        mutationObserver.observe(rootRef.current, {
          attributes: true,
        });
      }
      if (listRef.current) {
        mutationObserver.observe(listRef.current, {
          attributes: true,
          childList: true,
          subtree: true,
        });
      }
    }

    return () => {
      rootObserver?.disconnect();
      listObserver?.disconnect();
      mutationObserver?.disconnect();
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [
    anchorLinks.length,
  ]);

  useEffect(() => {
    const rootEl = rootRef.current;
    const listEl = listRef.current;
    if (!rootEl || !listEl) return;
    setHideAnchors(shouldHideAnchors(rootEl, listEl));
  }, [
    layoutTick,
  ]);
  if (anchorLinks.length === 0) {
    return null;
  }

  return (
    <div
      id={rootId}
      ref={rootRef}
      data-visible={hideAnchors ? 'hidden' : 'visible'}
      aria-hidden={hideAnchors ? 'true' : undefined}
      className={clsx(s.root, className)}
    >
      <h2 id={idPrefix} data-ui="heading" data-visible="sc-only">
        {anchorNavLabel}
      </h2>

      <ul
        id={anchorListId}
        ref={listRef}
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
                onClick={(event) => {
                  if (anchorId) {
                    event.preventDefault();
                    const scrollToAnchor = () => {
                      const node = document.getElementById(anchorId);
                      if (!node) return false;
                      const rect = node.getBoundingClientRect();
                      const top = window.scrollY + rect.top;
                      window.scrollTo({ top, behavior: 'auto' });
                      return true;
                    };
                    if (!scrollToAnchor()) {
                      const maxWaitMs = 5000;
                      const start = performance.now();
                      let rafId: number | null = null;
                      let observer: MutationObserver | null = null;

                      const cleanup = () => {
                        if (rafId !== null) {
                          window.cancelAnimationFrame(rafId);
                        }
                        observer?.disconnect();
                      };

                      const tick = () => {
                        if (scrollToAnchor()) {
                          cleanup();
                          return;
                        }
                        if (performance.now() - start < maxWaitMs) {
                          rafId = window.requestAnimationFrame(tick);
                        } else {
                          cleanup();
                        }
                      };

                      if (typeof MutationObserver !== 'undefined') {
                        observer = new MutationObserver(() => {
                          if (scrollToAnchor()) {
                            cleanup();
                          }
                        });
                        observer.observe(document.body, {
                          childList: true,
                          subtree: true,
                        });
                      }

                      rafId = window.requestAnimationFrame(tick);
                    }
                  }
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
