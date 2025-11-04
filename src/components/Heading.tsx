import type {
	ComponentPropsWithoutRef,
	ReactNode,
} from 'react';

export interface IHeadingDepth {
	depth?: 2 | 3 | 4 | 5 | 6;
}

type HeadingProps = IHeadingDepth &
	ComponentPropsWithoutRef<'h2'> & {
		children: ReactNode;
	};

export default function Heading({
	depth = 3,
	className,
	children,
	id,
	...rest
}: HeadingProps) {
	const Tag = `h${depth || 2}` as 'h2';
	return (
		<Tag
			id={id}
			className={className}
			data-ui="heading"
			{...rest}
		>
			{children}
		</Tag>
	);
}
