import clsx from 'clsx';
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
} from 'react';

import { Markdown } from '@/components/Markdown';
import * as s from '@/styles/components/brick.css.ts';

import Heading from './Heading';

export type BrickData = {
  title: ReactNode | string;
  body: string;
  iconAsBg?: ReactNode;
};

type Props = Omit<ComponentPropsWithoutRef<'article'>, 'title'> &
  BrickData & {
    columns?: number;
    rows?: number;
  };

export default function Brick({
  title,
  body,
  iconAsBg,
  columns = 1,
  rows = 1,
  className,
  style,
  ...rest
}: Props) {
  const isStringTitle = typeof title === 'string';
  const gridStyle: CSSProperties = {
    gridColumn: `span ${columns}`,
    gridRow: `span ${rows}`,
    ...style,
  };

  return (
    <article
      className={clsx(s.root, className)}
      style={gridStyle}
      {...rest}
    >
      {iconAsBg && (
        <div className={s.iconAsBg} aria-hidden="true">
          {iconAsBg}
        </div>
      )}
      <div className={s.content}>
        {isStringTitle ? (
          <Heading className={s.title} depth={3}>
            {title}
          </Heading>
        ) : (
          title
        )}
        <Markdown className={s.body} source={body} />
      </div>
    </article>
  );
}
