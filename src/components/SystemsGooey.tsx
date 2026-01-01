'use client';

import { useId, type CSSProperties } from 'react';
import clsx from 'clsx';
import Goo from '@lafleche/gooey-react';
import * as s from '@/styles/components/systemsGooey.css';
import { themeColours } from '../tokens/global.tokens';

type Props = {
  intensity?: 'weak' | 'medium' | 'strong';
  composite?: boolean;
  filterId?: string;
  className?: string;
  style?: CSSProperties;
};

export default function SystemsGooey({
  intensity = 'strong',
  composite,
  filterId,
  className,
  style,
}: Props) {
  const baseId = useId();
  const gooeyId = filterId ?? `${baseId}-systems-gooey-filter`;
  const gradientAId = `${baseId}-systems-gooey-gradient-a`;
  const gradientBId = `${baseId}-systems-gooey-gradient-b`;

  return (
    <Goo
      className={clsx(s.blobWrap, className)}
      intensity={intensity}
      composite={composite}
      id={gooeyId}
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
          {/* Triangle A */}
          <path
            className={s.blobShape}
            d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
            fill="none"
            stroke={`url(#${gradientAId})`}
            strokeWidth="20"
            strokeLinejoin="round"
            transform="translate(20 31) scale(0.3)"
          />
          {/* Triangle B */}
          ù
          <path
            className={s.blobShape}
            d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
            fill="none"
            stroke={`url(#${gradientAId})`}
            strokeWidth="20"
            strokeLinejoin="round"
            transform="translate(50 31) scale(0.3)"
          />
          {/* Triangle C */}
          <path
            className={s.blobShape}
            d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
            fill="none"
            stroke={`url(#${gradientAId})`}
            strokeWidth="20"
            strokeLinejoin="round"
            transform="translate(60 41) scale(0.3)"
          />
        </g>
      </svg>
    </Goo>
  );
}
