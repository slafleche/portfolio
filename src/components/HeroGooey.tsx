'use client';

import type { CSSProperties } from 'react';
import clsx from 'clsx';
import Goo from '@lafleche/gooey-react';
import * as s from '@/styles/components/heroGooey.css';

type Props = {
  intensity?: 'weak' | 'medium' | 'strong';
  composite?: boolean;
  filterId?: string;
  className?: string;
  style?: CSSProperties;
};

export default function HeroGooey({
  intensity = 'weak',
  composite,
  filterId,
  className,
  style,
}: Props) {
  return (
    <Goo
      className={clsx(s.blobWrap, className)}
      intensity={intensity}
      composite={composite}
      id={filterId}
      style={style}
    >
      <svg
        className={s.blobField}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient
            id="hero-gooey-bigTriangle-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              className={s.bigTriangleGradientStart}
              offset="0%"
            />
            <stop
              className={s.bigTriangleGradientEnd}
              offset="100%"
            />
          </linearGradient>

          <linearGradient
            id="hero-gooey-nubbyTriangle-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              className={s.nubbyTriangleGradientStart}
              offset="0%"
            />
            <stop
              className={s.nubbyTriangleGradientEnd}
              offset="100%"
            />
          </linearGradient>
          <linearGradient
            id="hero-gooey-hexagon-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop className={s.hexagonGradientStart} offset="0%" />
            <stop className={s.hexagonGradientEnd} offset="100%" />
          </linearGradient>
        </defs>
        <g className={s.blobGroup}>
          <g className={clsx(s.blobSpin, s.bigTriangleAnimation)}>
            <path
              className={clsx(s.blobShape, s.bigTriangle)}
              d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
              fill="url(#hero-gooey-bigTriangle-gradient)"
              transform="translate(6 20) scale(0.45)"
            />
          </g>
          <g className={clsx(s.blobSpin, s.nubbyTriangleAnimation)}>
            <path
              className={clsx(s.blobShape, s.nubbyTriangle)}
              d="M 200.00 70.00 C 267.55 70.00, 247.53 103.45, 277.45 155.28 C 307.38 207.11, 346.36 206.50, 312.58 265.00 C 278.81 323.50, 259.85 289.43, 200.00 289.43 C 140.15 289.43, 121.19 323.50, 87.42 265.00 C 53.64 206.50, 92.62 207.11, 122.55 155.28 C 152.47 103.45, 132.45 70.00, 200.00 70.00 Z"
              fill="url(#hero-gooey-nubbyTriangle-gradient)"
              transform="translate(40 18) scale(0.09)"
            />
          </g>
          <g className={clsx(s.blobSpin, s.hexagonAnimation)}>
            <path
              className={clsx(s.blobShape, s.hexagon)}
              d="M 200.00 70.00 C 267.55 70.00, 274.77 78.83, 308.54 137.33 C 342.32 195.83, 346.36 206.50, 312.58 265.00 C 278.81 323.50, 267.55 325.33, 200.00 325.33 C 132.45 325.33, 121.19 323.50, 87.42 265.00 C 53.64 206.50, 57.68 195.83, 91.46 137.33 C 125.23 78.83, 132.45 70.00, 200.00 70.00 Z"
              fill="url(#hero-gooey-hexagon-gradient)"
              transform="translate(60 45) scale(0.09)"
            />
          </g>
        </g>
      </svg>
    </Goo>
  );
}
