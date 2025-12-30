'use client';

import clsx from 'clsx';
import * as s from '@/styles/components/heroGooey.css';

export default function HeroGooey() {
  return (
    <svg
      className={s.blobField}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter id="hero-gooey" colorInterpolationFilters="sRGB">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="12"
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 72 -36"
          />
        </filter>
        <linearGradient
          id="hero-gooey-bigTriangle-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop className={s.bigTriangleGradientStart} offset="0%" />
          <stop className={s.bigTriangleGradientEnd} offset="100%" />
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
        <linearGradient
          id="hero-gooey-star-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop className={s.starGradientStart} offset="0%" />
          <stop className={s.starGradientEnd} offset="100%" />
        </linearGradient>
      </defs>
      <path
        className={clsx(s.blobShape, s.bigTriangle)}
        d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
        fill="url(#hero-gooey-bigTriangle-gradient)"
        transform="scale(0.6)"
      />
      <path
        className={clsx(s.blobShape, s.nubbyTriangle)}
        d="M 200.00 70.00 C 267.55 70.00, 247.53 103.45, 277.45 155.28 C 307.38 207.11, 346.36 206.50, 312.58 265.00 C 278.81 323.50, 259.85 289.43, 200.00 289.43 C 140.15 289.43, 121.19 323.50, 87.42 265.00 C 53.64 206.50, 92.62 207.11, 122.55 155.28 C 152.47 103.45, 132.45 70.00, 200.00 70.00 Z"
        fill="url(#hero-gooey-nubbyTriangle-gradient)"
        transform="matrix(0.19 0 0 0.19 -14 -9)"
      />
      <path
        className={clsx(s.blobShape, s.hexagon)}
        d="M 200.00 70.00 C 267.55 70.00, 274.77 78.83, 308.54 137.33 C 342.32 195.83, 346.36 206.50, 312.58 265.00 C 278.81 323.50, 267.55 325.33, 200.00 325.33 C 132.45 325.33, 121.19 323.50, 87.42 265.00 C 53.64 206.50, 57.68 195.83, 91.46 137.33 C 125.23 78.83, 132.45 70.00, 200.00 70.00 Z"
        fill="url(#hero-gooey-hexagon-gradient)"
        transform="matrix(0.19 0 0 0.19 -1 -9)"
      />
      <path
        className={clsx(s.blobShape, s.star)}
        d="M 200.00 70.00 C 238.81 73.52, 246.98 104.13, 261.82 114.91 C 276.66 125.69, 308.29 124.01, 323.64 159.83 C 332.28 197.83, 305.69 215.06, 300.02 232.50 C 294.36 249.94, 305.74 279.51, 276.41 305.17 C 242.94 325.13, 218.34 305.17, 200.00 305.17 C 181.66 305.17, 157.06 325.13, 123.59 305.17 C 94.26 279.51, 105.64 249.94, 99.98 232.50 C 94.31 215.06, 67.72 197.83, 76.36 159.83 C 91.71 124.01, 123.34 125.69, 138.18 114.91 C 153.02 104.13, 161.19 73.52, 200.00 70.00 Z"
        fill="url(#hero-gooey-star-gradient)"
        transform="matrix(0.19 0 0 0.19 -8 -9)"
      />
    </svg>
  );
}
