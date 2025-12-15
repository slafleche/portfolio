import type { ReactNode } from 'react';
import clsx from 'clsx';
import * as s from '@/styles/components/tiles.css.ts';
import Heading from './Heading';

type TileProps = {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
};

export default function Tile({
  title,
  children,
  className,
  id,
}: TileProps) {
  return (
    <article id={id} className={clsx(s.tile, className)}>
      <Heading depth={3} className={s.tileTitle}>
        {title}
      </Heading>
      {children}
    </article>
  );
}

