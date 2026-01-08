import clsx from 'clsx';
import {
  type ComponentType,
  type CSSProperties,
} from 'react';

import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import SendIcon from '@/components/icons/SendIcon';
import { parseSplit } from '@/lib/locales/translations/splitShortcodes';
import { toTrimmedOrNull } from '@/lib/stringUtils';
import * as s from '@/styles/components/hero.css';
import * as heroTextStyles from '@/styles/components/heroText.css';
import * as layoutStyles from '@/styles/layout.css';

import { GlassPanel } from './GlassPanel';
import HeroGooey from './HeroGooey';
import HeroWaypoint from './HeroWaypoint';
// import VideoByName from './VideoByName';

type HeroCopy = {
  videoTitle: string;
  videoLabel: string;
  videoDescription: string;
  title: string;
  consoleDescription: string;
  videoErrorMessage: string;
  ctaLabel?: string;
  subtitle?: string;
};

type Props = {
  id?: string;
  className?: string;
  copy: HeroCopy;
  withVideo?: boolean;
  overlayClassName?: string;
  headingAnimated?: boolean;
  Gooey?: ComponentType<{ style?: CSSProperties }> | null;
};

export default function Hero({
  id,
  className,
  copy,
  overlayClassName,
  Gooey = HeroGooey,
}: Props) {
  const { first: headingFirstLine, second: headingLastLine } =
    parseSplit(copy.title);
  const headingLabel = toTrimmedOrNull(
    `${headingFirstLine} ${headingLastLine}`,
  );
  // const showVideo = withVideo && !prefersReducedMotion;
  // const showPoster = withVideo && prefersReducedMotion;
  const showCta = Boolean(copy.ctaLabel);

  if (!headingLabel) return null;

  return (
    <>
      <section
        id={id}
        className={clsx(s.root, className)}
        data-heading-animated="false"
      >
        <div
          className={clsx(s.overlays, overlayClassName)}
          aria-hidden
        >
          <div className={s.fullGradient} />
          {Gooey && <Gooey />}
        </div>

        <div className={s.content}>
          <div className={clsx(layoutStyles.panel, s.panel)}>
            <div className={s.glassWrap}>
              <GlassPanel
                contentClassName={s.main}
                surfaceClassNameOverride={s.glassySurfaceOverwrite}
              >
                <div
                  className={heroTextStyles.container}
                  data-hero-text="heroText"
                >
                  <h1
                    data-text={headingLabel}
                    data-static-ready="true"
                    data-ui="heading"
                    className={clsx(
                      s.heading,
                      heroTextStyles.layer,
                      heroTextStyles.master,
                      heroTextStyles.staticHeading,
                    )}
                  >
                    <span
                      className={s.line}
                      data-position={
                        headingLastLine ? 'first' : 'single'
                      }
                      data-text={headingFirstLine}
                    >
                      {headingFirstLine}
                    </span>
                    {headingLastLine ? (
                      <>
                        <br className={s.title_break} />
                        <span
                          className={s.line}
                          data-position="last"
                          data-text={headingLastLine}
                        >
                          {headingLastLine}
                        </span>
                      </>
                    ) : null}
                  </h1>
                </div>
                {copy.subtitle ? (
                  <div
                    className={s.subtitle}
                    data-ready="true"
                  >
                    <p className={s.subtitleMarkdown}>
                      {copy.subtitle}
                    </p>
                  </div>
                ) : null}
                {showCta ? (
                  <ContactDialogTrigger
                    className={s.cta}
                    data-ready="true"
                  >
                    <span>{copy.ctaLabel}</span>
                    <SendIcon className={s.ctaIcon} aria-hidden />
                  </ContactDialogTrigger>
                ) : null}
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>
      <HeroWaypoint />
    </>
  );
}
