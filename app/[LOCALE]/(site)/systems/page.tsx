import { SkipNavContent } from '@/components/SkipNavContent';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import Content from '@/components/responsive/Content';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import * as layoutStyles from '@/styles/layout.css';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import * as systemsStyles from '@/styles/components/systems.css';

type SystemsPageParams = Promise<{ LOCALE: string }>;

export default async function SystemsPage({
  params,
}: {
  params: SystemsPageParams;
}) {
  const { LOCALE } = await params;
  const translator = await loadTranslator(LOCALE);

  const heroCopyBase = buildHeroCopy(translator);
  const contactCopy = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(LOCALE, translator);
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
  ];

  const heroCopy = {
    ...heroCopyBase,
    headingFirstLine: translator('systems-title_a'),
    headingLastLine: translator('systems-title_b'),
    ctaLabel: contactCopy.title,
  };

  return (
    <SkipNavContent id="body">
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
    </SkipNavContent>
  );
}
