'use client';

import React, { memo, useMemo } from 'react';
import chroma, { Color } from 'chroma-js';
import * as s from '@/styles/components/bokeh.css';
import { useSafeId } from '../lib/dom';
import clsx from 'clsx';
import { useWindowSize } from '@/lib/responsive/WindowSizeContext';

// A simple, deterministic layout for ~10 circles.
// You can tweak cx, cy, r as you like.
type Blob = { cx: number; cy: number; r: number; group: 0 | 1 };

const BLOBS: Blob[] = [
  { cx: 18, cy: 20, r: 22, group: 0 },
  { cx: 32, cy: 18, r: 18, group: 1 },
  { cx: 48, cy: 24, r: 28, group: 0 },
  { cx: 66, cy: 18, r: 20, group: 1 },
  { cx: 78, cy: 28, r: 26, group: 0 },
  { cx: 22, cy: 66, r: 26, group: 1 },
  { cx: 40, cy: 72, r: 20, group: 0 },
  { cx: 56, cy: 64, r: 24, group: 1 },
  { cx: 72, cy: 74, r: 18, group: 0 },
  { cx: 84, cy: 60, r: 22, group: 1 },
];

export type BokehOverlayProps = {
  /** One chroma color per blob; if fewer provided, they cycle */
  colors?: Color[];
  /** Overall opacity of the overlay [0..1] */
  opacity?: number;
  /** CSS blend mode (e.g. 'screen' | 'overlay' | 'soft-light' | 'plus-lighter') */
  blendMode?: React.CSSProperties['mixBlendMode'];
  /** Blur radius in CSS/SVG px (stdDeviation ~= blur/2) */
  blur?: number;
  /** Multiplier applied to blur for finer control (e.g., 0.5 for smaller blur) */
  blurScale?: number;
  /** Multiplier applied to all circle radii (1 = as defined) */
  sizeScale?: number;
  className?: string;
};

function BokehOverlay({
  colors = [
    chroma('#5b419a'),
    chroma('#b98cde'),
    chroma('#e1864e'),
    chroma('#E15DAE'),
    chroma('#5d4cb9'),
  ],
  opacity = 0.2,
  blendMode = 'screen',
  blur = 60,
  blurScale = 1,
  sizeScale = 0.7,
  className,
}: BokehOverlayProps) {
  const id = useSafeId();
  const { width, height } = useWindowSize();

  // Precompute color strings
  const colorStrs = useMemo(() => colors.map((c) => c.css()), [colors]);

  // Convert blur (CSS px) to viewBox units (0..100) and memoize
  const { stdDev, pad } = useMemo(() => {
    const minSidePx = Math.max(1, Math.min(width ?? 0, height ?? 0));
    const baseUnits = minSidePx ? (blur / minSidePx) * 100 : blur / 10;
    const units = Math.max(0, baseUnits * blurScale);
    return {
      stdDev: Math.max(0.5, units / 2),
      pad: Math.max(300, Math.ceil((units / 100) * 20)),
    };
  }, [width, height, blur, blurScale]);

  return (
    <div
      className={clsx(s.overlay, className)}
      style={{
        opacity,
        mixBlendMode: blendMode,
        // isolate blending to this overlay so filter edges don't interact oddly
        isolation: 'isolate',
      }}
      aria-hidden
    >
      <svg
        className={s.svg}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        // avoid any clipping from the root svg box
        overflow="visible"
        // helps sub-pixel edges on some GPUs
        shapeRendering="geometricPrecision"
      >
        <defs>
          <filter
            id={id}
            filterUnits="objectBoundingBox"
            x={`${-pad}%`}
            y={`${-pad}%`}
            width={`${100 + pad * 2}%`}
            height={`${100 + pad * 2}%`}
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={stdDev} edgeMode="none" />
          </filter>
        </defs>

        {/* Two counter-rotating groups for a gentle parallax feel */}
        <g className={s.rotating}>
          {useMemo(() => BLOBS.filter((b) => b.group === 0), [])
            .map((b, i) => (
            <circle
              key={`g0-${i}`}
              cx={b.cx}
              cy={b.cy}
              r={b.r * sizeScale}
              // chroma -> CSS-safe string
              fill={colorStrs[i % colorStrs.length]}
              filter={`url(#${id})`}
              opacity={0.9}
            />
          ))}
        </g>

        <g className={s.rotatingSlow} style={{ animationDirection: 'reverse' }}>
          {useMemo(() => BLOBS.filter((b) => b.group === 1), [])
            .map((b, i) => (
            <circle
              key={`g1-${i}`}
              cx={b.cx}
              cy={b.cy}
              r={b.r * sizeScale}
              fill={colorStrs[(i + 3) % colorStrs.length]}
              filter={`url(#${id})`}
              opacity={0.9}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default memo(BokehOverlay);
