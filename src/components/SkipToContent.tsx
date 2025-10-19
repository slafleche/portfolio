import type { ReactNode } from 'react';
import SkipToContentClient from './SkipToContent.client';
import ChevronDown from './ChevronDown';

type Props = {
	className?: string;
	href?: string;
	label: string;
	icon?: ReactNode;
};

export default function SkipToContent({
	className,
	href = '#body',
	label,
	icon,
}: Props) {
	return (
		<SkipToContentClient
			className={className}
			href={href}
			label={label}
			icon={icon ?? <ChevronDown />}
		/>
	);
}
