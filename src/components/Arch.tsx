'use client';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { generateArchPath, IArch } from '../lib/arch/archHelper';

type Props = IArch & {
  width: number;
  className?: string;
  children: ReactNode;
};

export default function Arch({ className, children }: Props) {
  const windowSize = useWindowSize().width;
  if (!windowSize) return null; // wait to render if we don't have the window size

  const archProps: IArch = {
    top: 40,
    curveHeight: 16,
    ry: 70,
    bumpHeight: 12,
    bumpWidth: 50,
    bumpBaseWidth: 0.85,
    bumpTipWidth: 7,
  };

  const d = generateArchPath({
    ...archProps,
    width: windowSize,
  });

  return (
    <div className={clsx(className, s.arch)}>
      <svg
        className={s.svg}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${width} ${height}"
        width={windowSize}
        height={archProps.top + archProps.curveHeight}
        preserveAspectRatio="none"
      >
        <path d={d} fill="currentColor" />
      </svg>
      {children}
    </div>
  );
}
