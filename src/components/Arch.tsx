'use client';
import clsx from 'clsx';
import {
  memo,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'; // useEffect avoids hydration warnings
import * as s from '@/styles/components/arch.css';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';
import { generateArchPaths } from '../lib/arch/archHelper';
import { createDomId } from '../lib/dom';
import { archGlassVars } from '@/styles/helpers/arch.helper';
import { shadowTotalY } from '../styles/helpers/shadow.helper';
import { noiseStyle } from '../styles/helpers/noiseSVG.helper';
import { assertUnit } from '../styles/measurementKit';
import { archVars } from '../styles/componentTokens/global.componentTokens';

if (process.env.NODE_ENV !== 'production') {
  assertUnit(archVars.top, 'px', 'Arch top');
  assertUnit(archVars.curveHeight, 'px', 'Arch curveHeight');
  assertUnit(archVars.ry, 'px', 'Arch ry');
  assertUnit(archVars.bumpHeight, 'px', 'Arch bumpHeight');
  assertUnit(archVars.bumpWidth, 'px', 'Arch bumpWidth');
}

type Props = {
  className?: string;
  children?: ReactNode;
  ready?: boolean;
  glow?: 'pulse' | 'hold' | null;
  debugGlow?: boolean;
  width?: number | null;
};

function Arch({
  className,
  children,
  ready = false,
  glow = null,
  debugGlow = false,
  width = null,
}: Props) {
  const windowSize = useWindowSize().width;
  const baseId = useMemo(() => createDomId('arch'), []);
  const [
    mounted,
    setMounted,
  ] = useState(false);
  useEffect(() => setMounted(true), []);

  // Safe numbers even before windowSize is known
  const fallbackWidth =
    typeof width === 'number' && width > 0
      ? width
      : windowSize && windowSize > 0
        ? windowSize
        : 0;
  const ws = Math.max(1, fallbackWidth);
  const archTop = archVars.top;
  const archCurveHeight = archVars.curveHeight;
  const fullHeight =
    archTop.getValue() + archCurveHeight.getValue();
  const shadowYOffset = shadowTotalY();
  if (process.env.NODE_ENV !== 'production') {
    assertUnit(shadowYOffset, 'px', 'Arch shadowTotalY');
  }
  const shadowHeight = shadowYOffset.getValue();

  const archPathId = `${baseId}-arch`;
  const bottomPathId = `${baseId}-archBottom`;
  const clipPathId = `${baseId}-clip`;
  const rimXId = `${baseId}-rimId`;

  // Build both paths from safe width (will update when windowSize arrives)
  const { archD, bottomCurveD } = useMemo(
    () =>
      generateArchPaths({
        ...archVars,
        width: ws,
      }),
    [
      ws,
    ],
  );

  return (
    <div
      className={clsx(className, s.root)}
      data-logo-glow={glow ?? undefined}
      data-glow-debug={debugGlow ? 'true' : undefined}
    >
      {mounted && ready && (
        <>
          {/* Shadow layer SVG rendered underneath, with padded viewBox to avoid clipping */}
          <svg
            className={s.shadow}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${ws} ${fullHeight}`}
            width={ws}
            height={fullHeight + shadowHeight}
            preserveAspectRatio="none"
            overflow="visible"
            aria-hidden
            style={{
              pointerEvents: 'none',
            }}
          >
            <path d={archD} className={s.shadowPath} />
          </svg>

          {/* Main arch */}
          <svg
            className={s.svg}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${ws} ${fullHeight}`}
            width={ws}
            height={fullHeight}
            preserveAspectRatio="none"
            overflow="visible"
          >
            <defs>
              <path id={archPathId} d={archD} />
              <path id={bottomPathId} d={bottomCurveD} />

              <clipPath
                id={clipPathId}
                clipPathUnits="userSpaceOnUse"
              >
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
                    hotspotPosition: pos0,
                    hotspotCoverage: cov0,
                    baseLeftAlpha,
                    baseMidAlpha,
                    peakAlpha,
                    baseRightAlpha,
                    color,
                  } = archGlassVars.border;

                  const pos = clamp(pos0);
                  const cov = clamp(cov0);
                  const s = clamp(pos - cov / 2);
                  const e = clamp(pos + cov / 2);
                  const rise = clamp(s + (pos - s) * 0.6);
                  const fall = clamp(pos + (e - pos) * 0.4);
                  const pc = (x: number) =>
                    `${(x * 100).toFixed(2)}%`;
                  const col = (a: number) => color.alpha(a).css(); // chroma → css rgba()

                  return (
                    <>
                      <stop
                        offset={pc(0)}
                        stopColor={col(baseLeftAlpha)}
                      />
                      <stop
                        offset={pc(s)}
                        stopColor={col(baseMidAlpha)}
                      />
                      <stop
                        offset={pc(rise)}
                        stopColor={col(
                          (baseMidAlpha + peakAlpha) / 2,
                        )}
                      />
                      <stop
                        offset={pc(pos)}
                        stopColor={col(peakAlpha)}
                      />
                      <stop
                        offset={pc(fall)}
                        stopColor={col(
                          (baseMidAlpha + peakAlpha * 0.75) / 2,
                        )}
                      />
                      <stop
                        offset={pc(e)}
                        stopColor={col(baseMidAlpha)}
                      />
                      <stop
                        offset={pc(1)}
                        stopColor={col(baseRightAlpha)}
                      />
                    </>
                  );
                })()}
              </linearGradient>
            </defs>

            {/* bottom-only rim: solid stroke; no sides, no top */}
            <use
              href={`#${bottomPathId}`}
              fill="none"
              stroke={`url(#${rimXId})`}
              strokeWidth={archGlassVars.border.width.css()}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          </svg>
          <div
            className={s.surface}
            style={{
              clipPath: `url(#${clipPathId})`,
            }}
            aria-hidden
          >
            <div
              style={{
                backgroundImage: noiseStyle(rimXId),
              }}
              className={s.grain}
            />
          </div>
        </>
      )}
      {children}
    </div>
  );
}

export default memo(Arch);
