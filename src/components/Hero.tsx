'use client';
import clsx from 'clsx';
import * as s from '@/styles/components/hero.css';
import { useT } from '@/lib/locales/useT';
import * as layoutStyles from '@/styles/layout.css';
// import SkipToContent from './SkipToContent';
import GlassyPanel from './GlassyPanel';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import VideoByName from './VideoByName';
import Console from './Console';

type Props = { className?: string };

const inlineMarkdownComponents: Components = {
	p: ({ children }) => <>{children}</>,
};

export default function Hero({ className }: Props) {
	const t = useT();
	return (
		<section className={clsx(s.root, className)}>
			<VideoByName
				name="hero"
				title={t('hero-title')}
				label={t('hero-alt')}
				kind="hero"
				className={s.video}
				autoPlay
				muted
				loop
				playsInline
				playbackRate={2}
				aria-hidden
				role="presentation"
			/>

			{/* Banding-fix overlays (over video, under content) */}
			<div className={s.overlays} aria-hidden>
				<div className={s.grain} />
				<div className={s.wash} />
				<div className={s.centerSoften} />
				<div className={s.ringBreaker} />
			</div>

			{/* <div className={clsx(layoutStyles.content, s.content)}> */}
			<div className={clsx(layoutStyles.panel, s.panel)}>
				<div className={s.vennContainer}>
					<div className={s.consolePanel}>
						<Console className={s.console} />
					</div>
					<GlassyPanel
						className={clsx(s.designPanel)}
						surfaceClassName={s.heroSurface}
						contentClassName={clsx(s.panelContents)}
					>
						<div className={s.vennContents}>
							<h1 className={s.heading}>
								<span
									className={s.line}
									data-position="first"
									data-text={t('hero-title_a')}
								>
									{t('hero-title_a')}
								</span>
								<br className={s.title_break} />
								<span
									className={s.line}
									data-position="last"
									data-text={t('hero-title_b')}
								>
									{t('hero-title_b')}
								</span>
							</h1>
							<p className={s.paragraph}>
								<ReactMarkdown components={inlineMarkdownComponents}>
									{t('hero-subtitle')}
								</ReactMarkdown>
							</p>
						</div>
					</GlassyPanel>
				</div>
				{/* </div> */}
			</div>

			{/* <SkipToContent /> */}
		</section>
	);
}
