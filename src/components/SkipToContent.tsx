import type { ReactNode } from 'react';
import SkipToContentClient from './SkipToContent.client';
import ChevronDown from './icons/ChevronDown';
import * as chevronStyles from '@/styles/components/chevrons.css';

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
			icon={icon ?? <ChevronDown className={chevronStyles.down} />}
		/>
	);
}
