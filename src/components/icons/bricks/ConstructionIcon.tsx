import type { SVGProps } from 'react';

export default function ConstructionIcon({
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
      <rect width="20" height="8" x="2" y="6" rx="1" />
      <path d="M17 14V21M7 14V21M17 3V6M7 3V6M10 14 2.3 6.3M14 6 21.7 13.7M8 6 16 14" />
    </svg>
  );
}
