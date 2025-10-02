'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/hero.css';
import { useT } from '@/lib/locales/useT';
import * as layoutStyles from '@/styles/layout.css';
import SkipToContent from './SkipToContent';
import ImageByName from './ImageByName';
import * as glassyStyles from '../styles/glassy.css';

type Props = {
	className?: string;
};

export default function Hero({ className }: Props) {
	const t = useT();
	return (
		<section className={clsx(s.root, className)}>
			<ImageByName
				name="hero"
				alt={t('image_hero-alt')}
				title={t('image_hero-title')}
				className={s.image}
				fit="cover"
				priority
			/>
			{/* <div className={s.gradient} aria-hidden /> */}
			<div className={clsx(layoutStyles.content, s.content)}>
				<div className={clsx(layoutStyles.panel, glassyStyles.bg, s.panel)}>
					<h1 className={s.heading}>{t('hero')}</h1>
					<p className={s.paragraph}>{t('hero-subtitle')}</p>
				</div>
			</div>
			
			<SkipToContent />
			
		</section>
	);
}
