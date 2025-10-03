'use client';

import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import * as glassyStyles from '@/styles/glassy.css';

export type GlassyPanelProps = PropsWithChildren<{
	/** Optional wrapper classes */
	className?: string;
	/** Optional classes applied to the frosted surface */
	surfaceClassName?: string;
	/** Disable the rim highlight if false */
	showRim?: boolean;
}>;

export default function GlassyPanel({
	className,
	surfaceClassName,
	children,
}: GlassyPanelProps) {
	return (
		<div className={clsx(glassyStyles.frame, className)}>
			<div className={clsx(glassyStyles.surface, surfaceClassName)}>
				{/* Grain */}
				<div className={glassyStyles.grain} aria-hidden />
				{/* Fill, inside */}
				<div className={glassyStyles.surfaceFill} aria-hidden />
				{/* Shine in corner */}
				<div className={glassyStyles.surfaceBorder} aria-hidden />
				{/* Gradient overlay */}
				<div className={glassyStyles.surfaceShine} aria-hidden />
				{children}
			</div>
		</div>
	);
}

// {showRim ? <div className={glassyStyles.rim} aria-hidden /> : null}
