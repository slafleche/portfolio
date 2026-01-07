import clsx from 'clsx';
import type { SVGProps } from 'react';

import * as s from '@/styles/components/closeIcon.css';

type CloseIconProps = SVGProps<SVGSVGElement> & {
  label: string;
};

export default function CloseIcon({
  label,
  className,
  ...props
}: CloseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
      className={clsx(s.closeIcon, className)}
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
