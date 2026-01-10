import clsx from 'clsx';
import { marked } from 'marked';
import type { ComponentType, CSSProperties, SVGProps } from 'react';

import ContactDialogTrigger from '@/components/contact/ContactDialogTrigger';
import SendIcon from '@/components/icons/SendIcon';
import * as s from '@/styles/components/hero.css';
import * as layoutStyles from '@/styles/layout.css';

import splitText from '../styles/helpers/textSplit';
import { GlassPanel } from './GlassPanel';
import HeroGooey from './HeroGooey';
import HeroWaypoint from './HeroWaypoint';

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
  Gooey?: ComponentType<{ style?: CSSProperties }> | null;
};

export default function Hero({
  id,
  className,
  copy,
  overlayClassName,
  Gooey = HeroGooey,
  TitleSvg,
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
          <div className={overlayClassName ?? s.fullGradient} />
          {Gooey && <Gooey />}
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
                      dangerouslySetInnerHTML={{
                        __html:
                          typeof marked.parseInline(copy.subtitle) ===
                          'string'
                            ? marked.parseInline(copy.subtitle)
                            : '',
                      }}
                    ></p>
                  </div>
                ) : null}

                <>
                  <ContactDialogTrigger
                    className={s.cta}
                    data-ready="true"
                    aria-label={copy.ctaLabel}
                  >
                    <span className={s.ctaText}>{copy.ctaText}</span>
                    <SendIcon className={s.ctaIcon} aria-hidden />
                  </ContactDialogTrigger>
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
