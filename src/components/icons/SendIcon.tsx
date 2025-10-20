"use client";

import type { SVGProps } from 'react';
import clsx from 'clsx';

export default function SendIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={clsx(className)}
			aria-hidden
			{...props}
		>
			<path d="M22 2 11 13" />
			<path d="M22 2 15 22 11 13 2 9 22 2" />
		</svg>
	);
}
