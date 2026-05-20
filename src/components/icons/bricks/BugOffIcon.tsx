import type { SVGProps } from 'react';

export default function BugOffIcon({
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
      <path d="M12 20V12M12.656 7H14A4 4 0 0 1 18 11V12.344M14.12 3.88 16 2M17.123 17.123A6 6 0 0 1 6 14V11A4 4 0 0 1 7.72 7.713M2 2 22 22" />
      <path d="M21 5A4 4 0 0 1 17.45 8.97M22 13H18.656M3 21A4 4 0 0 1 6.81 17M3 5A4 4 0 0 0 6.55 8.97M6 13H2M8 2 9.88 3.88M9.712 4.06A3 3 0 0 1 15 6V7.13" />
    </svg>
  );
}
