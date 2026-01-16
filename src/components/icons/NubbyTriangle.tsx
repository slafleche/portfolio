import { clsx } from 'clsx';
import type { SVGProps } from 'react';

import * as s from '@/styles/components/nubbyTriangle.css';

import { useSafeId } from '../../lib/dom';
import { themeColours } from '../../tokens/global.tokens';

export default function NubbyTriangle({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  const id = useSafeId('nubbyTriangle');
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 39.810337 36.951881"
      // viewBox="0 0 24 24"
      // fill="none"
      // stroke="currentColor"

      className={clsx(s.root, className)}
      aria-hidden
      {...props}
    >
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
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
      <path
        d="m 19.905168,3.575 c 8.7815,0 6.1789,4.348 10.0685,11.086 3.8909,6.738 8.9583,6.659 4.5669,14.264 -4.3901,7.605 -6.8549,3.176 -14.6354,3.176 -7.7805,0 -10.2453004,4.429 -14.6354004,-3.176 -4.3914,-7.605 0.676,-7.526 4.5669,-14.264 C 13.726268,7.923 11.123668,3.575 19.905168,3.575 Z"
        stroke={`url(#${id})`}
        fill="none"
        strokeWidth="7.15"
      />
    </svg>
  );
}

//   <path
//     d="m 19.905168,3.575 c 8.7815,0 6.1789,4.348 10.0685,11.086 3.8909,6.738 8.9583,6.659 4.5669,14.264 -4.3901,7.605 -6.8549,3.176 -14.6354,3.176 -7.7805,0 -10.2453004,4.429 -14.6354004,-3.176 -4.3914,-7.605 0.676,-7.526 4.5669,-14.264 C 13.726268,7.923 11.123668,3.575 19.905168,3.575 Z"
//     stroke="url(#1)"
//     stroke-width="7.15"
//     fill="none"
//     id="path1-6"
//     style="fill: none; fill-opacity: 1; stroke: #000000; stroke-opacity: 1"
//   />
// </svg>
