'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/hero.css';
import { useT } from '@/lib/locales/useT';
import * as layoutStyles from '@/styles/layout.css';
import SkipToContent from './SkipToContent';
import * as glassyStyles from '../styles/glassy.css';
import { GodRays } from './GodRays';
import { godRaysVars } from '../styles/godrays';

type Props = {
	className?: string;
};

export default function Hero({ className }: Props) {
	const t = useT();
	return (
		<section className={clsx(s.root, className)}>
			{/* <div className={s.gradient} /> */}
			<GodRays
				config={godRaysVars}
				image={{
					name: 'hero',
					title: t('image_portrait-title'),
					alt: t('image_portrait-alt'),
				}}
			/>
			<div className={layoutStyles.content}>
				<div className={clsx(layoutStyles.panel, glassyStyles.bg)}>
					<h1 className={s.heading}>{t('hero')}</h1>
					<p className={s.paragraph}>{t('hero-subtitle')}</p>
				</div>
				<SkipToContent />
			</div>
		</section>
	);
}
