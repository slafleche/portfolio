'use client';
import type { ReactNode } from 'react';

import clsx from 'clsx';
import * as s from '@/styles/layout.css';

type Props = {
	children?: ReactNode;
	className?: string;
};

export default function Content({ className, children }: Props) {
	return <div className={clsx(s.content, className)}>{children}</div>;
}
