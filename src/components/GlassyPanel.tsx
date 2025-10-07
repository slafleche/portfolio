'use client';

import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import * as glassyStyles from '@/styles/glassy.css';

export type GlassyPanelProps = PropsWithChildren<{
	className?: string;
	surfaceClassName?: string;
	contentClassName?: string;
	type?: string;
}>;

export default function GlassyPanel({
	className,
	surfaceClassName,
	contentClassName,
	type,
	children,
}: GlassyPanelProps) {
	return (
		<div className={clsx(glassyStyles.frame, className)} data-type={type}>
			<div className={clsx(glassyStyles.surface, surfaceClassName)}>
				{/* Grain */}
				<div className={glassyStyles.grain} aria-hidden />
				{/* Fill, inside */}
				<div className={glassyStyles.surfaceFill} aria-hidden />
				{/* Shine in corner */}
				<div className={glassyStyles.surfaceBorder} aria-hidden />
				{/* Gradient overlay */}
				<div className={glassyStyles.surfaceShine} aria-hidden />
				<div className={clsx(glassyStyles.content, contentClassName)}>
					{children}
				</div>
			</div>
		</div>
	);
}
