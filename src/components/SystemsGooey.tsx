'use client';

import clsx from 'clsx';
import { type CSSProperties, useId } from 'react';

import * as s from '@/styles/components/systemsGooey.css';

import { themeColours } from '../tokens/global.tokens';

type Props = {
  enabled?: boolean;
  intensity?: 'weak' | 'medium' | 'strong';
  composite?: boolean;
  filterId?: string;
  className?: string;
  style?: CSSProperties;
};

export default function SystemsGooey({
  className,
  style,
}: Props) {
  const baseId = useId();
  const gradientAId = `${baseId}-systems-gooey-gradient-a`;
  const gradientBId = `${baseId}-systems-gooey-gradient-b`;
  const gradientCId = `${baseId}-systems-gooey-gradient-c`;

  return (
    <div className={clsx(s.root, className)} style={style}>
      <svg
        className={s.blobField}
        viewBox="0 5 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        focusable="false"
      >
        <defs>
          {/* Triangle A */}
          <linearGradient
            id={gradientAId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              stopColor={themeColours.systems.gradientA.a.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.systems.gradientA.b.css()}
              offset="40%"
            />
            <stop
              stopColor={themeColours.systems.gradientA.c.css()}
              offset="60%"
            />
            <stop
              stopColor={themeColours.systems.gradientA.d.css()}
              offset="100%"
            />
          </linearGradient>

          {/* Triangle B */}
          <linearGradient
            id={gradientBId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              stopColor={themeColours.systems.gradientB.a.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.systems.gradientB.b.css()}
              offset="30%"
            />
            <stop
              stopColor={themeColours.systems.gradientB.c.css()}
              offset="50%"
            />
            <stop
              stopColor={themeColours.systems.gradientB.d.css()}
              offset="100%"
            />
          </linearGradient>

          {/* Triangle C */}
          <linearGradient
            id={gradientCId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              stopColor={themeColours.systems.gradientC.a.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.systems.gradientC.b.css()}
              offset="30%"
            />
            <stop
              stopColor={themeColours.systems.gradientC.c.css()}
              offset="50%"
            />
            <stop
              stopColor={themeColours.systems.gradientC.d.css()}
              offset="100%"
            />
          </linearGradient>
        </defs>
        <g className={s.blobGroup}>
          {/* Triangle A*/}
          <path
            data-triangle="a"
            className={s.blobShape}
            d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
            fill="none"
            stroke={`url(#${gradientAId})`}
            strokeWidth="2"
            strokeLinejoin="round"
            transform="rotate(180) translate(0 -6) scale(1.3 0.9)"
          />
          {/* Triangle B */}
          <path
            data-triangle="b"
            className={s.blobShape}
            d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
            fill="none"
            stroke={`url(#${gradientBId})`}
            strokeWidth="2"
            strokeLinejoin="round"
            transform="rotate(180) scale(1 0.7) translate(0 -6.9)"
          />
          {/* Triangle C */}
          <path
            data-triangle="c"
            className={s.blobShape}
            d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
            fill="none"
            strokeLinejoin="round"
            strokeWidth={5}
            stroke={`url(#${gradientCId})`}
            transform="rotate(180) scale(0.6 0.4) translate(0 -5)"
          />
        </g>
      </svg>
    </div>
  );
}
