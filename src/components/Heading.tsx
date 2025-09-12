'use client';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface IHeadingDepth {
  depth?: 2 | 3 | 4 | 5 | 6;
}

type Props = IHeadingDepth & {
    className?: string;
    children: ReactNode;
};

export default function Heading({depth = 3, className, children }: Props) {
  const Tag = `h${depth || 3}` as 'h3';

  return (
    <Tag className={clsx('heading', className)}>
      {children}
    </Tag>
  );
}
