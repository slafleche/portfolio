'use client';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';

export interface IArch {
  containerHeight: number; // Space above the arch, the space for the nav items
  curveHeight: number; // This is the height of the arch under the containerHeight. Full height is containerHeight + curveHeight
  maskOffset: number; // Modifies curve of arch. the higher this number, the more round, the lower, the more flat.
  bumpHeight: number; // Height of the "bump" in the middle of the arch
  bumpWidth: number; // Width of the "bump" at the base, the part touching the arch
  bumpRoundness: number; // Roundness of "bump"
  bumpSpan: number; // This adjusts how wide the "bump" is at the tip
}

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
