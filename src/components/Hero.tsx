'use client';
import clsx from 'clsx';
import * as layoutStyles from '@/styles/layout.css';
import * as s from '@/styles/components/hero.css';
// import SkipToContent from './SkipToContent';
import GlassyPanel from './GlassyPanel';
import VideoByName from './VideoByName';
import Console from './Console';

type HeroCopy = {
	videoTitle: string;
	videoLabel: string;
	headingFirstLine: string;
	headingLastLine: string;
	subtitleHtml: string;
};

type Props = {
	className?: string;
	copy: HeroCopy;
};
export default function Hero({ className, copy }: Props) {
	return (
		<section className={clsx(s.root, className)}>
			<VideoByName
				name="hero"
				title={copy.videoTitle}
				label={copy.videoLabel}
				kind="hero"
				className={s.video}
				contentWrapClassName={s.contentWrap}
				visualItemClassName={s.visualContent}
				backgroundClassName={s.videoBg}
				autoPlay
				muted
				loop
				playsInline
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
									data-text={copy.headingFirstLine}
								>
									{copy.headingFirstLine}
								</span>
								<br className={s.title_break} />
								<span
									className={s.line}
									data-position="last"
									data-text={copy.headingLastLine}
								>
									{copy.headingLastLine}
								</span>
							</h1>
					<div
						className={s.paragraph}
						dangerouslySetInnerHTML={{ __html: copy.subtitleHtml }}
					/>
						</div>
					</GlassyPanel>
				</div>
				{/* </div> */}
			</div>

			{/* <SkipToContent /> */}
		</section>
	);
}
