'use client';

import {
  createContext,
  useContext,
  type ReactNode,
  type CSSProperties,
} from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/grid.css';

interface GridContextValue {
  columnCount: number;
}

const GridContext = createContext<GridContextValue | null>(null);

export type GridProps = {
  columns?: number;
  className?: string;
  children?: ReactNode;
};

export function Grid({
  columns = 1,
  className,
  children,
}: GridProps) {
  return (
    <GridContext.Provider value={{ columnCount: columns }}>
      <div
        className={clsx(s.root, className)}
        style={{ '--grid-columns': String(columns) } as CSSProperties}
      >
        {children}
      </div>
    </GridContext.Provider>
  );
}

export type ColumnProps = {
  span?: number;
  className?: string;
  children?: ReactNode;
};

export function Column({
  span = 1,
  className,
  children,
}: ColumnProps) {
  const context = useContext(GridContext);
  const maxColumns = context?.columnCount ?? span;
  const clampedSpan = Math.min(Math.max(1, span), maxColumns);

  return (
    <div
      className={clsx(s.column, className)}
      style={{ '--grid-span': String(clampedSpan) } as CSSProperties}
    >
      {children}
    </div>
  );
}

Grid.Column = Column;
