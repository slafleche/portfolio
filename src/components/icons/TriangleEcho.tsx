import { clsx } from 'clsx';
import type { SVGProps } from 'react';

import * as s from '@/styles/components/triangleEcho.css';

export default function TriangleEcho({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      // viewBox="0 0 24 24"
      // fill="none"
      // stroke="currentColor"

      className={clsx(s.root, className)}
      aria-hidden
      {...props}
    ></svg>
  );
}
