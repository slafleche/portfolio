import * as s from '@/styles/components/tempalates/heroHeadingToSvg.css';

import HeroTitleTemplate from '../../../../src/assets/HeroTitleTemplate';
import { loadTranslator } from '../../../../src/lib/locales/sections/helpers.locale';
import { colorVars } from '../../../../src/tokens/global.tokens';

export default async function HeroHeadingSvgDebugPage() {
  const translatorEn = await loadTranslator('en');
  const translatorFr = await loadTranslator('fr');

  const homeCopy = {
    en: translatorEn('hero-title'),
    fr: translatorFr('hero-title'),
  };

  const systemsCopy = {
    en: translatorEn('systems-hero-title'),
    fr: translatorFr('systems-hero-title'),
  };

  const shadowDefault = {
    x: 2,
    y: 2,
    color: colorVars.black.lighten(0.2).css(),
    opacity: 0.8,
    blur: 1,
  };

  return (
    <div data-ignore="true" id="container" className={s.root}>
      <p data-ignore="true">FR - Hero Home</p>

      <div
        data-target="viewport"
        className={s.viewPort}
        data-page="home"
        data-locale="fr"
      >
        <HeroTitleTemplate
          copy={homeCopy.fr}
          firstLineClassName={s.homeFirstLine_fr}
          secondLineClassName={s.homeSecondLine_fr}
          locale={'fr'}
          shadow={shadowDefault}
        />
      </div>
      <p data-ignore="true">En - Hero Home</p>
      <div
        data-target="viewport"
        className={s.viewPort}
        data-page="home"
        data-locale="en"
      >
        <HeroTitleTemplate
          copy={homeCopy.en}
          firstLineClassName={s.homeFirstLine_en}
          secondLineClassName={s.homeSecondLine_en}
          locale={'en'}
          shadow={shadowDefault}
        />
      </div>

      <p data-ignore="true">FR - Hero Systems</p>

      <div
        data-target="viewport"
        className={s.viewPort}
        data-page="systems"
        data-locale="fr"
      >
        <HeroTitleTemplate
          className={s.systemsTitle}
          firstLineClassName={s.systemsFirstLine_fr}
          secondLineClassName={s.systemsSecondLine_fr}
          copy={systemsCopy.fr}
          locale={'fr'}
          shadow={shadowDefault}
        />
      </div>
      <p data-ignore="true">En - Hero Systems</p>
      <div
        data-target="viewport"
        className={s.viewPort}
        data-page="systems"
        data-locale="en"
      >
        <HeroTitleTemplate
          className={s.systemsTitle}
          firstLineClassName={s.systemsFirstLine_en}
          secondLineClassName={s.systemsSecondLine_en}
          copy={systemsCopy.en}
          locale={'en'}
          shadow={shadowDefault}
        />
      </div>
    </div>
  );
}
