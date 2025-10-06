'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/hero.css';
import { useT } from '@/lib/locales/useT';
import * as layoutStyles from '@/styles/layout.css';
import SkipToContent from './SkipToContent';
import GlassyPanel from './GlassyPanel';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import VideoByName from './VideoByName';

type Props = { className?: string };

const inlineMarkdownComponents: Components = {
	p: ({ children }) => <>{children}</>,
};

export default function Hero({ className }: Props) {
	const t = useT();
	return (
		<section className={clsx(s.root, className)}>
			<VideoByName
				name="hero-circles"
				posterAlt=""
				title=""
				kind="hero"
				className={clsx(s.video)}
				autoPlay
				muted
				loop
				playsInline
				priority
			/>

			{/* Banding-fix overlays (over video, under content) */}
			<div className={s.overlays} aria-hidden>
				<div className={s.grain} />
				<div className={s.wash} />
				<div className={s.centerSoften} />
				<div className={s.ringBreaker} />
			</div>

			<div className={clsx(layoutStyles.content, s.content)}>
				<GlassyPanel surfaceClassName={clsx(layoutStyles.panel, s.panel)}>
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
