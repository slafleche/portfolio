"use client";

import { chevronVars } from '@/styles/vars';
import * as s from '@/styles/components/chevrons.css.ts';
import clsx from 'clsx';
import { useSafeId } from '@/lib/dom';

type Props = {
	className?: string;
};

export default function ChevronDown({ className }: Props = {}) {
	const baseId = useSafeId('chevron');
	const fillGradientId = `${baseId}-fill`;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			className={clsx(className, s.down)}
			viewBox="0 0 99.63319 75.18576"
			fill="none"
		>
			<defs>
				<linearGradient
					id={fillGradientId}
					x1="6.6440969"
					x2="51.109287"
					y1="7.6657295"
					y2="84.075127"
					gradientUnits="userSpaceOnUse"
					gradientTransform="translate(-2.8881965 -17.974125)"
				>
					<stop offset="0" stopColor={chevronVars.fill.css()} />
					<stop
						offset={chevronVars.gradientMidOffset}
						stopColor={chevronVars.gradientMid.css()}
					/>
					<stop
						offset="1"
						stopColor={chevronVars.gradientEnd.css()}
					/>
				</linearGradient>
			</defs>
			<path
				d="M0 0c1.5405086 2.692733 18.973316 33.488343 29.378568 51.022209 2.73562 4.661164 5.121729 9.086001 8.250143 13.964522 1.384599 2.159176 1.3353 2.055376 3.082842 4.117054 1.389141 1.341983 3.253281 1.44644 3.253281 1.44644 0 0 11.212201-3.557371 9.062314-11.174744 C45.729202 51.026922 41.688222 43.385468 37.832833 36.816357 31.778839 26.614787 25.934085 16.105199 19.636347 5.071989 14.973239 4.628784 6.8447639 0.170555 0 0 Z"
				fill={`url(#${fillGradientId})`}
			/>
			<path
				d="M99.63319 0.4439C93.628287 0.35327 85.18265 3.91632 80.972387 4.101916 67.528064 31.723966 62.002268 46.811232 53.027148 59.375481c-2.288689 3.20393-5.571707 7.366925-7.300672 8.566616-2.919511 2.025783-4.153123 2.183211-5.014923 1.161688 6.674831 7.294571 12.197002 5.911669 13.915603 5.893188 1.339301-0.0051 5.352898-3.846235 6.247633-5.396032C61.769524 68.051145 77.067114 46.839526 88.396728 22.067184 91.402274 15.49552 96.216798 9.874057 99.63319 0.4439 Z"
				fill={chevronVars.highlight.css()}
			/>
		</svg>
	);
}
