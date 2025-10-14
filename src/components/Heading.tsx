'use client';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import * as s from '@/styles/typography.css';

export interface IHeadingDepth {
	depth?: 2 | 3 | 4 | 5 | 6;
}

type Props = IHeadingDepth & {
	className?: string;
	children: ReactNode;
};

export default function Heading({
	depth = 3,
	className,
	children,
}: Props) {
	const Tag = `h${depth || 3}` as 'h3';
	return (
		<Tag className={clsx(s.heading, className)} data-ui="heading">
			{children}
		</Tag>
	);
}
