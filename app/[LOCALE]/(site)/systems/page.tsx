import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import Menu from '@/components/Menu';
import HeroWaypoint from '@/components/HeroWaypoint';
import ContentAsTiles from '@/components/responsive/ContentAsTiles';
import { Markdown } from '@/components/Markdown';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import * as layoutStyles from '@/styles/layout.css';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import * as systemsStyles from '@/styles/components/systems.css';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { resolveLocale } from '@/lib/locales/locale';
import { sharedStrings } from '@/lib/sharedStrings';
import { userContent } from '@/styles/typography.css';
import { parseWordmarkTemplate } from '@/lib/wordmarks/wordmarkText';

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
  const systemsIntroMarkdown = translator('systems-intro');
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
  const systemsShapeBlurbMarkdown = translator(
    'systems-system-shape-blurb',
  );

  const heroCopy = {
    ...heroCopyBase,
    title: translator('systems-hero-title'),
    subtitle: translator('systems-hero-subTitle'),
    ctaLabel: contactCopy.title,
  };

  const menuCopy: ReturnType<typeof buildMenuCopy> =
    buildMenuCopy(translator);
  const homeHref = `/${locale}`;

  const menuProps = {
    root: `/${locale}`,
    homeLabel: menuCopy.homeLabel,
    skipNavLabel: menuCopy.skipNavLabel,
    navLabel: menuCopy.navLabel,
    localeChangeLabel: menuCopy.languageLabel,
    anchorNavLabel: menuCopy.anchorLabel,
    anchorLinks: [
      { title: parseWordmarkTemplate(systemsTitle).fullText, href: `#${systemsIntroId}` },
      { title: parseWordmarkTemplate(systemsPrinciplesTitle).fullText, href: `#${systemsPrinciplesId}` },
      { title: parseWordmarkTemplate(systemsShapeTitle).fullText, href: `#${systemsShapeId}` },
    ],
    localeLinks: AVAILABLE_LOCALES.filter(
      (code) => code !== locale,
    ).map((code) => ({
      locale: code,
      label: LOCALE_LABELS[code],
    })),
  };

  return (
    <>
      <Menu {...menuProps} />
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
          <ContentAsTiles
            id={systemsIntroId}
            title={systemsTitle}
            markdown={systemsIntroMarkdown}
          />
          <ContentAsTiles
            id={systemsPrinciplesId}
            title={systemsPrinciplesTitle}
            markdown={systemsPrinciplesMarkdown}
          />
          <ContentAsTiles
            id={systemsShapeId}
            title={systemsShapeTitle}
            markdown={systemsShapeMarkdown}
          />
          <div className={layoutStyles.content}>
            <Markdown
              source={systemsShapeBlurbMarkdown}
              className={userContent}
            />
          </div>
        </main>
        <Footer
          contact={contactCopy}
          id={contactCopy.href}
          systemsLink={systemsLink}
          hideSystemsLink
          backHref={homeHref}
          backLabel={translator('systems-back-home-label')}
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
