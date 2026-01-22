'use client';

import clsx from 'clsx';
import {
  Children,
  cloneElement,
  createContext,
  type CSSProperties,
  Fragment,
  isValidElement,
  type ReactNode,
  useContext,
} from 'react';

import * as s from '@/styles/components/grid.css';
import { useMedia } from '@/styles/responsive';

interface GridContextValue {
  columnCount: number;
}

const GridContext = createContext<GridContextValue | null>(null);

export type GridProps = {
  className?: string;
  children?: ReactNode;
};

export function Grid({ className, children }: GridProps) {
  return <div className={clsx(s.root, className)}>{children}</div>;
}

export type ColumnProps = {
  span?: number;
  mediaQuerySpan?: Record<string, number>;
  className?: string;
  children?: ReactNode;
};

export function Column({
  span = 1,
  mediaQuerySpan,
  className,
  children,
}: ColumnProps) {
  const context = useContext(GridContext);
  const maxColumns = context?.columnCount ?? 1;
  const matches = useMedia() as Record<string, boolean | undefined>;
  let overrideSpan: number | undefined;
  if (mediaQuerySpan) {
    for (const [
      key,
      value,
    ] of Object.entries(mediaQuerySpan)) {
      if (matches[key] === true && Number.isFinite(value)) {
        overrideSpan =
          overrideSpan === undefined || value < overrideSpan
            ? value
            : overrideSpan;
      }
    }
  }
  const requestedSpan = overrideSpan ?? span;
  const clampedSpan = Math.min(
    Math.max(1, requestedSpan),
    maxColumns,
  );
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
