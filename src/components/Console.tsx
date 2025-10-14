'use client';

import clsx from 'clsx';
import * as s from '@/styles/components/console.css';
import type { ReactNode } from 'react';

type ConsoleLine = {
	content: ReactNode;
	variant?: 'comment';
};

type Props = {
	className?: string;
	title?: string;
	lines?: ConsoleLine[];
};

const defaultLines: ConsoleLine[] = [
	{
		content: (
			<>
				<span className={s.accent}>const</span> designer =
				createHybridMaker(
				{'{'}
			</>
		),
	},
	{
		content: (
			<>
				&nbsp;&nbsp;experience:{' '}
				<span className={s.accent}>'product & ui'</span>,
			</>
		),
	},
	{
		content: (
			<>
				&nbsp;&nbsp;toolkit: ['React', 'VS Code', 'Vanilla Extract'],
			</>
		),
	},
	{
		content: (
			<>&nbsp;&nbsp;ship: () =&gt; craftDelightfulInterfaces(),</>
		),
	},
	{
		content: <>{'})'};</>,
	},
	{
		variant: 'comment',
		content: <>// no npm install for this skillset</>,
	},
	{
		content: (
			<>if (me.project.expectations &gt;= you.expectations) {'{'}</>
		),
	},
	{
		content: (
			<>
				&nbsp;&nbsp;console.log(
				<span className={s.accent}>"Running hireMe.mjs..."</span>
				);
			</>
		),
	},
	{
		content: <> &nbsp;&nbsp;yarn run hireMe.mjs;</>,
	},
	{
		content: <>{'}'}</>,
	},
];

export default function Console({
	className,
	title = 'portfolio.tsx',
	lines = defaultLines,
}: Props) {
	return (
		<div className={clsx(s.root, className)}>
			<div className={s.header}>
				<span className={s.windowDot} aria-hidden />
				<span
					className={s.windowDot}
					data-variant="warn"
					aria-hidden
				/>
				<span
					className={s.windowDot}
					data-variant="success"
					aria-hidden
				/>
				<span className={s.title}>{title}</span>
			</div>
			<div className={s.body}>
				{lines.map((line, idx) => (
					<div key={idx} className={s.line}>
						<span className={s.lineNumber}>{idx + 1}</span>
						<span
							className={clsx(
								s.code,
								line.variant === 'comment' && s.comment,
							)}
						>
							{line.content}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
