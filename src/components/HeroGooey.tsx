'use client';

import clsx from 'clsx';
import { type CSSProperties, useId } from 'react';

import { usePrefersReducedMotion } from '@/lib/accessibility/usePrefersReducedMotion';
import * as s from '@/styles/components/heroGooey.css';

import { themeColours } from '../tokens/global.tokens';

type Props = {
  intensity?: 'weak' | 'medium' | 'strong';
  composite?: boolean;
  filterId?: string;
  className?: string;
  style?: CSSProperties;
};

export default function HeroGooey({
  className,
  style,
}: Props) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const baseId = useId();
  const gradientAId = `${baseId}-hero-gooey-gradient-a`;
  const gradientBId = `${baseId}-hero-gooey-gradient-b`;

  return (
    <div className={clsx(s.blobWrap, className)} style={style}>
      <svg
        className={s.blobField}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        focusable="false"
      >
       
        <defs>
          <linearGradient
            id={gradientAId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              stopColor={themeColours.roundedTriangle.a.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.roundedTriangle.b.css()}
              offset="40%"
            />
            <stop
              stopColor={themeColours.roundedTriangle.b.css()}
              offset="60%"
            />
            <stop
              stopColor={themeColours.roundedTriangle.c.css()}
              offset="100%"
            />
          </linearGradient>

          <linearGradient
            id={gradientBId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              stopColor={themeColours.nubbyTriangle.a.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.nubbyTriangle.b.css()}
              offset="50%"
            />
            <stop
              stopColor={themeColours.nubbyTriangle.c.css()}
              offset="100%"
            />
          </linearGradient>
        </defs>
        <g className={s.blobGroup}>
          {/* Fat Triangle */}
          <g className={clsx(s.blobSpin, s.ellpitical_a_nimation)}>
            <g className={s.blobSpin}>
              {prefersReducedMotion ? null : (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur="27s"
                  repeatCount="indefinite"
                />
              )}
              <path
                className={s.blobShape}
                d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
                fill="none"
                stroke={`url(#${gradientAId})`}
                strokeWidth="25"
                strokeLinejoin="round"
                transform="translate(20 31) scale(0.4)"
              />
            </g>
          </g>
          {/* Nubby Triangle */}
          <g className={s.blobSpin}>
            {prefersReducedMotion ? null : (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 50 50"
                to="0 50 50"
                dur="37s"
                repeatCount="indefinite"
              />
            )}
            <g className={clsx(s.blobSpin, s.ellpitical_b_animation)}>
              <path
                className={s.blobShape}
                d="M 200.00 70.00 C 267.55 70.00, 247.53 103.45, 277.45 155.28 C 307.38 207.11, 346.36 206.50, 312.58 265.00 C 278.81 323.50, 259.85 289.43, 200.00 289.43 C 140.15 289.43, 121.19 323.50, 87.42 265.00 C 53.64 206.50, 92.62 207.11, 122.55 155.28 C 152.47 103.45, 132.45 70.00, 200.00 70.00 Z"
                stroke={`url(#${gradientBId})`}
                strokeWidth="55"
                fill="none"
                transform="translate(45 33.4) scale(0.13)"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
