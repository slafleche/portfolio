'use client';

import Link from 'next/link';
import * as s from '@/styles/components/anchorMenu.css.ts';
import clsx from 'clsx';
import { useSafeId } from '@/lib/dom';
import { visuallyHidden } from '@/styles/components/forms.css.ts';

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
  const labelId = useSafeId('anchor-menu');

  if (anchorLinks.length === 0) {
    return null;
  }
  return (
    <div className={clsx(s.root, className)}>
      <h2 id={labelId} className={visuallyHidden}>
        {anchorNavLabel}
      </h2>
      <ul
        className={s.list}
        aria-labelledby={labelId}
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
                <div className={s.handle}>
                  <span className={s.dotWrapper}>
                    <span className={s.dot} />
                  </span>

                  <span className={s.labelWrapper}>
                    <span className={s.label}>{anchor.title}</span>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
