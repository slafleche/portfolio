'use client';
import * as s from '@/styles/components/card.css.ts';
import type { ReactNode } from 'react';
import Heading, { IHeadingDepth } from './Heading';
import clsx from 'clsx';

type Props = IHeadingDepth & {
	title?: ReactNode;
	children?: ReactNode;
	className?: string;
};

export default function Card({ title, depth = 3, className, children }: Props) {
	return (
		<div className={clsx(s.card, className)}>
			<div className={s.fakeBorder}>
				<div className={s.bgHelper}>
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
