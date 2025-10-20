'use client';
import type { ReactNode } from 'react';

import clsx from 'clsx';
import * as s from '@/styles/layout.css';

type Props = {
	id?: string;
	className?: string;
	children?: ReactNode;
	tag?: string;
};

export default function Content({
	id,
	className,
	tag = 'section',
	children,
}: Props) {
	const Tag = `${tag ?? 'section'}` as 'div';
	return <Tag className={clsx(s.content, className)}>{children}</Tag>;
}
