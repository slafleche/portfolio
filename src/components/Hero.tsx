import clsx from 'clsx';
import * as layoutStyles from '@/styles/layout.css';
import * as s from '@/styles/components/hero.css';
import GlassyPanel from './GlassyPanel';
import VideoByName from './VideoByName';
import Console from './Console';
import { createDomId } from '@/lib/dom';
import { Markdown } from '@/components/Markdown';

type HeroCopy = {
	videoTitle: string;
	videoLabel: string;
	headingFirstLine: string;
	headingLastLine: string;
	subtitle: string;
	consoleDescription: string;
	videoErrorMessage: string;
	ctaLabel?: string;
};

type Props = {
  id?: string;
	className?: string;
	copy: HeroCopy;
	ctaHref?: string;
};
export default function Hero({ id, className, copy, ctaHref }: Props) {
	const consoleId = createDomId('console');
	return (
		<section id={id} className={clsx(s.root, className)}>
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
				errorMessage={copy.videoErrorMessage}
				fallbackLabel={copy.videoLabel}
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
						<Console
							className={s.console}
							description={copy.consoleDescription}
							idBase={consoleId}
						/>
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
							<Markdown
								className={s.paragraph}
								source={copy.subtitle}
							/>
							{copy.ctaLabel ? (
								<a href={ctaHref ?? '#contact'} className={s.cta}>
									{copy.ctaLabel}
								</a>
							) : null}
						</div>
					</GlassyPanel>
				</div>
			</div>
		</section>
	);
}
