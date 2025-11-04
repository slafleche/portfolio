import type { SVGProps } from 'react';

export default function SocialLinkedInIcon({
	className,
	...props
}: SVGProps<SVGSVGElement>) {
	/* TODO: swap to importing `@/assets/SVG/linkedin.svg` once Turbopack supports our SVGR loader */
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden
			{...props}
		>
			<path d="M4.983 3.5c0 1.381-1.11 2.5-2.483 2.5C1.111 6 0 4.881 0 3.5 0 2.119 1.111 1 2.5 1s2.483 1.119 2.483 2.5zM.257 23h4.486V8.74H.257V23zM8.746 8.74h4.297v1.952h.061c.598-1.077 2.062-2.214 4.244-2.214 4.537 0 5.373 2.984 5.373 6.868V23h-4.486v-6.58c0-1.57-.028-3.586-2.186-3.586-2.189 0-2.524 1.712-2.524 3.474V23H8.746z" />
		</svg>
	);
}
