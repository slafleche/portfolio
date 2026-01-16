import clsx from 'clsx';
import type { ComponentType, SVGProps } from 'react';

import * as s from '@/styles/components/hero.css';
import * as layoutStyles from '@/styles/layout.css';

import splitText from '../styles/helpers/textSplit';
import { GlassPanel } from './GlassPanel';
import { HeroCta } from './HeroCta';
import HeroWaypoint from './HeroWaypoint';
import { renderInlineMarkdown } from './Markdown';

type HeroCopy = {
  title: string;
  ctaLabel: string;
  ctaText: string;
  subtitle?: string;
};

type Props = {
  id?: string;
  className?: string;
  copy: HeroCopy;
  overlayClassName?: string;
  headingAnimated?: boolean;
  TitleSvg?: ComponentType<SVGProps<SVGSVGElement>>;
  Bg?: ComponentType<{ className?: string }> | null;
};

export default function Hero({
  id,
  className,
  copy,
  overlayClassName,
  TitleSvg,
  Bg,
}: Props) {
  const titleCopy = splitText(copy.title);

  return (
    <>
      <section
        id={id}
        className={clsx(s.root, className)}
        data-heading-animated="false"
      >
        <div className={clsx(s.overlays)} aria-hidden>
          {Bg ? (
            <Bg className={s.fullGradient} />
          ) : (
            <div className={overlayClassName ?? s.fullGradient} />
          )}
        </div>

        <div className={s.content}>
          <div className={clsx(layoutStyles.panel, s.panel)}>
            <div className={s.glassWrap}>
              <GlassPanel
                className={s.glassPanel}
                contentClassName={clsx(s.main, layoutStyles.content)}
                surfaceClassNameOverride={s.glassySurfaceOverwrite}
              >
                <div
                  className={s.container}
                  data-hero-text="heroText"
                >
                  <h1 data-visible="sc-only">{titleCopy.fullText}</h1>

                  {TitleSvg && (
                    <TitleSvg className={s.titleAsSvg} aria-hidden />
                  )}
                </div>
                {copy.subtitle ? (
                  <div className={s.subtitle} data-ready="true">
                    <p
                      data-ui="paragraph"
                      className={s.subtitleMarkdown}
                    >
                      {renderInlineMarkdown(copy.subtitle, {
                        openLinksInNewTab: true,
                        asUi: { links: true },
                      })}
                    </p>
                  </div>
                ) : null}

                <>
                  <HeroCta
                    copy={{
                      ctaLabel: copy.ctaLabel,
                      ctaText: copy.ctaText,
                    }}
                  />
                  <HeroWaypoint />
                </>
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
