'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const HeroGooey = dynamic(() => import('@/components/HeroGooey'), {
  ssr: false,
});

type HeroGooeyProps = ComponentProps<typeof HeroGooey>;

export default function HeroGooeyLazy(props: HeroGooeyProps) {
  return <HeroGooey {...props} />;
}
