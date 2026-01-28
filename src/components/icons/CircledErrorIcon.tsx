import type { SVGProps } from 'react';

export default function CircledErrorIcon({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      shapeRendering="geometricPrecision"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <path
        transform="translate(1.2 1)"
        data-error="true"
        d="M20 14v4"
      />
      <path
        transform="translate(1.2 1)"
        data-error="true"
        d="M20 22v.01"
      />
    </svg>
  );
}
