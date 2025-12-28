'use client';

import {
  createContext,
  useContext,
  Fragment,
  Children,
  isValidElement,
  cloneElement,
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
  const safeColumns = Math.max(1, columns);

  return (
    <GridContext.Provider value={{ columnCount: safeColumns }}>
      <div
        className={clsx(s.root, className)}
        style={
          {
            gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))`,
          } as CSSProperties
        }
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
  const maxColumns = context?.columnCount ?? 1;
  const clampedSpan = Math.min(Math.max(1, span), maxColumns);
  const shouldStretch = clampedSpan < maxColumns;
  const childClassName = shouldStretch ? s.fillRow : undefined;

  const processedChildren = childClassName
    ? Children.map(children, (child) => {
        if (!isValidElement<{ className?: string }>(child)) {
          throw new Error(
            'Grid.Column expects React elements that accept a className prop.',
          );
        }

        if (child.type === Fragment) {
          throw new Error(
            'Grid.Column does not support React.Fragment children.',
          );
        }

        const mergedClassName = clsx(
          child.props.className,
          childClassName,
        );

        return cloneElement(child, { className: mergedClassName });
      })
    : children;

  return (
    <div
      className={clsx(s.column, className)}
      style={
        {
          gridColumn: `span ${clampedSpan}`,
        } as CSSProperties
      }
    >
      {processedChildren}
    </div>
  );
}

Grid.Column = Column;
