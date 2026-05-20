import type { SVGProps } from 'react';

export default function BookCheckIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H19A1 1 0 0 1 20 3V21A1 1 0 0 1 19 22H6.5A1 1 0 0 1 6.5 17H20" />
      <path d="M9 9.5 11 11.5 15 7.5" />
    </svg>
  );
}
