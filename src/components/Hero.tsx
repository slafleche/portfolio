import clsx from 'clsx';
import { type ComponentType, type CSSProperties } from 'react';

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

type HeroCopy = {
  title: string;
  ctaLabel?: string;
  subtitle?: string;
};

type Props = {
  id?: string;
  className?: string;
  copy: HeroCopy;
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

  const showCta = Boolean(copy.ctaLabel);

  if (!headingLabel) return null;

  return (
    <>
      <section
        id={id}
        className={clsx(s.root, className)}
        data-heading-animated="false"
      >
        <div className={clsx(s.overlays)} aria-hidden>
          <div className={overlayClassName ?? s.fullGradient} />
          {Gooey && <Gooey />}
        </div>

        <div className={s.content}>
          <div className={clsx(layoutStyles.panel, s.panel)}>
            <div className={s.glassWrap}>
              <GlassPanel
                className={s.glassPanel}
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
                      // heroTextStyles.layer,
                      // heroTextStyles.master,
                      // heroTextStyles.staticHeading,
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
                  <div className={s.subtitle} data-ready="true">
                    <p className={s.subtitleMarkdown}>
                      {copy.subtitle}
                    </p>
                  </div>
                ) : null}
                {showCta ? (
                  <>
                    <ContactDialogTrigger
                      className={s.cta}
                      data-ready="true"
                    >
                      <span className={s.ctaText}>{copy.ctaLabel}</span>
                      <SendIcon className={s.ctaIcon} aria-hidden />
                    </ContactDialogTrigger>
                    <HeroWaypoint />
                  </>
                ) : null}
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
