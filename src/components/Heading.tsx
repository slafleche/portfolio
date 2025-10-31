import type { ReactNode } from 'react';

export interface IHeadingDepth {
	depth?: 2 | 3 | 4 | 5 | 6;
}

type Props = IHeadingDepth & {
	className?: string;
	children: ReactNode;
	id?: string;
};

export default function Heading({
	depth = 3,
	className,
	children,
	id,
}: Props) {
	const Tag = `h${depth || 2}` as 'h2';
	return (
		<Tag
			id={id}
			className={className}
			data-ui="heading"
		>
			{children}
		</Tag>
	);
}
