import clsx from 'clsx';
import * as layoutStyles from '@/styles/layout.css';
import * as s from '@/styles/components/hero.css';
import VideoByName from './VideoByName';
import { Markdown } from '@/components/Markdown';
import HeroHeading from './HeroHeading.client';
import { toTrimmedOrNull } from '@/lib/stringUtils';

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

export default function Hero({ id, className, copy }: Props) {
  const headingLabel = toTrimmedOrNull(
    `${copy.headingFirstLine} ${copy.headingLastLine}`,
  );
  if (!headingLabel) return null;

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

      <div className={clsx(layoutStyles.content, s.content)}>
        <div className={clsx(layoutStyles.panel, s.panel)}>
          <div className={s.bridge}>
            <HeroHeading
              label={headingLabel}
              // debugStage="initial"
            >
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
            </HeroHeading>
            <Markdown
              className={s.paragraph}
              source={copy.subtitle}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
