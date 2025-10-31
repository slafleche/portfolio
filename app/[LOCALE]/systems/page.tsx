import { SkipNavContent } from '@/components/SkipNavContent';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ContactButton from '@/components/ContactButton';
import Content from '@/components/responsive/Content';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildHeroCopy } from '@/lib/locales/sections/hero.locale';
import * as layoutStyles from '@/styles/layout.css';
import type { PageParams } from '@/styles/helpers/types';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import * as systemsStyles from '@/styles/components/systems.css';

type SystemsPageProps = {
  params: Promise<PageParams>;
};

export default async function SystemsPage({
  params,
}: SystemsPageProps) {
  const { LOCALE } = await params;
  const translator = await loadTranslator(LOCALE);

  const heroCopyBase = buildHeroCopy(translator);
  const contactCopy = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(LOCALE, translator);
  const systemsTitle = translator('systems-title');
  const systemsMarkdown = translator('systems-content');
  const systemsTitleFirstLine = translator('systems-title_a');
  const systemsTitleLastLine = translator('systems-title_b');

  const systemsHeroCopy = {
    ...heroCopyBase,
    headingFirstLine: systemsTitleFirstLine,
    headingLastLine: systemsTitleLastLine,
    ctaLabel: contactCopy.title,
  };

  return (
    <SkipNavContent id="body">
      <div className={layoutStyles.page}>
        <main className={layoutStyles.main}>
          <Hero
            id="systems-hero"
            copy={systemsHeroCopy}
            ctaHref={`#${contactCopy.href}`}
            overlayClassName={systemsStyles.heroOverlay}
            withVideo={false}
            headingAnimated={false}
          />
          <Content title={systemsTitle} markdown={systemsMarkdown} />
        </main>
        <Footer
          contact={contactCopy}
          id={contactCopy.href}
          systemsLink={systemsLink}
        />
        {systemsHeroCopy.ctaLabel ? (
          <ContactButton
            watchId="systems-hero"
            href={`#${contactCopy.href}`}
            label={systemsHeroCopy.ctaLabel}
          />
        ) : null}
      </div>
    </SkipNavContent>
  );
}
