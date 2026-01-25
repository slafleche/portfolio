import type { CSSProperties } from 'react';

import { getLocaleSvgs } from '@/assets/SVG/generated/headingsAsSvgs';
import Hero from '@/components/Hero';
import ShareImageHeroBg from '@/components/ShareImageHeroBg';
import { AVAILABLE_LOCALES, type Locale } from '@/data/locales';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import * as s from '@/styles/components/shareImage.css';

const SHARE_IMAGE_SIZES = [
  {
    width: 1200,
    height: 630,
    bg: {
      roundedTransform: {
        translateXPercent: 12,
        translateYPercent: 0,
        rotationDeg: -5,
        scale: 1,
      },
      nubbyTransform: {
        translateXPercent: -20,
        translateYPercent: -5,
        rotationDeg: 10,
        scale: 1,
      },
    },
  },
  {
    width: 1200,
    height: 675,
    bg: {
      roundedTransform: {
        translateXPercent: 12,
        translateYPercent: 0,
        rotationDeg: -5,
        scale: 1,
      },
      nubbyTransform: {
        translateXPercent: -20,
        translateYPercent: -5,
        rotationDeg: 10,
        scale: 1,
      },
    },
  },
] as const;

export default async function ShareImageDebugPage() {
  const translators = await Promise.all(
    AVAILABLE_LOCALES.map((locale) => loadTranslator(locale)),
  );
  const heroCopy = Object.fromEntries(
    AVAILABLE_LOCALES.map((locale, index) => [
      locale,
      buildHeroCopy(translators[index]),
    ]),
  ) as Record<Locale, ReturnType<typeof buildHeroCopy>>;

  return (
    <div className={s.debugRoot}>
      {AVAILABLE_LOCALES.map((locale) => {
        const localeSvgs = getLocaleSvgs(locale);
        const copy = heroCopy[locale];

        return SHARE_IMAGE_SIZES.map((size) => {
          const sizeLabel = `${size.width}x${size.height}`;
          const shareStyle = {
            width: `${size.width}px`,
            height: `${size.height}px`,
          } as CSSProperties;

          return (
            <div key={`${locale}-${sizeLabel}`}>
              <p className={s.debugLabel}>
                {locale.toUpperCase()} - {sizeLabel}
              </p>
              <div
                className={s.viewport}
                data-target="share-image-viewport"
                data-locale={locale}
                data-size={sizeLabel}
                style={shareStyle}
              >
                <Hero
                  className={s.heroOverride}
                  copy={copy}
                  TitleSvg={localeSvgs.home.heroHeading}
                  Bg={(props) => (
                    <ShareImageHeroBg
                      {...props}
                      roundedTransform={size.bg.roundedTransform}
                      nubbyTransform={size.bg.nubbyTransform}
                    />
                  )}
                  hideCta={true}
                  hideSubtitle={true}
                  hideWaypoint={true}
                />
              </div>
            </div>
          );
        });
      })}
    </div>
  );
}
