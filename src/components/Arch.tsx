'use client';
import clsx from 'clsx';
import { ReactNode } from 'react'; // useEffect avoids hydration warnings
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { generateArchPaths } from '../lib/arch/archHelper';
import { archVars } from '../styles/vars';
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
            {(() => {
              const clamp = (v: number, a = 0, b = 1) =>
                Math.min(b, Math.max(a, v));
              const {
                rimHotPosX: pos0,
                rimHotCoverage: cov0,
                rimBaseLeft, // e.g. 0.14
                rimBaseMid, // e.g. 0.20
                rimPeak, // e.g. 0.44
                rimBaseRight, // e.g. 0.24
                rimColor, //  chroma color
              } = glossyBorderVars;

              const pos = clamp(pos0);
              const cov = clamp(cov0);
              const s = clamp(pos - cov / 2);
              const e = clamp(pos + cov / 2);
              const rise = clamp(s + (pos - s) * 0.6);
              const fall = clamp(pos + (e - pos) * 0.4);
              const pc = (x: number) => `${(x * 100).toFixed(2)}%`;
              const col = (a: number) => rimColor.alpha(a).css(); // chroma → css rgba()

              return (
                <>
                  <stop offset={pc(0)} stopColor={col(rimBaseLeft)} />
                  <stop offset={pc(s)} stopColor={col(rimBaseMid)} />
                  <stop
                    offset={pc(rise)}
                    stopColor={col((rimBaseMid + rimPeak) / 2)}
                  />
                  <stop offset={pc(pos)} stopColor={col(rimPeak)} />
                  <stop
                    offset={pc(fall)}
                    stopColor={col((rimBaseMid + rimPeak * 0.75) / 2)}
                  />
                  <stop offset={pc(e)} stopColor={col(rimBaseMid)} />
                  <stop offset={pc(1)} stopColor={col(rimBaseRight)} />
                </>
              );
            })()}
          </linearGradient>
        </defs>

        {/* optional pseudo shadow; safe to comment out while debugging bands */}
        <use href={`#${archPathId}`} className={glassyStyles.shadow} />

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
