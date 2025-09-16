'use client';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { generateArchPath, IArch } from '../lib/arch/archHelper';
import { archVars } from '../styles/vars';

type Props = {
  className?: string;
  children?: ReactNode;
};

export default function Arch({ className, children }: Props) {
  const windowSize = useWindowSize().width;

  
  if (!windowSize) {
    // If we have no height yet, at least render a placeholder with the right dimensions
    return (
      <div
        className={clsx(className, s.arch)}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: `${archVars.top + archVars.curveHeight}px`,
        }}
      />
    );
  }

  const d = generateArchPath({
    ...archVars,
    width: windowSize,
  });

  const fullHeight = archVars.top + archVars.curveHeight;

  return (
    <div className={clsx(className, s.arch)}>
      <svg
        className={s.svg}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${windowSize} ${fullHeight}`}
        width={windowSize}
        height={fullHeight}
        preserveAspectRatio="none"
      >
        <path d={d} className={s.path} />
      </svg>
      {children}
    </div>
  );
}
