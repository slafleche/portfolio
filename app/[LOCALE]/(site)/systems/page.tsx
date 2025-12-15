import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import Content from '@/components/responsive/Content';
import Menu from '@/components/Menu';
import HeroWaypoint from '@/components/HeroWaypoint';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import * as layoutStyles from '@/styles/layout.css';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import * as systemsStyles from '@/styles/components/systems.css';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import {
  buildHomeMenuSections,
  buildSystemsMenuSections,
} from '@/lib/locales/sections/menuSections';
import { canonicalToLocalizedSlugs } from '@/lib/routes/localeSlugs';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { resolveLocale } from '@/lib/locales/locale';
import { sharedStrings } from '@/lib/sharedStrings';

type SystemsPageParams = Promise<{ LOCALE: string }>;

export default async function SystemsPage({
  params,
}: {
  params: SystemsPageParams;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);

  const heroCopyBase = buildHeroCopy(translator);
  const contactCopy = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(locale, translator);
  const systemsTitle = translator('systems-title');
  const systemsIntro = translator('systems-intro');
  const systemsIntroId = translator('systems-intro-href');
  const systemsPrinciplesId = translator('systems-principles-href');
  const systemsPrinciplesTitle = translator('systems-principles');
  const systemsPrinciplesMarkdown = translator(
    'systems-principles-content',
  );
  const systemsShapeId = translator('systems-system-shape-href');
  const systemsShapeTitle = translator('systems-system-shape');
  const systemsShapeMarkdown = translator(
    'systems-system-shape-content',
  );

  const heroCopy = {
    ...heroCopyBase,
    headingFirstLine: translator('systems-title_a'),
    headingLastLine: translator('systems-title_b'),
    ctaLabel: contactCopy.title,
  };

  const menuCopy = buildMenuCopy(translator);
  const menuSections = buildHomeMenuSections(translator);
  const systemsMenuSections = buildSystemsMenuSections(translator);
  const curiosityMessages = {
    title: translator('console-curiosity-title'),
    test: translator('console-curiosity-test'),
    result: translator('console-curiosity-result'),
    hint: translator('console-curiosity-hint'),
  };
  const systemsSlug =
    canonicalToLocalizedSlugs[locale]?.systems ?? 'systems';
  const curiosityTarget = `/${locale}/${systemsSlug}`;

  const menuProps = {
    root: `/${locale}`,
    skipNavLabel: menuCopy.skipNavLabel,
    leftLabel: menuCopy.leftLabel,
    rightLabel: menuCopy.rightLabel,
    localeChangeLabel: menuCopy.languageLabel,
    sections: menuSections,
    systemsSections: systemsMenuSections,
    localeLinks: AVAILABLE_LOCALES.filter(
      (code) => code !== locale,
    ).map((code) => ({
      locale: code,
      label: LOCALE_LABELS[code],
    })),
  };

  return (
    <>
      <Menu
        {...menuProps}
        curiosityMessages={{
          title: curiosityMessages.title,
          test: curiosityMessages.test,
          result: curiosityMessages.result,
          hint: curiosityMessages.hint,
          targetHref: curiosityTarget,
        }}
        logoRedirectPaths={[
          curiosityTarget,
        ]}
      />
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
          <Hero
            id="systems-hero"
            copy={heroCopy}
            overlayClassName={systemsStyles.heroOverlay}
            withVideo={false}
            headingAnimated={false}
          />
          <HeroWaypoint />
          <Content
            id={systemsIntroId}
            title={systemsTitle}
            markdown={systemsIntro}
          />
          <Content
            id={systemsPrinciplesId}
            title={systemsPrinciplesTitle}
            markdown={systemsPrinciplesMarkdown}
          />
          <Content
            id={systemsShapeId}
            title={systemsShapeTitle}
            markdown={systemsShapeMarkdown}
          />
        </main>
        <Footer
          contact={contactCopy}
          id={contactCopy.href}
          systemsLink={systemsLink}
        />
        {heroCopy.ctaLabel ? (
          <ContactButton
            watchId={sharedStrings.heroWaypointId}
            label={heroCopy.ctaLabel}
          />
        ) : null}
      </div>
    </>
  );
}
