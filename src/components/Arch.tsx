'use client';
import clsx from 'clsx';
import { ReactNode } from 'react';
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { generateArchPath } from '../lib/arch/archHelper';
import { archVars } from '../styles/vars';
import { glassyBg } from '../styles/glassy.css';
import { useSafeId } from '../lib/dom';

type Props = {
  className?: string;
  children?: ReactNode;
};

export default function Arch({ className, children }: Props) {
  const windowSize = useWindowSize().width;
  const id = useSafeId('arch-');

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
        className={clsx(s.svg)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${windowSize} ${fullHeight}`}
        width={windowSize}
        height={fullHeight}
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={`clip-${id}`} clipPathUnits="userSpaceOnUse">
            <path d={d} />
          </clipPath>
        </defs>

        <path d={d} fill="transparent" className={s.path} />

        <foreignObject
          x="0"
          y="0"
          width="100%"
          height="100%"
          clipPath={`url(#clip-${id})`}
        >
          <div
            // xmlns="http://www.w3.org/1999/xhtml"
            className={glassyBg}
            style={{ width: '100%', height: '100%' }}
          />
        </foreignObject>
      </svg>

      {children}
    </div>
  );
}
