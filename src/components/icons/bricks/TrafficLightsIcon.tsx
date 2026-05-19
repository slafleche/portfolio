import type { SVGProps } from 'react';

export default function TrafficLightsIcon({
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
      <path d="M7 7A5 5 0 0 1 12 2 5 5 0 0 1 17 7V17A5 5 0 0 1 12 22 5 5 0 0 1 7 17z" />
      <path d="M11 7A1 1 0 1 0 13 7 1 1 0 1 0 11 7M11 12A1 1 0 1 0 13 12 1 1 0 1 0 11 12M11 17A1 1 0 1 0 13 17 1 1 0 1 0 11 17" />
    </svg>
  );
}
