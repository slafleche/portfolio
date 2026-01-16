'use client';

import clsx from 'clsx';

import * as s from '@/styles/components/heroBg.css';

import TriangleEcho from './icons/TriangleEcho';

type Props = {
  className?: string;
};

export default function HeroSystemsBg({
  className,
}: Props) {
  return (
    <div className={clsx(s.root, className)}>
      <TriangleEcho className={s.triangleEcho}/>
    </div>
  );
}
