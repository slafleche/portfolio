import clsx from 'clsx';
import type { ReactNode } from 'react';

import * as s from '@/styles/components/tiles.css.ts';

import Heading from './Heading';

type TileProps = {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  bgOverlay?: ReactNode;
};

export default function Tile({
  title,
  children,
  className,
  id,
  bgOverlay,
  ...rest
}: TileProps) {
  return (
    <article id={id} className={clsx(s.root, className)} {...rest}>
      <div className={s.content}>
        <Heading depth={3} className={s.title}>
          {title}
        </Heading>
        <div
          aria-hidden={true}
          className={s.separator}
        />
        {children}
      </div>
      {bgOverlay}
    </article>
  );
}
