'use client';
import clsx from 'clsx';
import { ReactNode } from 'react'; // useEffect avoids hydration warnings
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { generateArchPaths } from '../lib/arch/archHelper';
import { archVars, colorVars } from '../styles/vars';
import * as glassyStyles from '../styles/glassy.css';
import { useSafeId } from '../lib/dom';
import { glossyBorderVars } from '../styles/helpers/effects';

type Props = { className?: string; children?: ReactNode };

export default function Arch({ className, children }: Props) {
  const windowSize = useWindowSize().width;
  const baseId = useSafeId();
  if (!windowSize) return null; // Bail early if window size is bad

  // Safe numbers even before windowSize is known
  const ws = Math.max(1, windowSize ?? 0);
  const fullHeight = archVars.top + archVars.curveHeight;

  const archPathId = `${baseId}-arch`;
  const bottomPathId = `${baseId}-archBottom`;
  const clipPathId = `${baseId}-clip`;
  const rimXId = `${baseId}-rimId`;
  const rimXHotId = `${baseId}-rimHot`;

  // Build both paths from safe width (will update when windowSize arrives)
  const { archD, bottomCurveD } = generateArchPaths({
    ...archVars,
    width: ws,
  });

  return (
    <div className={clsx(className, s.arch)}>
      <svg
        className={s.svg}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${ws} ${fullHeight}`}
        width={ws}
        height={fullHeight}
        preserveAspectRatio="none"
      >
        <defs>
          <path id={archPathId} d={archD} />
          <path id={bottomPathId} d={bottomCurveD} />

          <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
            <use href={`#${archPathId}`} />
          </clipPath>

          {/* Gradient for rim */}
          <linearGradient
            id={rimXId}
            x1="0"
            y1="0"
            x2={ws}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            {/* left stays subtle */}
            <stop offset="0%" stopColor="hsla(0,0%,100%,0.14)" />
            <stop offset="40%" stopColor="hsla(0,0%,100%,0.20)" />
            {/* hotspot ~65% across */}
            <stop offset="60%" stopColor="hsla(0,0%,100%,0.32)" />
            <stop offset="66%" stopColor="hsla(0,0%,100%,0.44)" />
            {/* ease down toward right corner so edge isn’t the brightest */}
            <stop offset="82%" stopColor="hsla(0,0%,100%,0.34)" />
            <stop offset="100%" stopColor="hsla(0,0%,100%,0.24)" />
          </linearGradient>
        </defs>

        {/* optional pseudo shadow; safe to comment out while debugging bands */}
        <use
          href={`#${archPathId}`}
          fill={colorVars.shadow.css()}
          className={glassyStyles.shadow}
        />

        {/* frosted body */}
        <foreignObject
          x="0"
          y="0"
          width="100%"
          height="100%"
          clipPath={`url(#${clipPathId})`}
        >
          <div className={clsx(glassyStyles.bg, glassyStyles.element)}>
            <div className={glassyStyles.grain} />
          </div>
        </foreignObject>

        {/* bottom-only rim: solid stroke; no sides, no top */}
        <use
          href={`#${bottomPathId}`}
          fill="none"
          stroke={`url(#${rimXId})`}
          strokeWidth={glossyBorderVars.thickness.css()}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />

        {/* Dnd of SVG */}
      </svg>
      {children}
    </div>
  );
}
