'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/skipToContent.css';
import { useT } from '@/lib/locales/useT';
import Link from 'next/link';

type Props = {
	className?: string;
	href?: string;
};

export default function SkipToContent({ className, href = '#body' }: Props) {
	const t = useT();
	return (
		<Link
			href={href}
			aria-label={t('scroll-cue')}
			className={clsx(className, s.link)}
			data-ui="link"
		>
			*
		</Link>
	);
}
