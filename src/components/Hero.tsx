import clsx from 'clsx';
import type { ComponentType, SVGProps } from 'react';

import { parseSplit } from '@/lib/locales/translations/splitShortcodes';
import {
  DEFAULT_RENDER_MODE,
  type RenderMode,
} from '@/lib/renderMode';
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
  renderMode?: RenderMode;
  simpleCtaAs?: 'link' | 'button';
  overlayClassName?: string;
  headingAnimated?: boolean;
  TitleSvg?: ComponentType<SVGProps<SVGSVGElement>>;
  Bg?: ComponentType<{ className?: string }> | null;
  hideCta?: boolean;
  hideWaypoint?: boolean;
  hideSubtitle?: boolean;
};

export default function Hero({
  id,
  className,
  copy,
  renderMode = DEFAULT_RENDER_MODE,
  simpleCtaAs = 'link',
  overlayClassName,
  TitleSvg,
  Bg,
  hideCta = false,
  hideWaypoint = false,
  hideSubtitle = false,
}: Props) {
  if (renderMode === 'simple') {
    const titleParts = parseSplit(copy.title);
    const subtitleParts = copy.subtitle
      ? parseSplit(copy.subtitle)
      : null;

    return (
      <section id={id} data-simple-render="Hero.tsx">
        <h1>
          {titleParts.first}
          {titleParts.hasSplit ? (
            <>
              <br />
              {titleParts.second}
            </>
          ) : null}
        </h1>
        {!hideSubtitle && subtitleParts ? (
          <p>
            {subtitleParts.first}
            {subtitleParts.hasSplit ? (
              <>
                <br />
                {subtitleParts.second}
              </>
            ) : null}
          </p>
        ) : null}
        {hideCta ? null : (
          simpleCtaAs === 'button' ? (
            <button type="button" aria-label={copy.ctaLabel}>
              {copy.ctaText}
            </button>
          ) : (
            <a href="#contact" aria-label={copy.ctaLabel}>
              {copy.ctaText}
            </a>
          )
        )}
      </section>
    );
  }

  const titleCopy = splitText(copy.title);
  const subtitleCopy = copy.subtitle
    ? splitText(copy.subtitle)
    : null;

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
                {!hideSubtitle && copy.subtitle ? (
                  <div className={s.subtitle} data-ready="true">
                    <p
                      data-ui="paragraph"
                      className={s.subtitleMarkdown}
                    >
                      {subtitleCopy?.secondLine ? (
                        <span data-split="true">
                          <span data-first="true">
                            {renderInlineMarkdown(
                              subtitleCopy.lastLine ?? '',
                              {
                                openLinksInNewTab: true,
                                asUi: { links: true },
                              },
                              'hero-subtitle-line-1',
                            )}{' '}
                          </span>
                          <br />
                          <span data-last="true">
                            {renderInlineMarkdown(
                              subtitleCopy.secondLine,
                              {
                                openLinksInNewTab: true,
                                asUi: { links: true },
                              },
                              'hero-subtitle-line-2',
                            )}
                          </span>
                        </span>
                      ) : (
                        renderInlineMarkdown(copy.subtitle, {
                          openLinksInNewTab: true,
                          asUi: { links: true },
                        })
                      )}
                    </p>
                  </div>
                ) : null}

                {hideCta ? null : (
                  <HeroCta
                    copy={{
                      ctaLabel: copy.ctaLabel,
                      ctaText: copy.ctaText,
                    }}
                  />
                )}
                {hideWaypoint ? null : <HeroWaypoint />}
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
