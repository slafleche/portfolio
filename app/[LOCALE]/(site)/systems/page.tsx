import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import Content from '@/components/responsive/Content';
import Menu from '@/components/Menu';
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
  const systemsSections = [
    {
      id: translator('systems-process-href'),
      title: translator('systems-process'),
      markdown: translator('systems-process-content'),
    },
    {
      id: translator('systems-describe-href'),
      title: translator('systems-describe'),
      markdown: translator('systems-describe-content'),
    },
    {
      id: translator('systems-architecture-href'),
      title: translator('systems-architecture'),
      markdown: translator('systems-architecture-content'),
    },
    {
      id: translator('systems-express-href'),
      title: translator('systems-express'),
      markdown: translator('systems-express-content'),
    },
    {
      id: translator('systems-integrate-href'),
      title: translator('systems-integrate'),
      markdown: translator('systems-integrate-content'),
    },
    {
      id: translator('systems-resilience-href'),
      title: translator('systems-resilience'),
      markdown: translator('systems-resilience-content'),
    },
    {
      id: translator('systems-ai-href'),
      title: translator('systems-ai'),
      markdown: translator('systems-ai-content'),
    },
  ];

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
          <Content title={systemsTitle} markdown={systemsIntro} />
          {systemsSections.map((section) => (
            <Content
              key={section.id}
              id={section.id}
              title={section.title}
              markdown={section.markdown}
            />
          ))}
        </main>
        <Footer
          contact={contactCopy}
          id={contactCopy.href}
          systemsLink={systemsLink}
        />
        {heroCopy.ctaLabel ? (
          <ContactButton
            watchId="systems-hero"
            label={heroCopy.ctaLabel}
          />
        ) : null}
      </div>
    </>
  );
}
