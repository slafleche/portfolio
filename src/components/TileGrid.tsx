import clsx from 'clsx';
import type { ReactNode } from 'react';

import * as s from '@/styles/components/tiles.css.ts';

type TileGridProps = {
  children: ReactNode;
  className?: string;
};

export default function TileGrid({
  children,
  className,
}: TileGridProps) {
  return <div className={clsx(s.grid, className)}>{children}</div>;
}

