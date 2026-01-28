import type { SVGProps } from 'react';

export default function BlocksIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      shapeRendering="geometricPrecision"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2" />
      <rect
        x="14"
        y="2"
        width="8"
        height="8"
        rx="1"
        transform="scale(0.9) translate(4.5 -5.5) rotate(22) "
      />
    </svg>
  );
}
