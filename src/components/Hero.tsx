'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/hero.css';
import { useT } from '@/lib/locales/useT';
import * as layoutStyles from '@/styles/layout.css';

type Props = {
	className?: string;
};

export default function Hero({ className }: Props) {
	const t = useT();
	return (
		<section className={clsx(s.root, className)}>
			<div className={s.gradient} />
			<div className={layoutStyles.content}>
				<h1 className={s.heading}>{t('hero')}</h1>
				<p className={s.paragraph}>{t('hero-subtitle')}</p>
			</div>
		</section>
	);
}
