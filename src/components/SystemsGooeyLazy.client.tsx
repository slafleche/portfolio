'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

const SystemsGooey = dynamic(
  () => import('@/components/SystemsGooey'),
  { ssr: false },
);

type SystemsGooeyProps = ComponentProps<typeof SystemsGooey>;

export default function SystemsGooeyLazy(props: SystemsGooeyProps) {
  return <SystemsGooey {...props} />;
}
