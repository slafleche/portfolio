'use client';
import clsx from 'clsx';
import { ReactNode } from 'react';
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { generateArchPath } from '../lib/arch/archHelper';
import { archVars, colorVars } from '../styles/vars';
import { glassGrain, glassyBg, glassyElement } from '../styles/glassy.css';
import { useSafeId } from '../lib/dom';
import { glossyBorderVars } from '../styles/helpers/effects';

type Props = {
  className?: string;
  children?: ReactNode;
};

export default function Arch({ className, children }: Props) {
  const windowSize = useWindowSize().width;
  const baseId = useSafeId();
  const archPathId = `${baseId}-arch`;
  const clipPathId = `${baseId}-clip`;
  // alongside your existing ids (e.g., baseId/archPathId/clipId)
  const rimHotId = `${baseId}-rimHot`; // use your actual base id var name here

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
        <defs>
          <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
            <use href={`#${archPathId}`} />
          </clipPath>

          <path id={archPathId} d={d} />

          <radialGradient
            id={rimHotId}
            gradientUnits="objectBoundingBox"
            cx={glossyBorderVars.hotCx}
            cy={glossyBorderVars.hotCy}
            r={glossyBorderVars.hotR}
          >
            <stop
              offset="0%"
              stopColor={`rgba(255,255,255,${glossyBorderVars.hotAlpha})`}
            />
            <stop offset="60%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Make a pseudo shadow */}
        <use
          xlinkHref={`#${archPathId}`}
          fill={colorVars.shadow.css()}
          transform="translate(0 6)"
          style={{ filter: 'blur(4px)' }}
        />

        {/* Makes the glass effect */}
        <foreignObject
          x="0"
          y="0"
          width="100%"
          height="100%"
          clipPath={`url(#${clipPathId})`}
        >
          <div className={clsx(glassyBg, glassyElement)}>
            <div className={glassGrain} />
          </div>
        </foreignObject>

        <use
          xlinkHref={`#${archPathId}`}
          fill="none"
          stroke={`url(#${rimHotId})`}
          strokeWidth={glossyBorderVars.thickness.css()}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      </svg>

      {children}
    </div>
  );
}
