'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/hero.css';
import { useT } from '@/lib/locales/useT';
import * as layoutStyles from '@/styles/layout.css';
import SkipToContent from './SkipToContent';
import ImageByName from './ImageByName';
import GlassyPanel from './GlassyPanel';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

type Props = {
	className?: string;
};

const inlineMarkdownComponents: Components = {
	p: ({ children }) => <>{children}</>,
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
				<GlassyPanel
					surfaceClassName={clsx(layoutStyles.panel, s.panel)}
				>
					<h1 className={s.heading}>
						<ReactMarkdown components={inlineMarkdownComponents}>
							{t('hero')}
						</ReactMarkdown>
					</h1>
					<p className={s.paragraph}>
						<ReactMarkdown components={inlineMarkdownComponents}>
							{t('hero-subtitle')}
						</ReactMarkdown>
					</p>
				</GlassyPanel>
			</div>

			<SkipToContent />
		</section>
	);
}
