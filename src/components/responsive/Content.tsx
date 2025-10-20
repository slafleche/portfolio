'use client';
import type {
	ComponentPropsWithoutRef,
	ElementType,
	ReactNode,
} from 'react';

import clsx from 'clsx';
import { marked } from 'marked';
import * as s from '@/styles/layout.css';
import Heading from '../Heading';
import * as userContentStyles from '@/styles/components/userContent.css';

type BaseProps<T extends ElementType> = {
	tag?: T;
	title?: ReactNode;
	className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'className' | 'children'>;

type MarkdownOnly = {
	markdown: string;
	children?: never;
};

type ChildrenOnly = {
	markdown?: undefined;
	children?: ReactNode;
};

type ContentProps<T extends ElementType> = BaseProps<T> &
	(MarkdownOnly | ChildrenOnly);

export default function Content<T extends ElementType = 'section'>({
	tag,
	title,
	className,
	markdown,
	children,
	...rest
}: ContentProps<T>) {
	const Component: ElementType = tag ?? 'section';

	if (
		process.env.NODE_ENV !== 'production' &&
		typeof markdown === 'string' &&
		children !== undefined
	) {
		console.error(
			'Content: pass either `markdown` or `children`, but not both.',
		);
	}

	const renderedBody =
		typeof markdown === 'string'
			? (
					<div
						className={userContentStyles.userContent}
						dangerouslySetInnerHTML={{
							__html: (() => {
								const parsed = marked.parse(markdown);
								return typeof parsed === 'string' ? parsed : '';
							})(),
						}}
					/>
				)
			: children;

	return (
		<Component className={clsx(s.content, className)} {...rest}>
			{title ? <Heading className={s.title}>{title}</Heading> : null}
			{renderedBody}
		</Component>
	);
}
