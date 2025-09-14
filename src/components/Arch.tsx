'use client';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { IArch } from '../lib/arch/archHelper';

type Props = IArch & {
  className?: string;
  children: ReactNode;
};

export default function Arch({
  containerHeight = 40,
  curveHeight = 16,
  maskOffset = 70,
  bumpHeight = 12,
  bumpWidth = 50,
  bumpRoundness = 0.85,
  bumpSpan = 7,
  className,
  children,
}: Props) {
  const { width } = useWindowSize();

  return (
    <div className={clsx(className, s.arch)}>
      <svg
        className={s.svg}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${width} ${height}"
        width="${width}"
        height="${height}"
        preserveAspectRatio="none"
      >
        <path
          d={buildNavSVG({
            width,
            top: containerHeight,
            curve: curveHeight,
            ry: maskOffset,
            bulgeDepth: bumpHeight,
            bulgeWidth: bumpWidth,
            shoulder: bumpRoundness,
            tipRound: bumpSpan,
          })}
          fill="currentColor"
        />
      </svg>
      {children}
    </div>
  );
}
