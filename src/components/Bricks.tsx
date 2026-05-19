import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';

import * as s from '@/styles/components/bricks.css.ts';

import Brick, { type BrickData } from './Brick';
import HeroBrick from './HeroBrick';

type Props = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  hero?: BrickData;
  items: BrickData[];
};

export default function Bricks({
  hero,
  items,
  className,
  ...rest
}: Props) {
  return (
    <div className={clsx(s.root, className)} {...rest}>
      {hero ? <HeroBrick {...hero} /> : null}
      {items.map((item, index) => (
        <Brick key={index} {...item} />
      ))}
    </div>
  );
}
