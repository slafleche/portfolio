import * as s from '@/styles/components/card.css.ts';
import type { ReactNode } from 'react';
import Heading, { type IHeadingDepth } from './Heading';
import clsx from 'clsx';
import * as glassFrameStyles from '@/styles/helpers/glassFrame.css';

type Props = IHeadingDepth & {
	title?: ReactNode;
	children?: ReactNode;
	className?: string;
	type?: string;
};

export default function Card({
	title,
	depth = 2,
	className,
	type,
	children,
}: Props) {
	const gradientClass =
		type === 'right' ? s.cardGradientB : s.cardGradientA;

	return (
		<div className={clsx(s.root, className)} data-type={type}>
			<div className={clsx(glassFrameStyles.frame, s.frame)}>
				<div
					className={clsx(s.gradient, gradientClass)}
					aria-hidden
				/>
				<div className={glassFrameStyles.surfaceBorder} aria-hidden />
				<div className={glassFrameStyles.rim} aria-hidden />
				<div className={s.content}>
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
