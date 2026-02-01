import type { Metadata } from 'next';

import DeferredIsland from '@/components/DeferredIsland';
import Footer from '@/components/Footer';
import Heading from '@/components/Heading';
import { Markdown } from '@/components/Markdown';
import Menu from '@/components/Menu';
import Content from '@/components/responsive/Content';
import SiteProviders from '@/components/site/SiteProviders.client';
import { AVAILABLE_LOCALES, LOCALE_LABELS } from '@/data/locales';
import { getSocialImageByName } from '@/lib/images';
import { resolveLocale } from '@/lib/locales/locale';
import { buildContactCopy } from '@/lib/locales/sections/contact.locale';
import { buildContactFormCopy } from '@/lib/locales/sections/form.locale';
import { loadTranslator } from '@/lib/locales/sections/helpers.locale';
import { buildMenuCopy } from '@/lib/locales/sections/menu.locale';
import { buildPrivacyCopy } from '@/lib/locales/sections/privacy.locale';
import { canonicalToLocalizedSlugs } from '@/lib/routes/localeSlugs';
import { buildSystemsLink } from '@/lib/routes/systemsLink';
import { getSiteOrigin } from '@/lib/runtimeEnv';
import { readSimpleHtml } from '@/server/simpleHtml/readSimpleHtml';
import * as layoutStyles from '@/styles/layout.css';

type ArchitecturePageParams = Promise<{ LOCALE: string }>;

export async function generateMetadata({
  params,
}: {
  params: ArchitecturePageParams;
}): Promise<Metadata> {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const translator = await loadTranslator(locale);
  const origin = getSiteOrigin();
  if (!origin) return {};

  const slug =
    canonicalToLocalizedSlugs[locale]?.architecture ?? 'architecture';

  const languages: Record<string, string> = Object.fromEntries(
    AVAILABLE_LOCALES.map((code) => {
      const localizedSlug =
        canonicalToLocalizedSlugs[code]?.architecture ??
        'architecture';
      return [
        code,
        `${origin}/${code}/${localizedSlug}`,
      ];
    }),
  );
  languages['x-default'] = `${origin}/en/architecture`;

  const canonicalUrl = `${origin}/${locale}/${slug}`;
  const openGraphImageUrl = getSocialImageByName(locale, '1200x630');
  const twitterImageUrl = getSocialImageByName(locale, '1200x675');

  const title = translator('architecture-meta-title');
  const description = translator('architecture-meta-description');
  const keywords = translator('architecture-meta-keywords');

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      locale,
      alternateLocale: AVAILABLE_LOCALES.filter(
        (code) => code !== locale,
      ),
      images: openGraphImageUrl
        ? [
            {
              url: openGraphImageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: twitterImageUrl
        ? [
            twitterImageUrl,
          ]
        : undefined,
    },
  };
}

export default async function ArchitecturePage({
  params,
}: {
  params: ArchitecturePageParams;
}) {
  const { LOCALE } = await params;
  const locale = resolveLocale(LOCALE);
  const simpleHtml = await readSimpleHtml({
    locale,
    route: 'architecture',
  });
  const translator = await loadTranslator(locale);
  const contactFormCopy = buildContactFormCopy(translator);
  const privacyCopy = buildPrivacyCopy(translator);
  const closeLabel = translator('close-label');

  const contactCopy = buildContactCopy(translator);
  const systemsLink = buildSystemsLink(locale, translator);
  const menuCopy: ReturnType<typeof buildMenuCopy> =
    buildMenuCopy(translator);

  const heading =
    locale === 'fr'
      ? 'Architecture de ce site web'
      : "This Websites's Architecture";
  const description =
    locale === 'fr'
      ? 'Une vue d’ensemble du système : patterns, outillage, et flux de livraison.'
      : 'A high-level look at the system: patterns, tooling, and delivery workflow.';

  const menuProps = {
    root: `/${locale}`,
    locale,
    homeLabel: menuCopy.homeLabel,
    skipNavLabel: menuCopy.skipNavLabel,
    navLabel: menuCopy.navLabel,
    localeChangeLabel: menuCopy.languageLabel,
    anchorNavLabel: menuCopy.anchorLabel,
    ctaLabel: contactCopy.labelFloating,
    localeLinks: AVAILABLE_LOCALES.filter(
      (code) => code !== locale,
    ).map((code) => ({
      locale: code,
      label: LOCALE_LABELS[code],
    })),
  };

  return (
    <>
      <SiteProviders
        formCopy={contactFormCopy}
        privacyCopy={privacyCopy}
        closeLabel={closeLabel}
      >
        <Menu {...menuProps} />
        <div className={layoutStyles.page}>
          <main id="main" className={layoutStyles.main} tabIndex={-1}>
            <section className={layoutStyles.sectionSpacing}>
              <Content tag="div">
                <Heading ignoreDataUI={true}>{heading}</Heading>
                <p data-ui="paragraph">{description}</p>
                <Markdown
                  source={translator('architecture-main-content')}
                />
              </Content>
            </section>
          </main>
          <DeferredIsland when="idle">
            <Footer
              contact={contactCopy}
              id="contact"
              systemsLink={systemsLink}
            />
          </DeferredIsland>
        </div>
      </SiteProviders>
    </>
  );
}
