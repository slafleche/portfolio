import type { SVGProps } from 'react';

export default function SoftTriangleIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 85.109836 82.688241"
      className={className}
      aria-hidden
      {...props}
    >
      <path
        d="m 38.754916,2.3403266 a 7.6,7.6 0 0 1 7.6,0 c 18.14,11.1399954 36.856,43.5599954 37.432,64.8399954 a 7.6,7.6 0 0 1 -3.8,6.58 c -18.716,10.14 -56.148,10.14 -74.8639968,0 a 7.6,7.6 0 0 1 -3.8,-6.58 c 0.576,-21.28 19.2919968,-53.7 37.4319968,-64.8399954 z"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        opacity="0.5"
        transform="translate(21.277459 20.67206025) scale(0.5)"
      />
    </svg>
  );
}
