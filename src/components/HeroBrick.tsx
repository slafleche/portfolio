import clsx from 'clsx';
import type { ComponentProps } from 'react';

import * as s from '@/styles/components/brick.css.ts';

import Brick from './Brick';

type Props = ComponentProps<typeof Brick>;

export default function HeroBrick({ className, ...rest }: Props) {
  return (
    <Brick className={clsx(s.heroPlacement, className)} {...rest} />
  );
}
