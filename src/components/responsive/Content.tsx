'use client';
import type {
	ComponentPropsWithoutRef,
	ElementType,
	ReactNode,
} from 'react';

import clsx from 'clsx';
import * as s from '@/styles/layout.css';
import Heading from '../Heading';

type ContentProps<T extends ElementType> = {
	as?: T;
	title?: ReactNode;
	className?: string;
	children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'className' | 'children'>;

export default function Content<T extends ElementType = 'section'>({
	as,
	title,
	className,
	children,
	...rest
}: ContentProps<T>) {
	const Component: ElementType = as ?? 'section';
	return (
		<Component className={clsx(s.content, className)} {...rest}>
			{title ? <Heading className={s.title}>{title}</Heading> : null}
			{children}
		</Component>
	);
}
