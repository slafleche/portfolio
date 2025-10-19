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
	description?: string;
	idBase?: string;
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
	title = 'stéphane_portfolio.tsx',
	lines = defaultLines,
	description = 'Decorative code backdrop',
	idBase,
}: Props) {
	const baseId = idBase ?? 'console';
	const hintId = `${baseId}-hintId`;
	const describedById = `${baseId}-describedById`;
	return (
		<div
			className={clsx(s.root, className)}
			role="group"
			aria-label={'Computer console with code'}
			aria-describedby={describedById}
		>
			<div className={s.header} aria-hidden>
				<span className={s.windowDot} />
				<span className={s.windowDot} data-variant="warn" />
				<span className={s.windowDot} data-variant="success" />
				<span className={s.title} id={hintId}>
					{title}
				</span>
			</div>

			<p id={describedById} data-visible="sc-only">
				{description}
			</p>
			<code className={s.body}>
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
			</code>
		</div>
	);
}
