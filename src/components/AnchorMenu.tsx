'use client';

import Link from 'next/link';
import * as s from '@/styles/components/anchorMenu.css.ts';
import clsx from 'clsx';

export type AnchorLink = {
  title: string;
  href: string;
};

type MenuProps = {
  anchorLinks?: ReadonlyArray<AnchorLink>;
  anchorNavLabel: string;
  className?: string;
};

export default function AnchorLink({
  className,
  anchorNavLabel,
  anchorLinks = [],
}: MenuProps) {
  if (anchorLinks.length === 0) {
    return null;
  }
  return (
    <ul className={clsx(s.root, className)} aria-label={anchorNavLabel} data-ui="list-unordered">
      {anchorLinks.map((anchor) => (
        <li data-ui="list-item" key={anchor.href} className={s.item}>
          <Link data-ui="link" className={s.link} href={anchor.href} aria-label={anchor.title}>
            {anchor.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
