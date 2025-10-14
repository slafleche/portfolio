'use client';
import * as s from '@/styles/components/card.css.ts';
import type { ReactNode } from 'react';
import Heading, { type IHeadingDepth } from './Heading';
import clsx from 'clsx';

type Props = IHeadingDepth & {
	title?: ReactNode;
	children?: ReactNode;
	className?: string;
	gradient?: 'a' | 'b';
};

export default function Card({
	title,
	depth = 2,
	className,
	gradient = 'a',
	children,
}: Props) {
	return (
		<div className={clsx(s.root, className)}>
			<div
				className={clsx(
					s.gradient,
					gradient === 'a' ? s.cardGradientA : s.cardGradientB,
				)}
			>
				<div style={{ opacity: 0 }}>
					{title && (
						<Heading className={s.title} depth={depth}>
							{title}
						</Heading>
					)}
					{children}
				</div>
			</div>
		</div>
	);
}
