'use client';
import type { ReactNode } from 'react';

import clsx from 'clsx';
import * as s from '@/styles/components/card.css'

import Heading, { IHeadingDepth } from '../Heading';

type Props = IHeadingDepth & {
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function Card({ title, depth = 3, className, children }: Props) {
  return (
    <div className={clsx(s.card, className)}>
    <div className={clsx(s.fakeBorder)}>
      {title && (
        <Heading className={s.title} depth={depth}>
          {title}
        </Heading>
      )}
      {children}
    </div>
    </div>
  );
}
