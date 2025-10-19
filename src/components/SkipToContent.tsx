'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/skipToContent.css';
import Link from 'next/link';
import { useCallback } from 'react';
import type { MouseEventHandler } from 'react';
import ChevronDown from './ChevronDown';

type Props = {
	className?: string;
	href?: string;
	label: string;
};

export default function SkipToContent({
	className,
	href = '#body',
	label,
}: Props) {
	const handleClick = useCallback<
		MouseEventHandler<HTMLAnchorElement>
	>(
		(event) => {
			if (typeof window === 'undefined') return;
			if (!href.startsWith('#')) return;
			const targetId = href.slice(1);
			if (!targetId) return;
			const target = document.getElementById(targetId) as HTMLElement;
			if (!target) return;
			event.preventDefault();
			target.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
			if (typeof target.focus === 'function') {
				const previousTabIndex = target.getAttribute('tabindex');
				if (previousTabIndex == null) {
					target.setAttribute('tabindex', '-1');
					target.addEventListener(
						'blur',
						() => {
							target.removeAttribute('tabindex');
						},
						{ once: true },
					);
				}
				target.focus({
					preventScroll: true,
				});
			}
		},
		[
			href,
		],
	);

	return (
		<div className={s.root}>
			<Link
				href={href}
				onClick={handleClick}
				aria-label={label}
				className={clsx(className, s.link)}
				data-ui="link"
			>
				<ChevronDown />
			</Link>
		</div>
	);
}
