'use client';

import type { CSSProperties } from 'react';
import clsx from 'clsx';
import Goo from '@lafleche/gooey-react';
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
  intensity = 'strong',
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
            id="hero-gooey-triangleA-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              stopColor={themeColours.triangleA.a.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.triangleA.b.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.triangleA.c.css()}
              offset="0%"
            />
          </linearGradient>

          <linearGradient
            id="hero-gooey-triangleB-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              stopColor={themeColours.triangleB.a.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.triangleB.b.css()}
              offset="50%"
            />
            <stop
              stopColor={themeColours.triangleB.c.css()}
              offset="100%"
            />
          </linearGradient>

          <linearGradient
            id="hero-gooey-triangleC-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              stopColor={themeColours.triangleC.a.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.triangleC.b.css()}
              offset="50%"
            />
            <stop
              stopColor={themeColours.triangleC.c.css()}
              offset="100%"
            />
          </linearGradient>

          {/* <stop
              stopColor={themeColours.earthy.clay.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.earthy.moss.css()}
              offset="0%"
            />
            <stop
              stopColor={themeColours.earthy.terracotta.css()}
              offset="0%"
            /> */}
          {/* </linearGradient> */}
        </defs>
        <g className={s.blobGroup}>
          {/* Triangle A */}
          <g className={clsx(s.blobSpin, s.triangleA_Animation)}>
            <path
              className={clsx(s.blobShape)}
              d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
              fill="none"
              stroke="url(#hero-gooey-triangleA-gradient)"
              strokeWidth="26"
              strokeLinejoin="round"
              transform="translate(8 28) scale(0.32)"
            />
          </g>
          {/* Triangle B */}
          <g className={clsx(s.blobSpin, s.triangleB_Animation)}>
            <path
              className={clsx(s.blobShape)}
              d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
              fill="none"
              stroke="url(#hero-gooey-triangleB-gradient)"
              strokeWidth="35"
              strokeLinejoin="round"
              transform="translate(50 30) scale(0.3)"
            />
          </g>
          {/* Triangle C */}
          <g className={clsx(s.blobSpin, s.triangleC_Animation)}>
            <path
              className={clsx(s.blobShape)}
              d="M46.2 9.22 A7.6 7.6 0 0 1 53.8 9.22 C71.94 20.36 90.656 52.78 91.232 74.06 A7.6 7.6 0 0 1 87.432 80.64 C68.716 90.78 31.284 90.78 12.568 80.64 A7.6 7.6 0 0 1 8.768 74.06 C9.344 52.78 28.06 20.36 46.2 9.22 Z"
              fill="none"
              stroke="url(#hero-gooey-triangleC-gradient)"
              strokeWidth="15"
              strokeLinejoin="round"
              transform="translate(26 35) scale(0.42)"
            />
          </g>
        </g>
      </svg>
    </Goo>
  );
}
