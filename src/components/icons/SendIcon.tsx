import type { SVGProps } from 'react';

export default function SendIcon({
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
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <g transform="rotate(45 10 10)">
        <g transform="translate(11, -2) scale(-1 1) translate(-12, 0)">
          <path
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </g>
    </svg>
  );
}
