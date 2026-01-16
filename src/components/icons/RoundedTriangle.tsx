import { clsx } from 'clsx';
import type { SVGProps } from 'react';

import * as s from '@/styles/components/roundedTriangle.css';

import { useSafeId } from '../../lib/dom';
import { themeColours } from '../../tokens/global.tokens';

export default function RoundedTriangle({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  const id = useSafeId('roundedTriangle');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 111.464 110.56"
      className={clsx(s.root, className)}
      aria-hidden
      {...props}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
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
      </defs>
      <path
        d="M51.932 14.5 A7.6 7.6 0 0 1 59.532 14.5 C77.672 25.64 96.388 58.06 96.964 79.34 A7.6 7.6 0 0 1 93.164 85.92 C74.448 96.06 37.016 96.06 18.3 85.92 A7.6 7.6 0 0 1 14.5 79.34 C15.076 58.06 33.792 25.64 51.932 14.5 Z"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="25"
        strokeLinejoin="round"
      />
    </svg>
  );
}
