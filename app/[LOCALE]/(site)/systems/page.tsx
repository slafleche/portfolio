import Link from 'next/link';

import { getLocaleSvgs } from '@/assets/SVG/generated/headingsAsSvgs';
import DeferredIsland from '@/components/DeferredIsland';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import { Markdown } from '@/components/Markdown';
import Menu from '@/components/Menu';
import ContentAsTiles from '@/components/responsive/ContentAsTiles';
import SiteProviders from '@/components/site/SiteProviders.client';
import SystemsGooeyLazy from '@/components/SystemsGooeyLazy.client';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { resolveLocale } from '@/lib/locales/locale';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import { sharedStrings } from '@/lib/sharedStrings';
import { parseWordmarkTemplate } from '@/lib/wordmarks/wordmarkText';
import { getTurnstileSiteKey } from '@/server/turnstile/getTurnstileSiteKey';
import * as layoutStyles from '@/styles/layout.css';

import ContentWithTitle from '../../../../src/components/responsive/ContentWithTitle';
import SystemsBgOverlay from '../../../../src/components/SystemsBgOverlay';
import WordMarkInTitle from '../../../../src/components/WordmarkInTitle';
import NPMWordmark from '../../../../src/components/wordmarks/NPMWordmark';
import {
  npmLinkInTitle,
  npmLinkInTitleIcon,
  npmLinkInTitleLink,
} from '../../../../src/styles/typography.css';

type SystemsPageParams = Promise<{ LOCALE: string }>;

export default async function SystemsPage({
  params,
}: {
  params: SystemsPageParams;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);
  const contactFormCopy = buildContactFormCopy(translator);
  const privacyCopy = buildPrivacyCopy(translator);
  const closeLabel = translator('close-label');
  const turnstileSiteKey = getTurnstileSiteKey();

  const heroCopyBase = buildHeroCopy(translator);
  const contactCopy = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(locale, translator);
  const systemsTitle = translator('systems-title');
  const systemsIntroMarkdown = translator('expertise-content');
  const systemsIntroId = translator('systems-intro-href');
  const systemsPrinciplesId = translator('systems-principles-href');
  const systemsPrinciplesTitle = translator('systems-principles');
  const systemsPrinciplesMarkdown = translator('principles-content');
  const systemsShapeId = translator('systems-architecture-href');
  const systemsShapeTitle = translator('systems-architecture');
  const systemsShapeMarkdown = translator('architecture-content');
  const systemsShapeBlurbMarkdown = translator('blurb-content');
  const localeSvgs = getLocaleSvgs(locale);
  const heroCopy = {
    ...heroCopyBase,
    title: translator('systems-hero-title'),
    subtitle: translator('systems-hero-subtitle'),
    ctaLabel: contactCopy.labelHero,
  };

  const menuCopy: ReturnType<typeof buildMenuCopy> =
    buildMenuCopy(translator);

  const homeHref = `/${locale}`;

  const menuProps = {
    root: `/${locale}`,
    locale,
    homeLabel: menuCopy.homeLabel,
    skipNavLabel: menuCopy.skipNavLabel,
    navLabel: menuCopy.navLabel,
    localeChangeLabel: menuCopy.languageLabel,
    anchorNavLabel: menuCopy.anchorLabel,
    anchorLinks: [
      {
        title: parseWordmarkTemplate(systemsTitle).fullText,
        href: `#${systemsIntroId}`,
      },
      {
        title: parseWordmarkTemplate(systemsPrinciplesTitle).fullText,
        href: `#${systemsPrinciplesId}`,
      },
      {
        title: parseWordmarkTemplate(systemsShapeTitle).fullText,
        href: `#${systemsShapeId}`,
      },
      {
        title: 'CSS Calipers',
        href: '#css-calipers',
      },
      {
        title: contactCopy.title,
        href: '#contact',
      },
    ],
    localeLinks: AVAILABLE_LOCALES.filter(
      (code) => code !== locale,
    ).map((code) => ({
      locale: code,
      label: LOCALE_LABELS[code],
    })),
    ctaLabel: contactCopy.labelFloating,
    ctaWatchId: sharedStrings.heroWaypointId,
  };

  return (
    <SiteProviders
      formCopy={contactFormCopy}
      privacyCopy={privacyCopy}
      closeLabel={closeLabel}
      turnstileSiteKey={turnstileSiteKey}
    >
      <Menu {...menuProps} />

      <div className={layoutStyles.page}>
        <SystemsBgOverlay className={layoutStyles.svgOverlay} />
        <main className={layoutStyles.main}>
          <Hero
            id="systems-hero"
            copy={heroCopy}
            headingAnimated={false}
            TitleSvg={localeSvgs.systems.heroHeading}
            Gooey={() => (
              <DeferredIsland when="visible">
                <SystemsGooeyLazy />
              </DeferredIsland>
            )}
          />
          <DeferredIsland when="idle">
            <ContentAsTiles
              id={systemsIntroId}
              title={systemsTitle}
              markdown={systemsIntroMarkdown}
            />
            <hr />
            <ContentAsTiles
              id={systemsPrinciplesId}
              title={systemsPrinciplesTitle}
              markdown={systemsPrinciplesMarkdown}
              bgOffset={2}
              rotateOffset={3}
              scaleOffset={1}
              translateOffset={4}
            />
            <hr />
            <ContentAsTiles
              id={systemsShapeId}
              title={systemsShapeTitle}
              markdown={systemsShapeMarkdown}
              bgOffset={5}
              rotateOffset={1}
              scaleOffset={4}
              translateOffset={3}
            />
            <hr />
            <ContentWithTitle id="css-calipers">
              <WordMarkInTitle
                WordMark={NPMWordmark}
                ignoreDataUI={true}
                textTemplate={translator('css_calipers')}
                wordMarkClassName={npmLinkInTitleIcon}
                linkClassName={npmLinkInTitleLink}
                linkUrl={'https://www.npmjs.com/package/css-calipers'}
                depth={2}
              />
              <Markdown source={systemsShapeBlurbMarkdown} />
            </ContentWithTitle>
          </DeferredIsland>
        </main>
        <DeferredIsland when="idle">
          <Footer
            contact={contactCopy}
            id="contact"
            systemsLink={systemsLink}
            hideSystemsLink
            backHref={homeHref}
            backLabel={translator('systems-back-home-label')}
          />
        </DeferredIsland>
      </div>
    </SiteProviders>
  );
}
